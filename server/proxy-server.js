import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
const PORT = 3001;

// Manual CORS middleware - more reliable than cors() package
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Grpc-Metadata-macaroon');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'proxy-server-running', timestamp: new Date().toISOString() });
});

// Bitcoin RPC proxy with better error handling
app.post('/bitcoin-rpc', async (req, res) => {
  try {
    const { method, params } = req.body;
    
    console.log(`Proxying Bitcoin RPC: ${method}`, params);
    
    const response = await fetch('http://127.0.0.1:18443', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from('polaruser:polarpass').toString('base64')
      },
      body: JSON.stringify({
        jsonrpc: '1.0',
        id: 'game',
        method: method,
        params: params || []
      })
    });

    if (!response.ok) {
      throw new Error(`Bitcoin Core responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`✓ RPC ${method} successful`);
    
    res.json(data);
  } catch (error) {
    console.error('Bitcoin RPC proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to connect to Bitcoin Core',
      details: error.message,
      mock: true,
      result: getMockBitcoinResponse(req.body.method, req.body.params)
    });
  }
});

// Mock responses for when Bitcoin Core is unavailable
function getMockBitcoinResponse(method, params) {
  const mockResponses = {
    'getblockchaininfo': {
      chain: 'regtest',
      blocks: 150,
      headers: 150,
      bestblockhash: 'mock_hash_123',
      difficulty: 4.656542373906925e-10,
      mediantime: 1234567890,
      verificationprogress: 1,
      initialblockdownload: false,
      chainwork: '0000000000000000000000000000000000000000000000000000000000000002',
      size_on_disk: 1234567,
      pruned: false,
      warnings: ''
    },
    'getbalance': 1.5,
    'listunspent': [
      {
        txid: 'mock_txid_1',
        vout: 0,
        address: 'bcrt1qmockaddress123456789',
        label: '',
        scriptPubKey: '0014mockscriptpubkey123456789',
        amount: 1.0,
        confirmations: 100,
        spendable: true,
        solvable: true,
        safe: true
      }
    ]
  };

  return mockResponses[method] || null;
}

// LND REST API proxy - specific routes instead of wildcard
app.get('/lnd-api/v1/getinfo', async (req, res) => {
  await handleLndRequest(req, res, 'GET', '/v1/getinfo');
});

app.post('/lnd-api/v1/invoices', async (req, res) => {
  await handleLndRequest(req, res, 'POST', '/v1/invoices');
});

app.get('/lnd-api/v1/invoice/:paymentHash', async (req, res) => {
  await handleLndRequest(req, res, 'GET', `/v1/invoice/${req.params.paymentHash}`);
});

app.get('/lnd-api/v1/balance/channels', async (req, res) => {
  await handleLndRequest(req, res, 'GET', '/v1/balance/channels');
});

// Generic LND handler
async function handleLndRequest(req, res, method, endpoint) {
  try {
    console.log(`Proxying LND call: ${method} ${endpoint}`);
    
    // Use mock responses for now - comment out when LND is ready
    const mockData = getMockLNDResponse(endpoint, method);
    res.json(mockData);
    
    // Uncomment this when you have LND running:
    const lndUrl = `https://localhost:8080${endpoint}`;
    
    const response = await fetch(lndUrl, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Grpc-Metadata-macaroon': await getMacaroon()
      },
      body: req.body ? JSON.stringify(req.body) : null,
      rejectUnauthorized: false
    });

    if (!response.ok) {
      throw new Error(`LND responded with status: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
    
  } catch (error) {
    console.error('LND proxy error:', error.message);
    res.status(500).json({ 
      error: 'Failed to connect to LND',
      details: error.message,
      mock: true,
      result: getMockLNDResponse(endpoint, method)
    });
  }
}

// Helper function to get macaroon
async function getMacaroon() {
  try {
    console.log('Reading macaroon file...');
    return 'mock_macaroon_for_development';
  } catch (error) {
    console.log('Using mock macaroon for development');
    return 'mock_macaroon_for_development';
  }
}

// Mock LND responses
function getMockLNDResponse(url, method) {
  const mockResponses = {
    '/v1/getinfo': {
      identity_pubkey: 'mock_pubkey_123',
      alias: 'Mock LND Node',
      num_pending_channels: 0,
      num_active_channels: 3,
      num_peers: 2,
      block_height: 150,
      block_hash: 'mock_block_hash',
      synced_to_chain: true,
      testnet: true,
      chains: [{ chain: 'bitcoin', network: 'regtest' }],
      uris: ['mock@localhost:9735'],
      best_header_timestamp: '1234567890',
      version: '0.15.5-mock'
    },
    '/v1/invoices': {
      payment_request: 'lnbc10u1p3xnk5cpp5xcprxghx2un59c25d29kuh0j4mrxjl0nas8d0pfy8t5w4tccxq7sdqqcqzzgxqyz5vqsp5wfd4ye54g0t5x35x2p3j96e8a4r1p7l8e64qkq0zds4q9qypysqqqqqqqqqqqqqqqqqqqsqqqqqysgqdamjr4e8k77j5t2k5s8yft62vyn3h2x5cqn3mnma2kz8vj2s3x0qk2gp3q7n4nux2u8qyesswj5r8krksc9qyyssq83qv64m5m4kftj90f4q3q3vj3qj3qlc4q3j3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q8qypqsqpc9qyyssq83qv64m5m4kftj90f4q3q3vj3qj3qlc4q3j3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q8qypqsp5qy8jq0q',
      add_index: '1',
      payment_addr: 'mock_payment_addr',
      // FIXED: Use simple string instead of Buffer
      r_hash: `mock_hash_${Date.now()}`
    },
    '/v1/balance/channels': {
      balance: '1000000',
      pending_open_balance: '0',
      local_balance: { sat: '500000' },
      remote_balance: { sat: '500000' }
    }
  };

  return mockResponses[url] || { 
    settled: true, 
    state: 'SETTLED',
    message: 'Mock LND response'
  };
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 CORS proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying Bitcoin RPC from: http://127.0.0.1:18443`);
  console.log(`⚡ LND API available at: http://localhost:${PORT}/lnd-api/`);
  console.log(`🌐 CORS enabled for development servers`);
});