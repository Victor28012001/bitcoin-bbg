// // systems/BitcoinCore.js
// export class BitcoinCore {
//   constructor() {
//     this.rpcUrl = 'http://127.0.0.1:18443'; // Default Bitcoin Core RPC
//     this.rpcUser = 'polaruser';
//     this.rpcPassword = 'polarpass';
//     this.connected = false;
//   }

//   async connect() {
//     try {
//       // Test connection to Bitcoin Core
//       const response = await this.rpcCall('getblockchaininfo', []);
//       this.connected = true;
//       console.log('Bitcoin Core connected:', response);
//       return true;
//     } catch (error) {
//       console.error('Failed to connect to Bitcoin Core:', error);
//       return false;
//     }
//   }

//   async rpcCall(method, params = []) {
//     const response = await fetch(this.rpcUrl, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Basic ' + btoa(`${this.rpcUser}:${this.rpcPassword}`)
//       },
//       body: JSON.stringify({
//         jsonrpc: '1.0',
//         id: 'game',
//         method: method,
//         params: params
//       })
//     });

//     if (!response.ok) {
//       throw new Error(`RPC call failed: ${response.statusText}`);
//     }

//     const data = await response.json();
//     return data.result;
//   }

//   // Get player's Bitcoin balance
//   async getBalance(address) {
//     try {
//       // For better privacy, you might want to use address indexing
//       // or track balances separately
//       const utxos = await this.rpcCall('listunspent', [0, 9999999, [address]]);
//       return utxos.reduce((total, utxo) => total + utxo.amount, 0);
//     } catch (error) {
//       console.error('Error getting balance:', error);
//       return 0;
//     }
//   }

//   // Create transaction for in-game purchases
//   async createTransaction(fromAddress, toAddress, amount, privateKey) {
//     // Note: In production, handle private keys securely!
//     const utxos = await this.rpcCall('listunspent', [0, 9999999, [fromAddress]]);
    
//     // Simple transaction creation (you'd want more robust logic)
//     const transaction = {
//       inputs: utxos,
//       outputs: [{
//         address: toAddress,
//         value: Math.floor(amount * 100000000) // Convert to satoshis
//       }]
//     };

//     return transaction;
//   }
// }
// systems/BitcoinCore.js
export class BitcoinCore {
  constructor() {
    this.rpcUrl = 'http://localhost:3001/bitcoin-rpc';
    this.connected = false;
    this.mockMode = false;
  }

  async connect() {
    try {
      console.log('Attempting to connect to Bitcoin Core via proxy...');
      
      // First, test if proxy server is alive
      try {
        const healthResponse = await fetch('http://localhost:3001/health');
        if (!healthResponse.ok) {
          throw new Error('Proxy server not healthy');
        }
        console.log('✓ Proxy server is running');
      } catch (proxyError) {
        console.warn('Proxy server not available, using mock mode');
        this.mockMode = true;
        this.connected = true;
        return true;
      }

      // Test Bitcoin Core connection through proxy
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: 'getblockchaininfo',
          params: []
        })
      });

      const data = await response.json();
      
      if (data.error && data.mock) {
        console.warn('Bitcoin Core not available, using mock mode');
        this.mockMode = true;
      } else {
        console.log('✓ Bitcoin Core connected via proxy');
        this.mockMode = false;
      }
      
      this.connected = true;
      return true;
    } catch (error) {
      console.warn('Failed to connect to Bitcoin Core, using mock mode:', error.message);
      this.connected = true; // Allow game to continue
      this.mockMode = true;
      return true;
    }
  }

  async rpcCall(method, params = []) {
    // Use mock responses if in mock mode
    if (this.mockMode) {
      return this.getMockResponse(method, params);
    }

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          method: method,
          params: params
        })
      });

      const data = await response.json();
      
      if (data.error && data.mock) {
        console.warn(`RPC call ${method} failed, using mock data`);
        return data.result; // Return mock result from proxy
      }
      
      return data.result;
    } catch (error) {
      console.warn(`RPC call ${method} failed, using mock data:`, error.message);
      return this.getMockResponse(method, params);
    }
  }

  getMockResponse(method, params) {
    // Your existing mock responses...
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
          address: params?.[2]?.[0] || 'bcrt1qmockaddress',
          label: '',
          scriptPubKey: 'mock_script',
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
}