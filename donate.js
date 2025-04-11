document.addEventListener('DOMContentLoaded', function() {
  // Wait a short moment to ensure config.js has been fully processed
  setTimeout(() => {
    // Chrome extension popup size constraints
    const POPUP_MIN_WIDTH = 25;
    const POPUP_MIN_HEIGHT = 25;
    const POPUP_MAX_WIDTH = 800;
    const POPUP_MAX_HEIGHT = 600;
    
    console.log("Configuration loading status:", typeof LOCAL_DROP_CONFIG !== 'undefined' ? "Found" : "Not found");
    
    // Load configuration
    let config = typeof LOCAL_DROP_CONFIG !== 'undefined' ? LOCAL_DROP_CONFIG : null;
    
    // If config can't be found, use URL parameters as fallback (for backward compatibility)
    if (!config) {
      console.warn('LocalDrop: Configuration not found, using URL parameters as fallback');
      config = getConfigFromUrlParams();
    } else {
      console.log('LocalDrop: Configuration loaded successfully');
      // Log some config details to verify it's loaded properly
      if (config.extension && config.extension.name) {
        console.log('Extension name from config:', config.extension.name);
      }
    }
    
    // Apply display mode immediately before any other setup to avoid flickering
    const displayMode = config?.ui?.displayMode || 'popup';
    if (displayMode === 'new-tab') {
      // Remove popup-mode class and add new-tab-mode class immediately
      document.body.classList.remove('popup-mode');
      document.body.classList.add('new-tab-mode');
      console.log('Applied new-tab full-screen mode');
    }
    
    // Map short names to internal asset file paths
    // This allows us to use short names throughout the code but still reference files correctly
    const networkAssetMapping = {
      'BEP20': 'binance-smart-chain',
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
    };
    
    // Map for QR code file paths that use different naming conventions
    const qrPathMapping = {
      'BEP20': 'bnb',
      'TRC20': 'tron'
    };
    
    // Apply configuration settings to the UI elements
    applyConfigToUI(config);
    
    // Setup donation UI based on configuration
    setupDonationUI(config);
    
    // Function to initialize donation UI from config
    function setupDonationUI(config) {
      // Configure tab navigation
      setupTabNavigation();
      
      // Configure copy buttons
      setupCopyButtons();
      
      // Configure the back button
      setupBackButton();
      
      // Configure USDT network selector
      setupNetworkSelector(config);
    }

    // Configure USDT network selector with enhanced dropdown
    function setupNetworkSelector(config) {
      const networkSelector = document.getElementById('network-selector');
      const customSelector = document.getElementById('custom-network-selector');
      const networkOptions = document.getElementById('network-options');
      const currentNetworkIcon = document.getElementById('current-network-icon');
      const currentNetworkName = document.getElementById('current-network-name');
      const networkQR = document.getElementById('network-qr');
      const networkAddress = document.getElementById('network-address');
      const networkNameDisplay = document.getElementById('network-name-display');
      const labelNetworkIcon = document.getElementById('label-network-icon');
      
      // Debug console logs to check if elements exist
      console.log('Custom selector element exists:', !!customSelector);
      console.log('Network options element exists:', !!networkOptions);
      
      // Check display mode for network name format
      const isFullScreenMode = document.body.classList.contains('new-tab-mode');
      const nameAttribute = isFullScreenMode ? 'data-full' : 'data-short';
      
      // Update all network names based on display mode when body class changes
      function updateAllNetworkNames() {
        const isCurrentFullScreen = document.body.classList.contains('new-tab-mode');
        const currentAttribute = isCurrentFullScreen ? 'data-full' : 'data-short';
        
        // Update current selection in dropdown
        if (currentNetworkName) {
          const value = currentNetworkName.getAttribute(currentAttribute);
          if (value) {
            currentNetworkName.textContent = value;
          }
        }
        
        // Update network name display next to address
        if (networkNameDisplay) {
          const value = networkNameDisplay.getAttribute(currentAttribute);
          if (value) {
            networkNameDisplay.textContent = value;
          }
        }
        
        // Update all options in dropdown (if they use data attributes)
        const options = networkOptions.querySelectorAll('.custom-option span[data-short]');
        options.forEach(span => {
          const value = span.getAttribute(currentAttribute);
          if (value) {
            span.textContent = value;
          }
        });
      }
      
      // If no configuration for USDT networks is present, use the default selector
      if (!(config?.donationMethods?.find(m => m.id === 'usdt')?.networks)) {
        if (networkSelector && customSelector && networkOptions) {
          // First populate the dropdown options
          populateNetworkOptions(networkSelector, networkOptions);
          
          // Toggle dropdown on click - Use a separate function to avoid scope issues
          function toggleDropdown(e) {
            e.stopPropagation();
            console.log('Dropdown clicked');
            
            // Toggle active class on both the selector and options
            customSelector.classList.toggle('active');
            networkOptions.classList.toggle('active');
          }
          
          // Add click event listener
          customSelector.addEventListener('click', toggleDropdown);
          
          // Close dropdown when clicking outside
          document.addEventListener('click', function(e) {
            // Only process if dropdown is open
            if (customSelector.classList.contains('active')) {
              customSelector.classList.remove('active');
              networkOptions.classList.remove('active');
            }
          });
          
          // Prevent dropdown from closing when clicking on options
          networkOptions.addEventListener('click', function(e) {
            e.stopPropagation();
          });
          
          // Initial value setup
          updateNetworkUI(networkSelector.value);
        }
      }
      
      // Handle network change - This function will be called when a network option is clicked
      function handleNetworkChange(network) {
        console.log('Network changed to:', network);
        
        // Update hidden select value
        if (networkSelector) {
          networkSelector.value = network;
        }
        
        // Update UI elements
        updateNetworkUI(network);
        
        // Close dropdown after selection
        customSelector.classList.remove('active');
        networkOptions.classList.remove('active');
      }
      
      // Update UI when network changes
      function updateNetworkUI(network) {
        // Check current display mode again (might have changed)
        const currentIsFullScreen = document.body.classList.contains('new-tab-mode');
        const currentAttribute = currentIsFullScreen ? 'data-full' : 'data-short';
        
        // Get the selected option
        const option = networkSelector.querySelector(`option[value="${network}"]`);
        
        // Get the network asset path for icons (using the mapping we created)
        const networkAssetPath = networkAssetMapping[network] || network.toLowerCase();
        
        // Update the QR code image
        if (networkQR) {
          // Add loading class
          networkQR.classList.add('loading');
          
          // Map network value to QR image path using the qrPathMapping when available
          let qrFileName = qrPathMapping[network] || networkAssetPath;
          let qrPath = `assets/QR/USDT ${qrFileName}.png`;
          
          // Set QR code source
          networkQR.src = qrPath;
          
          // Remove loading class once loaded
          networkQR.onload = function() {
            networkQR.classList.remove('loading');
          };
        }
        
        // Update network address display
        if (networkAddress) {
          // Set appropriate address for each network (replace with your actual addresses)
          const networkAddresses = {
            'BEP20': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
            'TRC20': 'TJMBEamKWPrPyxcpPMGquLntY85ZTVvqSR',
            'SOL': 'HsCsw81JBQ9bZLMhBC1CqXwSS9LxmCqWRyiFfVeQP7CZ',
            'POL': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
            'OP': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
            'ARB': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
            'AVAX': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
            'CELO': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
            'NEAR': 'minixlab.near',
            'APT': '0xc9a505e28d0ff4c627bd64c62e885d7f4e94c6d5e68e2dd5b61b4a5d9c25847d',
            'XTZ': 'tz1eSHrNQgag2nGbCiYh1ksJkPJv7GAJfmCR',
            'TON': 'UQBQfUzV__3cxJ2Uz8x_YEGv4U29Xl3aVnUUeUQp2-KXsHSF'
          };
          
          // If we have config, try to get address from config instead
          const usdtConfig = config?.donationMethods?.find(m => m.id === 'usdt');
          if (usdtConfig && usdtConfig.networks) {
            // Look for the network in config using its ID (now using short name)
            const networkConfig = usdtConfig.networks.find(n => n.id === network);
            if (networkConfig && networkConfig.address) {
              networkAddress.textContent = networkConfig.address;
            } else {
              // Fallback to hardcoded addresses
              networkAddress.textContent = networkAddresses[network] || networkAddresses['BEP20'];
            }
          } else {
            // If no config, use hardcoded addresses
            networkAddress.textContent = networkAddresses[network] || networkAddresses['BEP20'];
          }
        }
        
        // Update network name display with short or full format based on display mode
        if (networkNameDisplay) {
          // Update data attributes
          if (option) {
            networkNameDisplay.setAttribute('data-short', option.getAttribute('data-short'));
            networkNameDisplay.setAttribute('data-full', option.getAttribute('data-full'));
          }
          
          // Use the appropriate display format based on current mode
          const displayValue = option ? option.getAttribute(currentAttribute) : network;
          networkNameDisplay.textContent = displayValue || network;
        }
        
        // Update dropdown UI elements - use dropdown option text from select
        if (currentNetworkName) {
          // Update data attributes
          if (option) {
            currentNetworkName.setAttribute('data-short', option.getAttribute('data-short'));
            currentNetworkName.setAttribute('data-full', option.getAttribute('data-full'));
          }
          
          // Use the appropriate display format based on current mode
          const displayValue = option ? option.getAttribute(currentAttribute) : network;
          currentNetworkName.textContent = displayValue || network;
        }
        
        // Update icons - use the asset path mapping for consistent file references
        if (currentNetworkIcon && labelNetworkIcon) {
          // Set icon source using the asset mapping
          const iconPath = `assets/network-icons/${networkAssetPath}.png`;
          currentNetworkIcon.src = iconPath;
          labelNetworkIcon.src = iconPath;
        }
        
        // Update selected option in the custom dropdown
        const options = networkOptions.querySelectorAll('.custom-option');
        options.forEach(opt => {
          if (opt.getAttribute('data-value') === network) {
            opt.classList.add('selected');
          } else {
            opt.classList.remove('selected');
          }
        });
      }
      
      // Populate the custom dropdown options
      function populateNetworkOptions(selectElement, optionsContainer) {
        if (!selectElement || !optionsContainer) return;
        console.log('Populating network options');
        
        // Clear existing options
        optionsContainer.innerHTML = '';
        
        // Check display mode for name format - this ensures we consistently use the right format
        const isCurrentFullScreen = document.body.classList.contains('new-tab-mode');
        const currentAttribute = isCurrentFullScreen ? 'data-full' : 'data-short';
        
        // Create and append options
        const options = selectElement.querySelectorAll('option');
        options.forEach(option => {
          const value = option.value;
          
          // Get appropriate name based on display mode from data attributes
          const displayValue = option.getAttribute(currentAttribute) || option.textContent;
          
          // Create custom option element
          const customOption = document.createElement('div');
          customOption.className = 'custom-option';
          customOption.setAttribute('data-value', value);
          
          // Create the span with data attributes for both short and full names
          const spanElement = document.createElement('span');
          spanElement.setAttribute('data-short', option.getAttribute('data-short'));
          spanElement.setAttribute('data-full', option.getAttribute('data-full'));
          spanElement.textContent = displayValue;
          
          // Get the network asset path for icons using our mapping
          const networkAssetPath = networkAssetMapping[value] || value.toLowerCase();
          
          // Add icon and text
          customOption.innerHTML = `
            <img src="assets/network-icons/${networkAssetPath}.png" alt="${displayValue}" class="network-icon">
          `;
          customOption.appendChild(spanElement);
          
          // Add selection logic with explicit function
          customOption.addEventListener('click', function() {
            handleNetworkChange(value);
          });
          
          // Add selected class to current selection
          if (selectElement.value === value) {
            customOption.classList.add('selected');
          }
          
          // Append to container
          optionsContainer.appendChild(customOption);
        });
        
        console.log(`Added ${options.length} network options to dropdown`);
      }
      
      // Listen for display mode changes and update network names accordingly
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            updateAllNetworkNames();
          }
        });
      });
      
      // Start observing the body element for class changes (popup-mode vs new-tab-mode)
      observer.observe(document.body, { attributes: true });
    }
    
    // ...existing code...
    
  }, 10); // Small delay to ensure config is loaded
  
  // Function to initialize donation UI from config
  function setupDonationUI(config) {
    // Configure tab navigation
    setupTabNavigation();
    
    // Configure copy buttons
    setupCopyButtons();
    
    // Configure the back button
    setupBackButton();
    
    // Configure USDT network selector
    setupNetworkSelector(config);
  }

  // Function to apply config settings to UI elements
  function applyConfigToUI(config) {
    if (!config) return;
    
    // Update extension information
    if (config.extension) {
      // Update extension logo
      const logoElement = document.getElementById('extension-logo');
      if (logoElement && config.extension.logo) {
        logoElement.src = config.extension.logo;
      }
      
      // Update extension name
      const nameElement = document.getElementById('extension-name');
      if (nameElement && config.extension.name) {
        nameElement.textContent = config.extension.name;
        document.title = `Support ${config.extension.name}`;
      }
      
      // Update extension description
      const descElement = document.getElementById('extension-description');
      if (descElement && config.extension.description) {
        descElement.textContent = config.extension.description;
      }
      
      // Apply theme colors
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
        
        // Apply header background
        const header = document.querySelector('header');
        if (header && config.extension.theme.primaryColor) {
          header.style.background = `linear-gradient(135deg, ${config.extension.theme.primaryColor}, ${adjustColor(config.extension.theme.primaryColor, -20)})`;
        }
      }
    }
    
    // Update donation methods
    if (config.donationMethods) {
      // Find each donation method in the config and update the corresponding UI
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
        }
      });
    }
    
    // Update UI settings
    if (config.ui) {
      // Set initial active tab
      if (config.ui.initialTab) {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const options = document.querySelectorAll('.option');
        
        // Clear all active classes
        tabButtons.forEach(btn => btn.classList.remove('active'));
        options.forEach(opt => opt.classList.remove('active'));
        
        // Set the specified tab as active
        const activeTabBtn = document.querySelector(`.tab-btn[data-tab="${config.ui.initialTab}"]`);
        if (activeTabBtn) {
          activeTabBtn.classList.add('active');
          const tabId = activeTabBtn.getAttribute('data-tab') + '-tab';
          const activeTab = document.getElementById(tabId);
          if (activeTab) {
            activeTab.classList.add('active');
          }
        }
      }
      
      // Update footer text
      if (config.ui.footerText) {
        const thankYouElement = document.querySelector('.thank-you');
        if (thankYouElement) {
          thankYouElement.textContent = config.ui.footerText;
        }
      }
      
      // Update back button text
      if (config.ui.backButtonText) {
        const backBtn = document.getElementById('back-btn');
        if (backBtn) {
          // If backButtonText is provided, replace icon with text
          if (config.ui.backButtonText.trim() !== '') {
            backBtn.innerHTML = config.ui.backButtonText;
            backBtn.classList.add('text-back-btn');
          }
        }
      }
    }
  }
  
  // Helper functions for updating specific donation method UIs
  function updateBinancePayUI(methodConfig) {
    // Update Binance Pay QR code
    if (methodConfig.qrCode) {
      const qrElement = document.querySelector('#binance-tab .qr-code');
      if (qrElement) {
        qrElement.src = methodConfig.qrCode;
      }
    }
    
    // Update logo
    if (methodConfig.logo) {
      const logoElement = document.querySelector('#binance-tab .payment-header img');
      if (logoElement) {
        logoElement.src = methodConfig.logo;
      }
    }
    
    // Update address label
    if (methodConfig.addressLabel) {
      const labelElement = document.querySelector('#binance-tab .wallet-address p');
      if (labelElement) {
        labelElement.textContent = methodConfig.addressLabel;
      }
    }
    
    // Update address
    if (methodConfig.address) {
      const addressElement = document.getElementById('binanceId');
      if (addressElement) {
        addressElement.textContent = methodConfig.address;
      }
    }
    
    // Update referral
    if (methodConfig.referral) {
      const createAccountLink = document.querySelector('#binance-tab .create-account-link');
      if (createAccountLink) {
        if (methodConfig.referral.linkText) {
          createAccountLink.textContent = methodConfig.referral.linkText;
        }
        if (methodConfig.referral.url) {
          createAccountLink.href = methodConfig.referral.url;
        }
      }
    }
  }
  
  function updateRedotpayUI(methodConfig) {
    // Update Redotpay QR code
    if (methodConfig.qrCode) {
      const qrElement = document.querySelector('#redotpay-tab .qr-code');
      if (qrElement) {
        qrElement.src = methodConfig.qrCode;
      }
    }
    
    // Update logo
    if (methodConfig.logo) {
      const logoElement = document.querySelector('#redotpay-tab .payment-header img');
      if (logoElement) {
        logoElement.src = methodConfig.logo;
      }
    }
    
    // Update address label
    if (methodConfig.addressLabel) {
      const labelElement = document.querySelector('#redotpay-tab .wallet-address p');
      if (labelElement) {
        labelElement.textContent = methodConfig.addressLabel;
      }
    }
    
    // Update address
    if (methodConfig.address) {
      const addressElement = document.getElementById('redotpayId');
      if (addressElement) {
        addressElement.textContent = methodConfig.address;
      }
    }
    
    // Update referral
    if (methodConfig.referral) {
      const createAccountLink = document.querySelector('#redotpay-tab .create-account-link');
      if (createAccountLink) {
        if (methodConfig.referral.linkText) {
          createAccountLink.textContent = methodConfig.referral.linkText;
        }
        if (methodConfig.referral.url) {
          createAccountLink.href = methodConfig.referral.url;
        }
      }
    }
  }
  
  function updateUSDTUI(methodConfig) {
    // Handle USDT multi-network UI
    if (methodConfig.isMultiNetwork && methodConfig.networks && methodConfig.networks.length > 0) {
      // Get network selector and network options elements
      const networkSelector = document.getElementById('network-selector');
      const networkOptions = document.getElementById('network-options');
      
      if (networkSelector && networkOptions) {
        // Clear existing options
        networkSelector.innerHTML = '';
        networkOptions.innerHTML = '';
        
        // Add new network options from config
        methodConfig.networks.forEach(network => {
          // Add to hidden select
          const option = document.createElement('option');
          option.value = network.id;
          option.textContent = network.displayName || network.name;
          networkSelector.appendChild(option);
          
          // Add to custom dropdown
          const customOption = document.createElement('div');
          customOption.className = 'custom-option';
          customOption.setAttribute('data-value', network.id);
          
          customOption.innerHTML = `
            <img src="assets/network-icons/${network.id}.png" alt="${network.name}" class="network-icon">
            <span>${network.displayName || network.name}</span>
          `;
          
          // Add click handler
          customOption.addEventListener('click', function() {
            handleNetworkChange(network.id, methodConfig.networks);
          });
          
          networkOptions.appendChild(customOption);
        });
        
        // Select the first network by default
        const firstNetwork = methodConfig.networks[0];
        if (firstNetwork) {
          networkSelector.value = firstNetwork.id;
          updateUSDTNetworkUI(firstNetwork);
        }
      }
    }
  }
  
  // Function to update USDT UI when network changes
  function handleNetworkChange(networkId, networks) {
    // Find the network in the config
    const selectedNetwork = networks.find(n => n.id === networkId);
    if (selectedNetwork) {
      // Update hidden select value
      const networkSelector = document.getElementById('network-selector');
      if (networkSelector) {
        networkSelector.value = networkId;
      }
      
      // Update UI elements
      updateUSDTNetworkUI(selectedNetwork);
      
      // Close dropdown after selection
      const customSelector = document.getElementById('custom-network-selector');
      const networkOptions = document.getElementById('network-options');
      
      if (customSelector && networkOptions) {
        customSelector.classList.remove('active');
        networkOptions.classList.remove('active');
      }
      
      // Reset dropdown arrow
      const dropdownArrow = document.querySelector('.dropdown-arrow');
      if (dropdownArrow) {
        dropdownArrow.classList.remove('rotated');
      }
    }
  }
  
  // Function to update USDT UI for a specific network
  function updateUSDTNetworkUI(network) {
    // Update the QR code
    const networkQR = document.getElementById('network-qr');
    if (networkQR && network.qrCode) {
      // Add loading class
      networkQR.classList.add('loading');
      
      // Set QR code source
      networkQR.src = network.qrCode;
      
      // Remove loading class once loaded
      networkQR.onload = () => {
        networkQR.classList.remove('loading');
      };
    }
    
    // Update the address
    const networkAddress = document.getElementById('network-address');
    if (networkAddress && network.address) {
      networkAddress.textContent = network.address;
    }
    
    // Update the network name display
    const networkNameDisplay = document.getElementById('network-name-display');
    if (networkNameDisplay) {
      networkNameDisplay.textContent = network.name;
    }
    
    // Update icons
    const currentNetworkIcon = document.getElementById('current-network-icon');
    const labelNetworkIcon = document.getElementById('label-network-icon');
    
    if (currentNetworkIcon && labelNetworkIcon) {
      const iconPath = `assets/network-icons/${network.id}.png`;
      currentNetworkIcon.src = iconPath;
      labelNetworkIcon.src = iconPath;
    }
    
    // Update current network name in dropdown
    const currentNetworkName = document.getElementById('current-network-name');
    if (currentNetworkName) {
      currentNetworkName.textContent = network.displayName || network.name;
    }
    
    // Update selected option in custom dropdown
    const options = document.querySelectorAll('#network-options .custom-option');
    options.forEach(opt => {
      if (opt.getAttribute('data-value') === network.id) {
        opt.classList.add('selected');
      } else {
        opt.classList.remove('selected');
      }
    });
  }
  
  // Function to extract configuration from URL parameters (legacy mode)
  function getConfigFromUrlParams() {
    // Create a default configuration
    const defaultConfig = {
      ui: {
        displayMode: 'popup'
      }
    };
    
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    // Override defaults with URL parameters
    if (mode === 'tab') {
      defaultConfig.ui.displayMode = 'new-tab';
    }
    
    return defaultConfig;
  }
  
  // Configure tab navigation functionality
  function setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const options = document.querySelectorAll('.option');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Remove active class from all buttons and options
        tabButtons.forEach(btn => btn.classList.remove('active'));
        options.forEach(opt => opt.classList.remove('active'));
        
        // Add active class to clicked button and corresponding option
        button.classList.add('active');
        const tabId = button.getAttribute('data-tab') + '-tab';
        document.getElementById(tabId).classList.add('active');
      });
    });
  }
  
  // Configure copy buttons
  function setupCopyButtons() {
    const copyButtons = document.querySelectorAll('.copy-btn');
    
    copyButtons.forEach(button => {
      button.addEventListener('click', () => {
        const clipboardId = button.getAttribute('data-clipboard');
        const contentElement = document.getElementById(clipboardId);
        const textToCopy = contentElement.textContent.trim();
        
        // Copy to clipboard
        navigator.clipboard.writeText(textToCopy)
          .then(() => {
            // Show success state
            button.classList.add('copy-success');
            button.textContent = 'Copied!';
            
            // Reset after 2 seconds
            setTimeout(() => {
              button.classList.remove('copy-success');
              button.textContent = 'Copy';
            }, 2000);
          })
          .catch(err => {
            console.error('Error copying text: ', err);
            button.textContent = 'Error!';
            
            // Reset after 2 seconds
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
      // Always make the back button visible
      backButton.style.display = 'flex'; // Changed from 'none' to 'flex' to ensure it's visible
      
      // Check if running in extension context
      if (typeof chrome !== 'undefined' && chrome.tabs) {
        backButton.addEventListener('click', () => {
          // Close the current popup or redirect back
          window.history.back();
        });
      } else {
        // In non-extension context, just use history.back()
        backButton.addEventListener('click', () => {
          window.history.back();
        });
      }
    }
  }
  
  // Configure USDT network selector with enhanced dropdown
  function setupNetworkSelector(config) {
    const networkSelector = document.getElementById('network-selector');
    const customSelector = document.getElementById('custom-network-selector');
    const networkOptions = document.getElementById('network-options');
    const currentNetworkIcon = document.getElementById('current-network-icon');
    const currentNetworkName = document.getElementById('current-network-name');
    // No dropdown arrow reference - removed from HTML
    const networkQR = document.getElementById('network-qr');
    const networkAddress = document.getElementById('network-address');
    const networkNameDisplay = document.getElementById('network-name-display');
    const labelNetworkIcon = document.getElementById('label-network-icon');
    
    // If no configuration for USDT networks is present, use the default selector
    if (!(config?.donationMethods?.find(m => m.id === 'usdt')?.networks)) {
      if (networkSelector && customSelector && networkOptions) {
        populateNetworkOptions(networkSelector, networkOptions);
        
        // Add compact class to ensure only logo and arrow are shown
        if (customSelector) {
          customSelector.classList.add('compact-network-selector');
        }
        
        // Toggle dropdown on click
        customSelector.addEventListener('click', (e) => {
          e.stopPropagation();
          
          const isActive = customSelector.classList.contains('active');
          
          // Toggle active class
          customSelector.classList.toggle('active');
          networkOptions.classList.toggle('active');
          
          // Rotate arrow when dropdown is active
          console.log('Dropdown active:', customSelector.classList.contains('active'));
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
          if (customSelector.classList.contains('active')) {
            customSelector.classList.remove('active');
            networkOptions.classList.remove('active');
            
            // Reset the dropdown arrow animation
          }
        });
        
        // Prevent dropdown from closing when clicking on options
        networkOptions.addEventListener('click', (e) => {
          e.stopPropagation();
        });
        
        // Initial value setup
        updateNetworkUI(networkSelector.value);
      }
    }
    
    // Handle network change
    function handleNetworkChange(network) {
      // Update hidden select value (for form submission)
      if (networkSelector) {
        networkSelector.value = network;
      }
      
      // Update UI elements
      updateNetworkUI(network);
      
      // Close dropdown after selection
      customSelector.classList.remove('active');
      networkOptions.classList.remove('active');
      
      // Reset dropdown arrow
    }
    
    // Update UI when network changes
    function updateNetworkUI(network) {
      // Get network display name
      const option = networkSelector.querySelector(`option[value="${network}"]`);
      const networkDisplayName = option ? option.textContent : 'BSC (BEP20)';
      
      // Format the display name for the label
      const shortNetworkName = network.toUpperCase();
      
      // Update the QR code image
      if (networkQR) {
        // Add loading class
        networkQR.classList.add('loading');
        
        // Map network value to image path (adjust as needed)
        let qrPath;
        if (network === 'bep20') {
          qrPath = 'assets/QR/USDT bnb.png';
        } else if (network === 'trc20') {
          qrPath = 'assets/QR/USDT tron.png';
        } else {
          qrPath = `assets/QR/USDT ${network}.png`;
        }
        
        // Set QR code source
        networkQR.src = qrPath;
        
        // Remove loading class once loaded
        networkQR.onload = () => {
          networkQR.classList.remove('loading');
        };
      }
      
      // Update network address display
      if (networkAddress) {
        // Set appropriate address for each network (replace with your actual addresses)
        const networkAddresses = {
          'BEP20': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
          'TRC20': 'TJMBEamKWPrPyxcpPMGquLntY85ZTVvqSR',
          'SOL': 'HsCsw81JBQ9bZLMhBC1CqXwSS9LxmCqWRyiFfVeQP7CZ',
          'POL': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
          'OP': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
          'ARB': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
          'AVAX': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
          'CELO': '0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5',
          'NEAR': 'minixlab.near',
          'APT': '0xc9a505e28d0ff4c627bd64c62e885d7f4e94c6d5e68e2dd5b61b4a5d9c25847d',
          'XTZ': 'tz1eSHrNQgag2nGbCiYh1ksJkPJv7GAJfmCR',
          'TON': 'UQBQfUzV__3cxJ2Uz8x_YEGv4U29Xl3aVnUUeUQp2-KXsHSF'
        };
        
        // If we have config, try to get address from config instead
        const usdtConfig = config?.donationMethods?.find(m => m.id === 'usdt');
        if (usdtConfig && usdtConfig.networks) {
          const networkConfig = usdtConfig.networks.find(n => n.id === network);
          if (networkConfig && networkConfig.address) {
            networkAddress.textContent = networkConfig.address;
          } else {
            // Fallback to hardcoded addresses
            networkAddress.textContent = networkAddresses[network] || networkAddresses['bep20'];
          }
        } else {
          // If no config, use hardcoded addresses
          networkAddress.textContent = networkAddresses[network] || networkAddresses['bep20'];
        }
      }
      
      // Update network name display
      if (networkNameDisplay) {
        networkNameDisplay.textContent = shortNetworkName;
      }
      
      // Update dropdown UI elements
      if (currentNetworkName) {
        currentNetworkName.textContent = networkDisplayName;
      }
      
      // Update icons
      if (currentNetworkIcon && labelNetworkIcon) {
        // Set icon source
        const iconPath = `assets/network-icons/${network}.png`;
        currentNetworkIcon.src = iconPath;
        labelNetworkIcon.src = iconPath;
      }
      
      // Update selected option in the custom dropdown
      const options = networkOptions.querySelectorAll('.custom-option');
      options.forEach(opt => {
        if (opt.getAttribute('data-value') === network) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });
    }
    
    // Populate the custom dropdown options
    function populateNetworkOptions(selectElement, optionsContainer) {
      if (!selectElement || !optionsContainer) return;
      
      // Clear existing options
      optionsContainer.innerHTML = '';
      
      // Create and append options
      const options = selectElement.querySelectorAll('option');
      options.forEach(option => {
        const value = option.value;
        const text = option.textContent;
        
        // Create custom option element
        const customOption = document.createElement('div');
        customOption.className = 'custom-option';
        customOption.setAttribute('data-value', value);
        
        // Add icon and text
        customOption.innerHTML = `
          <img src="assets/network-icons/${value}.png" alt="${text}" class="network-icon">
          <span>${text}</span>
        `;
        
        // Add selection logic
        customOption.addEventListener('click', () => {
          handleNetworkChange(value);
        });
        
        // Add selected class to current selection
        if (selectElement.value === value) {
          customOption.classList.add('selected');
        }
        
        // Append to container
        optionsContainer.appendChild(customOption);
      });
    }
  }
  
  // Helper function to adjust color brightness
  function adjustColor(color, percent, lighten = false) {
    // Convert hex to RGB
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);

    if (lighten) {
      // Lighten color: move towards 255
      R = Math.min(255, Math.max(0, R + percent));
      G = Math.min(255, Math.max(0, G + percent));
      B = Math.min(255, Math.max(0, B + percent));
    } else {
      // Darken/brighten: adjust by percentage
      R = Math.min(255, Math.max(0, R + percent));
      G = Math.min(255, Math.max(0, G + percent));
      B = Math.min(255, Math.max(0, B + percent));
    }

    // Convert back to hex
    const RR = ((R.toString(16).length === 1) ? "0" + R.toString(16) : R.toString(16));
    const GG = ((G.toString(16).length === 1) ? "0" + G.toString(16) : G.toString(16));
    const BB = ((B.toString(16).length === 1) ? "0" + B.toString(16) : B.toString(16));

    return "#" + RR + GG + BB;
  }
});