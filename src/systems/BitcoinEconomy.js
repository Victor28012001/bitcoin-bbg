// // systems/BitcoinEconomy.js
// import { BitcoinCore } from './BitcoinCore.js';
// import { LightningManager } from './LightningManager.js';
// import { BitcoinWallet } from './BitcoinWallet.js';

// export class BitcoinEconomy {
//   constructor() {
//     this.walletManager = new BitcoinWallet();
//     this.itemPrices = new Map(); // itemId -> price in satoshis
//     this.rewardRates = new Map(); // action -> reward in satoshis
//     this.initialized = false;
//   }

//   async init() {
//     if (this.initialized) return;
    
//     try {
//       await this.walletManager.init();
//       this.setupDefaultPrices();
//       this.setupDefaultRewards();
//       this.initialized = true;
//       console.log('Bitcoin economy initialized');
//     } catch (error) {
//       console.error('Failed to initialize Bitcoin economy:', error);
//       throw error;
//     }
//   }

//   setupDefaultPrices() {
//     // Define item prices in satoshis
//     this.itemPrices.set('ammo_pack', 1000); // 1000 sats per ammo pack
//     this.itemPrices.set('health_pack', 2000);
//     this.itemPrices.set('armor', 5000);
//     this.itemPrices.set('special_weapon', 10000);
//   }

//   setupDefaultRewards() {
//     // Define rewards for game actions
//     this.rewardRates.set('enemy_kill', 100);
//     this.rewardRates.set('level_complete', 1000);
//     this.rewardRates.set('achievement', 500);
//     this.rewardRates.set('spider_kill', 50);
//     this.rewardRates.set('rake_kill', 200);
//   }

//   // Purchase item with Bitcoin
//   async purchaseItem(playerId, itemId, useLightning = true) {
//     if (!this.initialized) throw new Error('Bitcoin economy not initialized');
    
//     const price = this.itemPrices.get(itemId);
//     if (!price) throw new Error('Item not found');

//     if (useLightning) {
//       return await this.purchaseWithLightning(playerId, itemId, price);
//     } else {
//       return await this.purchaseWithOnChain(playerId, itemId, price);
//     }
//   }

//   async purchaseWithLightning(playerId, itemId, price) {
//     const wallet = await this.walletManager.getPlayerWallet(playerId);
    
//     if (wallet.lightningBalance < price) {
//       throw new Error('Insufficient lightning balance');
//     }

//     // Deduct from lightning balance
//     wallet.lightningBalance -= price;
    
//     // Grant item to player
//     await this.grantItem(playerId, itemId);
    
//     return {
//       success: true,
//       newBalance: wallet.lightningBalance,
//       transactionId: `lightning_${Date.now()}`
//     };
//   }

//   async purchaseWithOnChain(playerId, itemId, price) {
//     const wallet = await this.walletManager.getPlayerWallet(playerId);
//     const balance = await this.walletManager.getPlayerBalance(playerId);
    
//     if (balance.onChain < price) {
//       throw new Error('Insufficient on-chain balance');
//     }

//     // In production, you'd create an actual Bitcoin transaction
//     // For demo, we'll simulate it
//     console.log(`Creating on-chain transaction for ${price} sats`);
    
//     await this.grantItem(playerId, itemId);
    
//     return {
//       success: true,
//       newBalance: balance.onChain - price,
//       transactionId: `onchain_${Date.now()}`
//     };
//   }

//   // Reward player with Bitcoin
//   async rewardPlayer(playerId, action) {
//     if (!this.initialized) return null;
    
//     const reward = this.rewardRates.get(action);
//     if (!reward) return null;

//     const wallet = await this.walletManager.getPlayerWallet(playerId);
//     wallet.lightningBalance += reward;

//     return {
//       reward,
//       newBalance: wallet.lightningBalance
//     };
//   }

