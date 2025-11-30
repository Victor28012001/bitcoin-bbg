// systems/BitcoinUI.js
export class BitcoinUI {
  constructor() {
    this.initialized = false;
  }

  async init() {
    if (this.initialized) return;
    
    this.createBitcoinHUD();
    this.initialized = true;
    console.log('Bitcoin UI initialized');
  }

  createBitcoinHUD() {
    // Add Bitcoin balance to HUD
    const bitcoinHUD = document.createElement('div');
    bitcoinHUD.id = 'bitcoin-hud';
    bitcoinHUD.className = 'bitcoin-hud';
    bitcoinHUD.innerHTML = `
      <div class="bitcoin-balance">
        <span class="bitcoin-icon">₿</span>
        <span id="bitcoin-balance">0</span>
        <span class="balance-type">sats</span>
      </div>
      <div class="lightning-balance">
        <span class="lightning-icon">⚡</span>
        <span id="lightning-balance">0</span>
        <span class="balance-type">sats</span>
      </div>
    `;
    
    // Add CSS for Bitcoin HUD
    this.injectBitcoinStyles();
    
    const existingHUD = document.querySelector('.game-hud') || document.body;
    existingHUD.appendChild(bitcoinHUD);
  }

  injectBitcoinStyles() {
    const styles = `
      .bitcoin-hud {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        padding: 10px 15px;
        border-radius: 8px;
        color: white;
        font-family: 'Courier New', monospace;
        font-size: 14px;
        z-index: 1000;
        border: 1px solid #f7931a;
      }
      
      .bitcoin-balance, .lightning-balance {
        display: flex;
        align-items: center;
        margin: 5px 0;
      }
      
      .bitcoin-icon, .lightning-icon {
        margin-right: 8px;
        font-weight: bold;
        font-size: 16px;
      }
      
      .bitcoin-icon {
        color: #f7931a;
      }
      
      .lightning-icon {
        color: #ffd700;
      }
      
      .balance-type {
        margin-left: 5px;
        font-size: 12px;
        opacity: 0.7;
      }
      
      .bitcoin-reward-notification {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(247, 147, 26, 0.9);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        font-size: 18px;
        font-weight: bold;
        z-index: 1001;
        animation: bitcoinRewardFade 3s ease-in-out;
      }
      
      @keyframes bitcoinRewardFade {
        0%, 100% { opacity: 0; transform: translate(-50%, -40%); }
        10%, 90% { opacity: 1; transform: translate(-50%, -50%); }
      }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  async updateBalanceDisplay(playerId) {
    // This would typically get the balance from your Bitcoin economy system
    // For now, we'll simulate it
    const bitcoinBalance = document.getElementById('bitcoin-balance');
    const lightningBalance = document.getElementById('lightning-balance');
    
    if (bitcoinBalance) {
      bitcoinBalance.textContent = '0'; // Simulated balance
    }
    if (lightningBalance) {
      lightningBalance.textContent = '0'; // Simulated balance
    }
  }

  showBitcoinReward(amount, action) {
    const notification = document.createElement('div');
    notification.className = 'bitcoin-reward-notification';
    notification.innerHTML = `
      <div class="reward-content">
        <span class="reward-icon">+₿</span>
        <span class="reward-amount">${amount}</span>
        <span class="reward-action">${action}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate and remove
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  }

  createBitcoinShop() {
    // Create in-game Bitcoin shop UI
    const shopModal = document.createElement('div');
    shopModal.id = 'bitcoin-shop';
    shopModal.className = 'bitcoin-shop-modal';
    shopModal.innerHTML = `
      <div class="shop-header">
        <h3>Bitcoin Shop</h3>
        <button class="close-shop">×</button>
      </div>
      <div class="shop-items">
        <div class="shop-item" data-item="ammo_pack">
          <span class="item-name">Ammo Pack</span>
          <span class="item-price">1000 sats</span>
          <button class="buy-btn" data-method="lightning">Buy with Lightning</button>
          <button class="buy-btn" data-method="onchain">Buy On-Chain</button>
        </div>
        <div class="shop-item" data-item="health_pack">
          <span class="item-name">Health Pack</span>
          <span class="item-price">2000 sats</span>
          <button class="buy-btn" data-method="lightning">Buy with Lightning</button>
          <button class="buy-btn" data-method="onchain">Buy On-Chain</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(shopModal);
    this.setupShopEvents();
  }

  setupShopEvents() {
    const shop = document.getElementById('bitcoin-shop');
    if (!shop) return;

    const closeBtn = shop.querySelector('.close-shop');
    
    closeBtn.addEventListener('click', () => {
      shop.style.display = 'none';
    });
    
    // Handle purchase buttons
    const buyButtons = shop.querySelectorAll('.buy-btn');
    buyButtons.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const item = e.target.closest('.shop-item');
        const itemId = item.dataset.item;
        const method = e.target.dataset.method;
        
        try {
          // This would call your game's purchase method
          console.log(`Purchasing ${itemId} with ${method}`);
          // await GameState.game.purchaseItemWithBitcoin(playerId, itemId, method === 'lightning');
          this.showPurchaseSuccess(itemId);
        } catch (error) {
          this.showPurchaseError(error.message);
        }
      });
    });
  }

  showPurchaseSuccess(itemId) {
    this.showBitcoinReward(0, `Purchased ${itemId}`);
  }

  showPurchaseError(message) {
    console.error('Purchase error:', message);
    // You could show an error notification here
  }

  cleanup() {
    // Remove Bitcoin UI elements
    const bitcoinHUD = document.getElementById('bitcoin-hud');
    if (bitcoinHUD) {
      bitcoinHUD.remove();
    }
    
    const bitcoinShop = document.getElementById('bitcoin-shop');
    if (bitcoinShop) {
      bitcoinShop.remove();
    }
    
    this.initialized = false;
  }
}