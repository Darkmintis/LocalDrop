document.addEventListener('DOMContentLoaded', function() {
  console.log('LocalDrop: Initializing donation interface');
  
  // Network configuration mapping
  const networkMappings = {
    // Icons for networks
    iconMapping: {
      'BEP20': 'bsc',
      'TRC20': 'tron',
      'SOL': 'solana',
      'POL': 'polygon',
      'OP': 'optimism',
      'ARB': 'arbitrum',
      'AVAX': 'avalanche',
      'CELO': 'celo',
      'NEAR': 'near',
      'APT': 'aptos',
      'XTZ': 'tezos',
      'TON': 'ton'
    },
    
    // QR code naming mapping
    qrMapping: {
      'BEP20': 'bnb',
      'TRC20': 'tron',
      'SOL': 'solana',
      'POL': 'polygon',
      'OP': 'optimism',
      'ARB': 'arbitrum',
      'AVAX': 'avalanche',
      'CELO': 'celo',
      'NEAR': 'near',
      'APT': 'aptos',
      'XTZ': 'tezos',
      'TON': 'ton'
    },
    
    // Network display names
    nameMapping: {
      'BEP20': 'BSC',
      'TRC20': 'TRON',
      'SOL': 'Solana',
      'POL': 'Polygon',
      'OP': 'Optimism',
      'ARB': 'Arbitrum',
      'AVAX': 'Avalanche',
      'CELO': 'Celo',
      'NEAR': 'NEAR',
      'APT': 'Aptos',
      'XTZ': 'Tezos',
      'TON': 'TON'
    }
  };
  
  // ENFORCE POPUP MODE
  // Set fixed dimensions for popup
  enforcePopupMode();
  
  // Function to enforce popup mode
  function enforcePopupMode() {
    // Set popup dimensions
    const POPUP_WIDTH = 320;
    const POPUP_HEIGHT = 550;
    
    // Force popup styling
    document.documentElement.style.width = POPUP_WIDTH + 'px';
    document.documentElement.style.height = POPUP_HEIGHT + 'px';
    document.body.style.width = POPUP_WIDTH + 'px';
    document.body.style.height = POPUP_HEIGHT + 'px';
    document.body.style.overflow = 'hidden';
    
    // Add popup classes
    document.documentElement.classList.add('popup-mode');
    document.body.classList.add('popup-mode');
    document.body.setAttribute('data-mode', 'popup');
    
    // Remove any non-popup classes
    document.documentElement.classList.remove('full-page', 'new-tab-mode');
    document.body.classList.remove('full-page', 'new-tab-mode');
    
    // Attempt to resize window if not in proper dimensions
    if (window.outerWidth !== POPUP_WIDTH || window.outerHeight !== POPUP_HEIGHT) {
      try {
        window.resizeTo(POPUP_WIDTH, POPUP_HEIGHT);
      } catch (e) {
        console.warn('LocalDrop: Could not resize window', e);
      }
    }
  }
  
  // Re-enforce popup mode on window resize
  window.addEventListener('resize', function() {
    enforcePopupMode();
  });
  
  // Prevent opening in new tab or window
  document.addEventListener('click', function(event) {
    // Find any link tags
    let targetElement = event.target;
    while (targetElement && targetElement !== document) {
      if (targetElement.tagName === 'A' && targetElement.getAttribute('target') === '_blank') {
        // Modify links to open in popup or current window instead
        event.preventDefault();
        
        // Get the URL
        const url = targetElement.getAttribute('href');
        
        // If it's an external URL, open in the current tab
        if (url && url.startsWith('http')) {
          chrome.tabs.create({ url: url });
        } else {
          // Otherwise try to keep it in the popup
          window.location.href = url;
        }
      }
      targetElement = targetElement.parentElement;
    }
  }, true);

  // Intercept any window.open calls
  const originalWindowOpen = window.open;
  window.open = function(url, name, features) {
    // For donate-related URLs, try to keep in popup
    if (url && (url.includes('donate') || url === 'donate.html')) {
      return window;
    }
    // For external URLs, use chrome.tabs.create
    if (url && url.startsWith('http')) {
      chrome.tabs.create({ url: url });
      return null;
    }
    // Fallback to original behavior
    return originalWindowOpen.call(window, url, name, features);
  };
  
  // Load configuration
  let config = typeof LOCAL_DROP_CONFIG !== 'undefined' ? LOCAL_DROP_CONFIG : null;
  
  if (!config) {
    console.warn('LocalDrop: Configuration not found, using defaults');
    config = getDefaultConfig();
  } else {
    console.log('LocalDrop: Configuration loaded successfully');
  }
  
  // Setup UI based on configuration
  applyConfigToUI(config);
  setupDonationUI(config);
  
  // HELPER FUNCTIONS
  
  // Default configuration when config.js isn't loaded
  function getDefaultConfig() {
    return {
      extension: {
        name: "LocalDrop",
        logo: "assets/logo.png",
        description: "Support the development with a donation",
        theme: {
          primaryColor: "#2563eb",
          secondaryColor: "#f59e0b"
        }
      },
      donationMethods: [],
      ui: {
        initialTab: "binance",
        footerText: "Thank you for your support! ❤️"
      }
    };
  }
  
  // Apply configuration to UI elements
  function applyConfigToUI(config) {
    if (!config) return;
    
    // Extension information
    if (config.extension) {
      // Logo
      const logoElement = document.getElementById('extension-logo');
      if (logoElement && config.extension.logo) {
        logoElement.src = config.extension.logo;
      }
      
      // Name
      const nameElement = document.getElementById('extension-name');
      if (nameElement && config.extension.name) {
        nameElement.textContent = config.extension.name;
        document.title = `Support ${config.extension.name}`;
      }
      
      // Description
      const descElement = document.getElementById('extension-description');
      if (descElement && config.extension.description) {
        descElement.textContent = config.extension.description;
      }
      
      // Theme colors
      if (config.extension.theme) {
        const root = document.documentElement;
        if (config.extension.theme.primaryColor) {
          root.style.setProperty('--primary-color', config.extension.theme.primaryColor);
          root.style.setProperty('--primary-hover', adjustColor(config.extension.theme.primaryColor, -20));
          root.style.setProperty('--primary-light', adjustColor(config.extension.theme.primaryColor, 40, true));
        }
        
        if (config.extension.theme.secondaryColor) {
          root.style.setProperty('--secondary-color', config.extension.theme.secondaryColor);
          root.style.setProperty('--secondary-hover', adjustColor(config.extension.theme.secondaryColor, -20));
          root.style.setProperty('--secondary-light', adjustColor(config.extension.theme.secondaryColor, 40, true));
        }
        
        // Header background
        const header = document.querySelector('header');
        if (header && config.extension.theme.primaryColor) {
          header.style.background = `linear-gradient(135deg, ${config.extension.theme.primaryColor}, ${adjustColor(config.extension.theme.primaryColor, -20)})`;
        }
      }
    }
    
    // Donation methods
    if (config.donationMethods && Array.isArray(config.donationMethods)) {
      updateDonationTabs(config.donationMethods);
      
      config.donationMethods.forEach(method => {
        switch (method.id) {
          case 'binance':
            updateBinancePayUI(method);
            break;
          case 'redotpay':
            updateRedotpayUI(method);
            break;
          case 'usdt':
            updateUSDTUI(method);
            break;
          default:
            updateCustomDonationMethodUI(method);
            break;
        }
      });
    }
    
    // UI settings
    if (config.ui) {
      // Initial tab
      if (config.ui.initialTab) {
        setActiveTab(config.ui.initialTab);
      }
      
      // Footer text
      if (config.ui.footerText) {
        const thankYouElement = document.querySelector('.thank-you');
        if (thankYouElement) {
          thankYouElement.textContent = config.ui.footerText;
        }
      }
      
      // Back button text
      if (config.ui.backButtonText !== undefined) {
        const backBtn = document.getElementById('back-btn');
        if (backBtn && config.ui.backButtonText.trim() !== '') {
          backBtn.innerHTML = config.ui.backButtonText;
          backBtn.classList.add('text-back-btn');
        }
      }
    }
  }
  
  // Set active tab
  function setActiveTab(tabId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const options = document.querySelectorAll('.option');
    
    // Clear all active classes
    tabButtons.forEach(btn => btn.classList.remove('active'));
    options.forEach(opt => {
      opt.classList.remove('active');
      opt.style.display = 'none';
    });
    
    // Set the specified tab as active
    const activeTabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (activeTabBtn) {
      activeTabBtn.classList.add('active');
      const tabContentId = tabId + '-tab';
      const activeTab = document.getElementById(tabContentId);
      if (activeTab) {
        activeTab.classList.add('active');
        activeTab.style.display = 'block';
      }
    }
  }
  
  // Setup donation UI components
  function setupDonationUI(config) {
    setupTabNavigation();
    setupCopyButtons();
    setupBackButton();
    setupNetworkSelector(config);
  }
  
  // Configure tab navigation
  function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const options = document.querySelectorAll('.option');
    
    // Hide inactive tabs
    options.forEach(option => {
      if (!option.classList.contains('active')) {
        option.style.display = 'none';
      } else {
        option.style.display = 'block';
      }
    });
    
    // Setup tab click handlers
    tabButtons.forEach(button => {
      const newButton = button.cloneNode(true);
      button.parentNode.replaceChild(newButton, button);
      
      const targetTabId = newButton.getAttribute('data-tab');
      
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        setActiveTab(targetTabId);
      });
    });
    
    // Activate first tab if none is active
    const activeTab = document.querySelector('.tab-btn.active');
    if (!activeTab && tabButtons.length > 0) {
      tabButtons[0].click();
    }
  }
  
  // Add copy functionality to copy buttons
  function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const clipboardId = button.getAttribute('data-clipboard');
        const contentElement = document.getElementById(clipboardId);
        
        if (!contentElement) return;
        
        const textToCopy = contentElement.textContent.trim();
        
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            button.classList.add('copy-success');
            button.textContent = 'Copied!';
            
            setTimeout(() => {
              button.classList.remove('copy-success');
              button.textContent = 'Copy';
            }, 2000);
          })
          .catch(() => {
            button.textContent = 'Error!';
            setTimeout(() => {
              button.textContent = 'Copy';
            }, 2000);
          });
      });
    });
  }
  
  // Configure back button
  function setupBackButton() {
    const backButton = document.getElementById('back-btn');
    
    if (backButton) {
      backButton.addEventListener('click', () => {
        window.history.back();
      });
    }
  }
  
  // Configure USDT network selector
  function setupNetworkSelector(config) {
    const networkSelector = document.getElementById('network-selector');
    let customSelector = document.getElementById('custom-network-selector');
    const networkOptions = document.getElementById('network-options');
    
    if (!networkSelector || !customSelector || !networkOptions) return;
    
    // Replace selector to clear event listeners
    const newCustomSelector = customSelector.cloneNode(true);
    customSelector.parentNode.replaceChild(newCustomSelector, customSelector);
    customSelector = newCustomSelector;
    
    // Toggle dropdown
    customSelector.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      customSelector.classList.toggle('active');
      networkOptions.classList.toggle('active');
    });
    
    // Close dropdown when clicking elsewhere
    document.addEventListener('click', function(e) {
      if (customSelector && !customSelector.contains(e.target) && customSelector.classList.contains('active')) {
        customSelector.classList.remove('active');
        networkOptions.classList.remove('active');
      }
    });
    
    // Populate network options
    populateNetworkOptions(networkSelector, networkOptions, config);
    
    // Set up option click handlers
    const options = networkOptions.querySelectorAll('.custom-option');
    options.forEach(option => {
      option.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        updateNetworkUI(value, config);
        
        customSelector.classList.remove('active');
        networkOptions.classList.remove('active');
      });
    });
    
    // Initial network UI update
    updateNetworkUI(networkSelector.value, config);
  }
  
  // Populate network options in dropdown
  function populateNetworkOptions(selectElement, optionsContainer, config) {
    if (!selectElement || !optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    
    const usdtConfig = config?.donationMethods?.find(method => method.id === 'usdt');
    let networks = [];
    
    if (usdtConfig && usdtConfig.networks && usdtConfig.networks.length > 0) {
      networks = usdtConfig.networks.map(network => ({
        value: network.id,
        displayName: network.displayName || network.name
      }));
    } else {
      const options = selectElement.querySelectorAll('option');
      networks = Array.from(options).map(option => ({
        value: option.value,
        displayName: option.textContent
      }));
    }
    
    networks.forEach(network => {
      const value = network.value;
      const displayName = networkMappings.nameMapping[value] || network.displayName;
      const networkAssetPath = networkMappings.iconMapping[value] || value.toLowerCase();
      
      const customOption = document.createElement('div');
      customOption.className = 'custom-option';
      customOption.setAttribute('data-value', value);
      
      customOption.innerHTML = `
        <img src="assets/network-icons/${networkAssetPath}.png" alt="${value}" class="network-icon">
        <span>${displayName}</span>
      `;
      
      optionsContainer.appendChild(customOption);
    });
  }
  
  // Update UI when network changes
  function updateNetworkUI(network, config) {
    if (!network) return;
    
    const networkIconName = networkMappings.iconMapping[network] || network.toLowerCase();
    const networkDisplayName = networkMappings.nameMapping[network] || network;
    
    // Update dropdown display
    const currentIcon = document.getElementById('current-network-icon');
    const currentName = document.getElementById('current-network-name');
    
    if (currentIcon) {
      currentIcon.src = `assets/network-icons/${networkIconName}.png`;
      currentIcon.alt = networkDisplayName;
    }
    
    if (currentName) {
      currentName.textContent = networkDisplayName;
    }
    
    // Update network name in heading
    const nameDisplay = document.getElementById('network-name-display');
    if (nameDisplay) {
      nameDisplay.textContent = networkDisplayName;
    }
    
    // Update icon in label
    const labelIcon = document.getElementById('label-network-icon');
    if (labelIcon) {
      labelIcon.src = `assets/network-icons/${networkIconName}.png`;
      labelIcon.alt = networkDisplayName;
    }
    
    // Update QR code and address
    const usdtConfig = config?.donationMethods?.find(method => method.id === 'usdt');
    if (usdtConfig?.networks) {
      const networkConfig = usdtConfig.networks.find(n => n.id === network);
      if (networkConfig) {
        // Update QR code
        const networkQR = document.getElementById('network-qr');
        if (networkQR && networkConfig.qrCode) {
          networkQR.src = networkConfig.qrCode;
          networkQR.alt = `${networkDisplayName} QR Code`;
        }
        
        // Update address
        const networkAddress = document.getElementById('network-address');
        if (networkAddress && networkConfig.address) {
          networkAddress.textContent = networkConfig.address;
        }
      }
    }
    
    // Update hidden selector value
    const networkSelector = document.getElementById('network-selector');
    if (networkSelector) {
      networkSelector.value = network;
    }
  }
  
  // Update Binance Pay UI
  function updateBinancePayUI(methodConfig) {
    if (methodConfig.qrCode) {
      const qrElement = document.querySelector('#binance-tab .qr-code');
      if (qrElement) qrElement.src = methodConfig.qrCode;
    }
    
    if (methodConfig.address) {
      const addressElement = document.getElementById('binanceId');
      if (addressElement) addressElement.textContent = methodConfig.address;
    }
    
    if (methodConfig.addressLabel) {
      const labelElement = document.querySelector('#binance-tab .wallet-address p');
      if (labelElement) labelElement.textContent = methodConfig.addressLabel;
    }
    
    if (methodConfig.referral) {
      const linkElement = document.querySelector('#binance-tab .create-account-link');
      if (linkElement) {
        if (methodConfig.referral.linkText) linkElement.textContent = methodConfig.referral.linkText;
        if (methodConfig.referral.url) linkElement.href = methodConfig.referral.url;
      }
    }
  }
  
  // Update Redotpay UI
  function updateRedotpayUI(methodConfig) {
    if (methodConfig.qrCode) {
      const qrElement = document.querySelector('#redotpay-tab .qr-code');
      if (qrElement) qrElement.src = methodConfig.qrCode;
    }
    
    if (methodConfig.address) {
      const addressElement = document.getElementById('redotpayId');
      if (addressElement) addressElement.textContent = methodConfig.address;
    }
    
    if (methodConfig.addressLabel) {
      const labelElement = document.querySelector('#redotpay-tab .wallet-address p');
      if (labelElement) labelElement.textContent = methodConfig.addressLabel;
    }
    
    if (methodConfig.referral) {
      const linkElement = document.querySelector('#redotpay-tab .create-account-link');
      if (linkElement) {
        if (methodConfig.referral.linkText) linkElement.textContent = methodConfig.referral.linkText;
        if (methodConfig.referral.url) linkElement.href = methodConfig.referral.url;
      }
    }
  }
  
  // Update USDT UI
  function updateUSDTUI(methodConfig) {
    if (methodConfig.isMultiNetwork && methodConfig.networks && methodConfig.networks.length > 0) {
      const networkSelector = document.getElementById('network-selector');
      
      if (networkSelector) {
        networkSelector.innerHTML = '';
        
        methodConfig.networks.forEach(network => {
          const option = document.createElement('option');
          option.value = network.id;
          option.textContent = network.displayName || network.name;
          option.setAttribute('data-qr', network.qrCode);
          option.setAttribute('data-address', network.address);
          networkSelector.appendChild(option);
        });
        
        // Default to first network
        const firstNetwork = methodConfig.networks[0];
        if (firstNetwork) {
          networkSelector.value = firstNetwork.id;
          updateNetworkUI(firstNetwork.id, { donationMethods: [methodConfig] });
        }
      }
    }
  }
  
  // Update custom donation method UI
  function updateCustomDonationMethodUI(method) {
    console.log(`Custom donation method loaded: ${method.id}`);
    // Implementation based on custom method requirements
  }
  
  // Update donation tabs
  function updateDonationTabs(donationMethods) {
    if (!donationMethods || !Array.isArray(donationMethods)) return;
    
    const tabsContainer = document.querySelector('.tabs');
    const donationOptionsContainer = document.querySelector('.donation-options');
    
    if (!tabsContainer || !donationOptionsContainer) return;
    
    const defaultMethodIds = ['binance', 'redotpay', 'usdt'];
    const customMethods = donationMethods.filter(method => !defaultMethodIds.includes(method.id));
    
    if (customMethods.length > 0) {
      customMethods.forEach(method => {
        if (!document.querySelector(`.tab-btn[data-tab="${method.id}"]`)) {
          // Create tab button
          const tabButton = document.createElement('button');
          tabButton.className = 'tab-btn';
          tabButton.setAttribute('data-tab', method.id);
          
          tabButton.innerHTML = `
            <img src="${method.logo || 'assets/logo.png'}" alt="${method.name}" class="tab-icon">
            <span>${method.name}</span>
          `;
          tabsContainer.appendChild(tabButton);
          
          // Create content container
          const optionContainer = document.createElement('div');
          optionContainer.className = 'option';
          optionContainer.id = `${method.id}-tab`;
          
          const optionContent = method.isMultiNetwork ? 
            createMultiNetworkTabContent(method) : createStandardTabContent(method);
          
          optionContainer.innerHTML = optionContent;
          donationOptionsContainer.appendChild(optionContainer);
        }
      });
    }
    
    // Handle responsive layout for many tabs
    const totalTabs = tabsContainer.querySelectorAll('.tab-btn').length;
    if (totalTabs > 3) {
      tabsContainer.classList.add('many-tabs');
      if (totalTabs > 5) {
        tabsContainer.classList.add('tabs-grid');
      }
    }
  }
  
  // Create content for standard tab
  function createStandardTabContent(method) {
    return `
      <div class="option-content">
        <div class="payment-header">
          <h3>Donate with ${method.name}</h3>
        </div>
        
        <div class="qr-section">
          <div class="qr-container">
            <div class="qr-border"></div>
            <img src="${method.qrCode}" alt="${method.name} QR Code" class="qr-code">
            <div class="qr-shine"></div>
          </div>
        </div>
        
        <div class="wallet-address">
          <p>${method.addressLabel || `${method.name} Address:`}</p>
          <div class="address-container">
            <code id="${method.id}Id">${method.address}</code>
            <button class="copy-btn" data-clipboard="${method.id}Id">Copy</button>
          </div>
          ${method.referral ? `
          <div class="create-account">
            <a href="${method.referral.url}" target="_blank" class="create-account-link">
              ${method.referral.linkText || 'Create an Account'}
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // Create content for multi-network tab
  function createMultiNetworkTabContent(method) {
    return `
      <div class="option-content">
        <div class="payment-header-container">
          <div class="payment-header">
            <h3>Donate with ${method.name}</h3>
          </div>
          
          <div class="network-tabs-compact">
            <div class="custom-select-styled" id="custom-network-selector-${method.id}">
              <img src="assets/network-icons/bsc.png" alt="Network" class="network-icon" id="current-network-icon-${method.id}">
              <span id="current-network-name-${method.id}">Select Network</span>
            </div>
            <div class="custom-select-options" id="network-options-${method.id}">
              <!-- Options populated by JavaScript -->
            </div>
            <select id="network-selector-${method.id}" class="network-select" style="display: none;">
              ${method.networks && method.networks.map(network => `
                <option value="${network.id}" data-qr="${network.qrCode}" data-address="${network.address}">
                  ${network.displayName || network.name}
                </option>
              `).join('')}
            </select>
          </div>
        </div>
        
        <div class="qr-section">
          <div class="qr-container">
            <div class="qr-border"></div>
            <img id="network-qr-${method.id}" src="${method.networks && method.networks[0] ? method.networks[0].qrCode : ''}" 
                alt="${method.name} QR Code" class="qr-code">
            <div class="qr-shine"></div>
          </div>
        </div>
        
        <div class="wallet-address">
          <p>${method.name} <span id="network-name-display-${method.id}">Network</span> 
             <img src="" alt="Network" class="network-icon" id="label-network-icon-${method.id}"> address:</p>
          <div class="address-container">
            <code id="network-address-${method.id}">${method.networks && method.networks[0] ? method.networks[0].address : ''}</code>
            <button class="copy-btn" data-clipboard="network-address-${method.id}">Copy</button>
          </div>
          ${method.referral ? `
          <div class="create-account">
            <a href="${method.referral.url}" target="_blank" class="create-account-link">
              ${method.referral.linkText || 'Create an Exchange Account'}
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // Adjust color brightness helper
  function adjustColor(color, percent, lighten = false) {
    if (!color || !color.startsWith('#')) return color;
    
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    if (lighten) {
      R = Math.min(255, Math.max(0, R + percent));
      G = Math.min(255, Math.max(0, G + percent));
      B = Math.min(255, Math.max(0, B + percent));
    } else {
      R = Math.min(255, Math.max(0, R + percent));
      G = Math.min(255, Math.max(0, G + percent));
      B = Math.min(255, Math.max(0, B + percent));
    }

    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  }
});