//   async grantItem(playerId, itemId) {
//     // Implement item granting logic
//     console.log(`Granting item ${itemId} to player ${playerId}`);
    
//     // You would integrate this with your existing inventory system
//     // For now, we'll just log it
//     return true;
//   }

//   async getPlayerBalance(playerId) {
//     if (!this.initialized) return { onChain: 0, lightning: 0, total: 0 };
//     return await this.walletManager.getPlayerBalance(playerId);
//   }

//   async cleanup() {
//     // Cleanup resources if needed
//     this.initialized = false;
//   }
// }
import { BitcoinWallet } from './BitcoinWallet.js';
export class BitcoinEconomy {
  constructor() {
    this.walletManager = new BitcoinWallet();
    this.itemPrices = new Map();
    this.rewardRates = new Map();
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    try {
      await this.walletManager.init();
      this.setupDefaultPrices();
      this.setupDefaultRewards();
      this.initialized = true;
      console.log('Bitcoin economy initialized');
    } catch (error) {
      console.error('Failed to initialize Bitcoin economy:', error);
      throw error;
    }
  }

  setupDefaultPrices() {
    // Define item prices in satoshis
    this.itemPrices.set('ammo_pack', 1000);
    this.itemPrices.set('health_pack', 2000);
    this.itemPrices.set('armor', 5000);
    this.itemPrices.set('special_weapon', 10000);
  }

  setupDefaultRewards() {
    // Focus on level completion rewards
    this.rewardRates.set('level_complete', 1000); // 1000 sats per level
    this.rewardRates.set('level_bonus', 500); // Bonus for quick completion
    this.rewardRates.set('perfect_level', 2000); // Bonus for no damage
  }

  // ... rest of BitcoinEconomy methods remain the same
  async purchaseItem(playerId, itemId, useLightning = true) {
    if (!this.initialized) throw new Error('Bitcoin economy not initialized');
    
    const price = this.itemPrices.get(itemId);
    if (!price) throw new Error('Item not found');

    if (useLightning) {
      return await this.purchaseWithLightning(playerId, itemId, price);
    } else {
      return await this.purchaseWithOnChain(playerId, itemId, price);
    }
  }

  async purchaseWithLightning(playerId, itemId, price) {
    const wallet = await this.walletManager.getPlayerWallet(playerId);
    
    if (wallet.lightningBalance < price) {
      throw new Error('Insufficient lightning balance');
    }

    wallet.lightningBalance -= price;
    
    await this.grantItem(playerId, itemId);
    
    return {
      success: true,
      newBalance: wallet.lightningBalance,
      transactionId: `lightning_${Date.now()}`
    };
  }

  async purchaseWithOnChain(playerId, itemId, price) {
    const wallet = await this.walletManager.getPlayerWallet(playerId);
    const balance = await this.walletManager.getPlayerBalance(playerId);
    
    if (balance.onChain < price) {
      throw new Error('Insufficient on-chain balance');
    }

    console.log(`Creating on-chain transaction for ${price} sats`);
    
    await this.grantItem(playerId, itemId);
    
    return {
      success: true,
      newBalance: balance.onChain - price,
      transactionId: `onchain_${Date.now()}`
    };
  }

  async rewardPlayer(playerId, action) {
    if (!this.initialized) return null;
    
    const reward = this.rewardRates.get(action);
    if (!reward) return null;

    const wallet = await this.walletManager.getPlayerWallet(playerId);
    wallet.lightningBalance += reward;

    return {
      reward,
      newBalance: wallet.lightningBalance
    };
  }

  async grantItem(playerId, itemId) {
    console.log(`Granting item ${itemId} to player ${playerId}`);
    return true;
  }

  async getPlayerBalance(playerId) {
    if (!this.initialized) return { onChain: 0, lightning: 0, total: 0 };
    return await this.walletManager.getPlayerBalance(playerId);
  }

  async cleanup() {
    this.initialized = false;
  }
}