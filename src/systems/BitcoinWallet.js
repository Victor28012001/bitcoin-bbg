// systems/BitcoinWallet.js
import { BitcoinCore } from './BitcoinCore.js';
import { LightningManager } from './LightningManager.js';

export class BitcoinWallet {
  constructor() {
    this.bitcoinCore = new BitcoinCore();
    this.lightningManager = new LightningManager();
    this.wallets = new Map(); // playerId -> wallet data
  }

  async init() {
    await this.bitcoinCore.connect();
    await this.lightningManager.connect();
  }

  // Create or load player wallet
  async getPlayerWallet(playerId) {
    if (!this.wallets.has(playerId)) {
      // In a real game, you'd want more secure key management
      const wallet = await this.createWallet();
      this.wallets.set(playerId, wallet);
    }
    return this.wallets.get(playerId);
  }

  async createWallet() {
    // For demo purposes - use a proper HD wallet in production
    const privateKey = await this.generatePrivateKey();
    const address = await this.getAddressFromPrivateKey(privateKey);
    
    return {
      privateKey,
      address,
      balance: 0,
      lightningBalance: 0
    };
  }

  // Generate private key (simplified - use proper crypto in production)
  async generatePrivateKey() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  // Get address from private key (simplified)
  async getAddressFromPrivateKey(privateKey) {
    // In production, use proper Bitcoin address generation
    return `bc1q${privateKey.slice(0, 40)}`; // Simplified for demo
  }

  // Get total player balance (on-chain + lightning)
  async getPlayerBalance(playerId) {
    const wallet = await this.getPlayerWallet(playerId);
    const onChainBalance = await this.bitcoinCore.getBalance(wallet.address);
    
    return {
      onChain: onChainBalance,
      lightning: wallet.lightningBalance,
      total: onChainBalance + wallet.lightningBalance
    };
  }
}