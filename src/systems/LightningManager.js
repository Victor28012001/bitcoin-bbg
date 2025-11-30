export class LightningManager {
  constructor() {
    // Use the proxy server instead of direct LND connection
    this.lndUrl = 'http://localhost:3001/lnd-api';
    this.connected = false;
    this.mockMode = true; // Start in mock mode
  }

  async connect() {
    try {
      console.log('Attempting to connect to Lightning Network via proxy...');
      
      // Test connection through proxy
      const info = await this.lndCall('GET', '/v1/getinfo');
      
      if (info.error && info.mock) {
        console.warn('LND not available, using mock mode');
        this.mockMode = true;
      } else {
        console.log('✓ Lightning Network connected via proxy');
        this.mockMode = false;
      }
      
      this.connected = true;
      return true;
    } catch (error) {
      console.warn('Failed to connect to Lightning Network, using mock mode:', error.message);
      this.connected = true;
      this.mockMode = true;
      return true;
    }
  }

  async lndCall(method, endpoint, body = null) {
    // Use mock responses if in mock mode
    if (this.mockMode) {
      return this.getMockResponse(endpoint, body);
    }

    try {
      const response = await fetch(`${this.lndUrl}${endpoint}`, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null
      });

      const data = await response.json();
      
      if (data.error && data.mock) {
        console.warn(`LND call ${endpoint} failed, using mock data`);
        return data.result; // Return mock result from proxy
      }
      
      return data;
    } catch (error) {
      console.warn(`LND call ${endpoint} failed, using mock data:`, error.message);
      return this.getMockResponse(endpoint, body);
    }
  }

  // Add mock response method - FIXED: Remove Buffer usage
  getMockResponse(endpoint, body) {
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
        payment_request: `lnbc10u1p3xnk5cpp5xcprxghx2un59c25d29kuh0j4mrxjl0nas8d0pfy8t5w4tccxq7sdqqcqzzgxqyz5vqsp5wfd4ye54g0t5x35x2p3j96e8a4r1p7l8e64qkq0zds4q9qypysqqqqqqqqqqqqqqqqqqqsqqqqqysgqdamjr4e8k77j5t2k5s8yft62vyn3h2x5cqn3mnma2kz8vj2s3x0qk2gp3q7n4nux2u8qyesswj5r8krksc9qyyssq83qv64m5m4kftj90f4q3q3vj3qj3qlc4q3j3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q8qypqsqpc9qyyssq83qv64m5m4kftj90f4q3q3vj3qj3qlc4q3j3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q3q8qypqsp5qy8jq0q`,
        add_index: '1',
        payment_addr: 'mock_payment_addr',
        // FIXED: Use browser-compatible base64 encoding
        r_hash: btoa(`mock_hash_${Date.now()}`) // btoa is available in browsers
      },
      '/v1/balance/channels': {
        balance: '1000000',
        pending_open_balance: '0',
        local_balance: { sat: '500000' },
        remote_balance: { sat: '500000' }
      }
    };

    return mockResponses[endpoint] || { settled: true, state: 'SETTLED' };
  }

  // Mock implementations for game functionality
  async createInvoice(amount, memo = 'Game Purchase') {
    const invoice = await this.lndCall('POST', '/v1/invoices', {
      value: amount,
      memo: memo,
      expiry: '3600'
    });

    return invoice;
  }

  async checkInvoice(paymentHash) {
    const invoice = await this.lndCall('GET', `/v1/invoice/${paymentHash}`);
    return invoice.settled;
  }

  // Pay a Lightning invoice
  async payInvoice(paymentRequest) {
    const payment = await this.lndCall('POST', '/v1/channels/transactions', {
      payment_request: paymentRequest
    });

    return payment;
  }

  // Create game-specific payment channels
  async createGameChannel(nodePubkey, localFundingAmount) {
    const channel = await this.lndCall('POST', '/v1/channels', {
      node_pubkey: nodePubkey,
      local_funding_amount: localFundingAmount,
      push_sat: 0,
      private: true
    });

    return channel;
  }
}