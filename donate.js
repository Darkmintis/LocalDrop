document.addEventListener('DOMContentLoaded', function() {
  console.log('LocalDrop: Initializing donation interface');
  
  // Network configuration mapping
  const networkMappings = {
    // Icons for networks
    iconMapping: {
      'BEP20': 'bnb', // Changed from 'bsc' to 'bnb' to match existing file
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
    
    // Network display names - Changed to use short names
    nameMapping: {
      'BEP20': 'BEP20',
      'TRC20': 'TRC20',
      'SOL': 'SOL',
      'POL': 'POL',
      'OP': 'OP',
      'ARB': 'ARB',
      'AVAX': 'AVAX',
      'CELO': 'CELO',
      'NEAR': 'NEAR',
      'APT': 'APT',
      'XTZ': 'XTZ',
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
  setupDonationInterface(config);
  
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
  
  // Main function to setup the entire donation interface
  function setupDonationInterface(config) {
    // Apply extension info and theme
    applyExtensionInfo(config.extension);
    
    // Clear and rebuild donation tabs
    rebuildDonationTabs(config.donationMethods);
    
    // Apply UI settings
    applyUISettings(config.ui);
    
    // Setup general UI functionality
    setupUIFunctionality(config);
  }
  
  // Apply extension information to UI
  function applyExtensionInfo(extension) {
    if (!extension) return;
    
    // Logo
    const logoElement = document.getElementById('extension-logo');
    if (logoElement && extension.logo) {
      logoElement.src = extension.logo;
    }
    
    // Name
    const nameElement = document.getElementById('extension-name');
    if (nameElement && extension.name) {
      nameElement.textContent = extension.name;
      document.title = `Support ${extension.name}`;
    }
    
    // Description
    const descElement = document.getElementById('extension-description');
    if (descElement && extension.description) {
      descElement.textContent = extension.description;
    }
    
    // Theme colors
    if (extension.theme) {
      const root = document.documentElement;
      if (extension.theme.primaryColor) {
        root.style.setProperty('--primary-color', extension.theme.primaryColor);
        root.style.setProperty('--primary-hover', adjustColor(extension.theme.primaryColor, -20));
        root.style.setProperty('--primary-light', adjustColor(extension.theme.primaryColor, 40, true));
        root.style.setProperty('--primary-very-light', adjustColor(extension.theme.primaryColor, 90, true));
      }
      
      if (extension.theme.secondaryColor) {
        root.style.setProperty('--secondary-color', extension.theme.secondaryColor);
        root.style.setProperty('--secondary-hover', adjustColor(extension.theme.secondaryColor, -20));
        root.style.setProperty('--secondary-light', adjustColor(extension.theme.secondaryColor, 40, true));
      }
      
      // Header background
      const header = document.querySelector('header');
      if (header && extension.theme.primaryColor) {
        header.style.background = `linear-gradient(135deg, ${extension.theme.primaryColor}, ${adjustColor(extension.theme.primaryColor, -20)})`;
      }
    }
  }
  
  // Completely rebuild donation tabs based on config
  function rebuildDonationTabs(donationMethods) {
    if (!donationMethods || !Array.isArray(donationMethods)) {
      donationMethods = [];
    }
    
    // Get tab container and content container
    const tabsContainer = document.querySelector('.tabs');
    const donationOptionsContainer = document.querySelector('.donation-options');
    
    if (!tabsContainer || !donationOptionsContainer) {
      console.error('LocalDrop: Cannot find tab containers');
      return;
    }
    
    // Clear existing tabs and content
    tabsContainer.innerHTML = '';
    donationOptionsContainer.innerHTML = '';
    
    // If no donation methods, show a message
    if (donationMethods.length === 0) {
      const noMethodsMessage = document.createElement('div');
      noMethodsMessage.className = 'no-methods-message';
      noMethodsMessage.style.padding = '20px';
      noMethodsMessage.style.textAlign = 'center';
      noMethodsMessage.innerHTML = `
        <p>No donation methods configured.</p>
        <p>Please update the config.js file to add donation methods.</p>
      `;
      donationOptionsContainer.appendChild(noMethodsMessage);
      return;
    }
    
    // Create tabs and content for each donation method
    donationMethods.forEach(method => {
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
      const contentContainer = document.createElement('div');
      contentContainer.className = 'option';
      contentContainer.id = `${method.id}-tab`;
      
      // Generate content based on method type
      if (method.isMultiNetwork) {
        contentContainer.innerHTML = createMultiNetworkContent(method);
      } else {
        contentContainer.innerHTML = createStandardContent(method);
      }
      
      donationOptionsContainer.appendChild(contentContainer);
    });
    
    // Handle responsive layout for many tabs
    const totalTabs = tabsContainer.querySelectorAll('.tab-btn').length;
    if (totalTabs > 3) {
      tabsContainer.classList.add('many-tabs');
      if (totalTabs > 5) {
        tabsContainer.classList.add('tabs-grid');
      }
    }
  }
  
  // Create content for standard payment method
  function createStandardContent(method) {
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
  
  // Create content for multi-network payment method (like USDT)
  function createMultiNetworkContent(method) {
    // Only include networks that are defined
    const networks = method.networks && Array.isArray(method.networks) ? method.networks : [];
    
    // Create network options HTML
    const networkOptions = networks.map(network => `
      <option value="${network.id}" data-short="${network.name}" data-full="${network.displayName || network.name}">
        ${network.displayName || network.name}
      </option>
    `).join('');

    // Set default network data
    const defaultNetwork = networks.length > 0 ? networks[0] : null;
    const defaultNetworkId = defaultNetwork ? defaultNetwork.id : '';
    const defaultNetworkName = defaultNetwork ? defaultNetwork.name : '';
    const defaultNetworkDisplayName = defaultNetwork ? (defaultNetwork.displayName || defaultNetwork.name) : '';
    const defaultNetworkIcon = defaultNetwork ? (networkMappings.iconMapping[defaultNetwork.id] || defaultNetwork.id.toLowerCase()) : '';
    const defaultQrCode = defaultNetwork ? defaultNetwork.qrCode : '';
    const defaultAddress = defaultNetwork ? defaultNetwork.address : '';

    return `
      <div class="option-content">
        <div class="payment-header-container">
          <div class="payment-header">
            <h3>Donate with ${method.name}</h3>
          </div>
          
          <div class="network-tabs-compact">
            <div class="custom-select-styled" id="custom-network-selector">
              <img src="assets/network-icons/${defaultNetworkIcon}.png" alt="${defaultNetworkName}" class="network-icon" id="current-network-icon">
              <span id="current-network-name" data-short="${defaultNetworkName}" data-full="${defaultNetworkDisplayName}">${defaultNetworkName}</span>
            </div>
            <div class="custom-select-options" id="network-options">
              <!-- Options will be populated by JavaScript -->
            </div>
            <!-- Keep the original select for fallback -->
            <select id="network-selector" class="network-select" style="display: none;">
              ${networkOptions}
            </select>
          </div>
        </div>
        
        <div class="qr-section">
          <div class="qr-container">
            <div class="qr-border"></div>
            <img id="network-qr" src="${defaultQrCode}" alt="${method.name} QR Code" class="qr-code">
            <div class="qr-shine"></div>
          </div>
        </div>
        
        <div class="wallet-address">
          <p>USDT-<span id="network-name-display" data-short="${defaultNetworkName}" data-full="${defaultNetworkDisplayName}">${defaultNetworkName}</span> <img src="assets/network-icons/${defaultNetworkIcon}.png" alt="${defaultNetworkName}" class="network-icon" id="label-network-icon"> address:</p>
          <div class="address-container">
            <code id="network-address">${defaultAddress}</code>
            <button class="copy-btn" data-clipboard="network-address">Copy</button>
          </div>
          ${method.referral ? `
          <div class="create-account" style="text-align: center; width: 100%;">
            <a href="${method.referral.url}" target="_blank" class="create-account-link">
              ${method.referral.linkText || 'Create a crypto exchange account'}
            </a>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }
  
  // Apply UI settings
  function applyUISettings(uiSettings) {
    if (!uiSettings) return;
    
    // Footer text
    const thankYouElement = document.querySelector('.thank-you');
    if (thankYouElement && uiSettings.footerText) {
      thankYouElement.textContent = uiSettings.footerText;
    }
    
    // Back button text
    const backBtn = document.getElementById('back-btn');
    if (backBtn && uiSettings.backButtonText !== undefined) {
      if (uiSettings.backButtonText.trim() !== '') {
        backBtn.innerHTML = uiSettings.backButtonText;
        backBtn.classList.add('text-back-btn');
      }
    }
  }
  
  // Setup UI functionality
  function setupUIFunctionality(config) {
    setupTabNavigation(config);
    setupCopyButtons();
    setupBackButton();
    setupNetworkSelectors();
  }
  
  // Configure tab navigation
  function setupTabNavigation(config) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const options = document.querySelectorAll('.option');
    
    if (tabButtons.length === 0) return;
    
    // Hide inactive tabs
    options.forEach(option => {
      option.style.display = 'none';
    });
    
    // Setup tab click handlers
    tabButtons.forEach(button => {
      const targetTabId = button.getAttribute('data-tab');
      
      button.addEventListener('click', function() {
        // Remove active class from all tabs
        tabButtons.forEach(btn => btn.classList.remove('active'));
        options.forEach(opt => {
          opt.classList.remove('active');
          opt.style.display = 'none';
        });
        
        // Add active class to clicked tab
        this.classList.add('active');
        
        // Show corresponding content
        const tabContentId = targetTabId + '-tab';
        const activeTab = document.getElementById(tabContentId);
        if (activeTab) {
          activeTab.classList.add('active');
          activeTab.style.display = 'block';
        }
      });
    });
    
    // Set initial active tab from config or use first tab
    let initialTabId = config?.ui?.initialTab;
    
    // Verify the tab exists
    if (initialTabId) {
      const initialTab = document.querySelector(`.tab-btn[data-tab="${initialTabId}"]`);
      if (!initialTab && tabButtons.length > 0) {
        initialTabId = tabButtons[0].getAttribute('data-tab');
      }
    } else if (tabButtons.length > 0) {
      initialTabId = tabButtons[0].getAttribute('data-tab');
    }
    
    // Activate initial tab
    if (initialTabId) {
      const initialTab = document.querySelector(`.tab-btn[data-tab="${initialTabId}"]`);
      if (initialTab) {
        initialTab.click();
      } else if (tabButtons.length > 0) {
        tabButtons[0].click();
      }
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
  
  // Configure all USDT network selectors
  function setupNetworkSelectors() {
    // Find any multi-network selectors
    const customSelectors = document.querySelectorAll('.custom-select-styled');
    
    customSelectors.forEach(customSelector => {
      const containerId = customSelector.closest('.option')?.id;
      if (!containerId) return;
      
      const networkOptions = document.getElementById('network-options');
      const networkSelector = document.getElementById('network-selector');
      
      if (!networkOptions || !networkSelector) return;
      
      // Setup dropdown toggle
      customSelector.addEventListener('click', function() {
        this.classList.toggle('active');
        networkOptions.classList.toggle('active');
      });
      
      // Close dropdown when clicking elsewhere
      document.addEventListener('click', function(e) {
        if (customSelector && !customSelector.contains(e.target) && 
            !networkOptions.contains(e.target) && customSelector.classList.contains('active')) {
          customSelector.classList.remove('active');
          networkOptions.classList.remove('active');
        }
      });
      
      // Populate network options
      populateNetworkOptions(networkSelector, networkOptions);
      
      // Setup network option click handlers
      const options = networkOptions.querySelectorAll('.custom-option');
      options.forEach(option => {
        option.addEventListener('click', function() {
          updateSelectedNetwork(this.getAttribute('data-value'));
          
          customSelector.classList.remove('active');
          networkOptions.classList.remove('active');
        });
      });
    });
  }
  
  // Populate network dropdown options
  function populateNetworkOptions(selectElement, optionsContainer) {
    if (!selectElement || !optionsContainer) return;
    
    optionsContainer.innerHTML = '';
    
    const options = selectElement.querySelectorAll('option');
    if (options.length === 0) return;
    
    Array.from(options).forEach(option => {
      const value = option.value;
      const displayName = option.getAttribute('data-short') || option.textContent;
      const networkAssetPath = networkMappings.iconMapping[value] || value.toLowerCase();
      
      const customOption = document.createElement('div');
      customOption.className = 'custom-option';
      customOption.setAttribute('data-value', value);
      
      customOption.innerHTML = `
        <img src="assets/network-icons/${networkAssetPath}.png" alt="${displayName}" class="network-icon">
        <span>${displayName}</span>
      `;
      
      optionsContainer.appendChild(customOption);
    });
  }
  
  // Update UI for selected network
  function updateSelectedNetwork(networkId) {
    // Get selected option
    const networkSelector = document.getElementById('network-selector');
    if (!networkSelector) return;
    
    const selectedOption = networkSelector.querySelector(`option[value="${networkId}"]`);
    if (!selectedOption) return;
    
    // Get data from selected option
    const networkShortName = selectedOption.getAttribute('data-short') || selectedOption.textContent;
    const networkFullName = selectedOption.getAttribute('data-full') || selectedOption.textContent;
    const networkIconName = networkMappings.iconMapping[networkId] || networkId.toLowerCase();
    
    // Update selector display
    const currentIcon = document.getElementById('current-network-icon');
    const currentName = document.getElementById('current-network-name');
    
    if (currentIcon) {
      currentIcon.src = `assets/network-icons/${networkIconName}.png`;
      currentIcon.alt = networkShortName;
    }
    
    if (currentName) {
      currentName.textContent = networkShortName;
      currentName.setAttribute('data-short', networkShortName);
      currentName.setAttribute('data-full', networkFullName);
    }
    
    // Update display in label
    const nameDisplay = document.getElementById('network-name-display');
    if (nameDisplay) {
      nameDisplay.textContent = networkShortName;
      nameDisplay.setAttribute('data-short', networkShortName);
      nameDisplay.setAttribute('data-full', networkFullName);
    }
    
    // Update icon in label
    const labelIcon = document.getElementById('label-network-icon');
    if (labelIcon) {
      labelIcon.src = `assets/network-icons/${networkIconName}.png`;
      labelIcon.alt = networkShortName;
    }
    
    // Update hidden selector
    networkSelector.value = networkId;
    
    // Update QR code - find in parent option content
    const optionContent = networkSelector.closest('.option-content');
    if (!optionContent) return;
    
    // Get config to find network details
    const config = window.LOCAL_DROP_CONFIG;
    if (!config || !config.donationMethods) return;
    
    // Find USDT config
    const usdtConfig = config.donationMethods.find(method => method.id === 'usdt');
    if (!usdtConfig || !usdtConfig.networks) return;
    
    // Find selected network
    const networkConfig = usdtConfig.networks.find(network => network.id === networkId);
    if (!networkConfig) return;
    
    // Update QR code
    const networkQR = document.getElementById('network-qr');
    if (networkQR && networkConfig.qrCode) {
      networkQR.src = networkConfig.qrCode;
      networkQR.alt = `${networkShortName} QR Code`;
    }
    
    // Update address
    const networkAddress = document.getElementById('network-address');
    if (networkAddress && networkConfig.address) {
      networkAddress.textContent = networkConfig.address;
    }
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