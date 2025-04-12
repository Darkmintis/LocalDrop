/**
 * LocalDrop Auto Configuration (v1.0.0)
 * 
 * This script automatically generates the LocalDrop configuration by:
 * 1. Reading extension metadata from the host extension's manifest.json
 * 2. Detecting QR codes and payment methods
 * 3. Extracting theme colors from CSS
 * 4. Setting optimal popup dimensions
 * 
 * Users only need to integrate this into their extension, replace QR codes and payment addresses.
 */

(async function() {
  console.log('🔄 LocalDrop Auto Configuration starting...');
  
  try {
    // Step 1: Read the host extension's manifest.json to get extension metadata
    const manifest = await fetchManifest();
    if (!manifest) {
      throw new Error('Failed to detect extension information');
    }
    
    // Step 2: Detect available payment methods by scanning QR folder
    const paymentMethods = await detectPaymentMethods();
    
    // Step 3: Extract theme colors from CSS or use defaults
    const themeColors = await extractThemeColors();
    
    // Step 4: Generate the config object
    const generatedConfig = generateConfig(manifest, paymentMethods, themeColors);
    
    // Step 5: Save the generated config
    await saveConfig(generatedConfig);
    
    console.log('✅ Configuration generated successfully!');
    console.log('📝 Next steps:');
    console.log('   1. Review the generated config.js file');
    console.log('   2. Replace QR codes in assets/QR/ folder with your own');
    console.log('   3. Update payment addresses in config.js');
    
  } catch (error) {
    console.error('❌ Error generating configuration:', error);
  }
})();

// Fetch and parse host extension's manifest.json
async function fetchManifest() {
  try {
    // First, try to fetch from the current directory (common case when integrated into extension)
    try {
      const response = await fetch('./manifest.json');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Looking for host extension manifest...');
    }
    
    // If that fails, try to go up one directory level (in case LocalDrop is in a subfolder)
    try {
      const response = await fetch('../manifest.json');
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.log('Could not find manifest.json in parent directory');
    }
    
    // If in a Chrome extension context, try to get manifest info from runtime
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      console.log('Using Chrome extension API to get manifest');
      return chrome.runtime.getManifest();
    }
    
    console.warn('Could not find host extension manifest.json, using default values');
    // If all attempts fail, use a dummy manifest for development/testing
    return {
      name: "LocalDrop Host Extension",
      description: "A simple donation system for Chrome extensions",
      icons: { "128": "assets/logo.png" }
    };
  } catch (error) {
    console.error('Error loading manifest:', error);
    return null;
  }
}

// Detect available payment methods by scanning QR folder
async function detectPaymentMethods() {
  const paymentMethods = [];
  
  try {
    // Check for Binance Pay QR code
    const binanceQrExists = await fileExists('./assets/QR/BinancePay_qr.png');
    const binanceLogoExists = await fileExists('./assets/binance.png');
    
    if (binanceQrExists && binanceLogoExists) {
      paymentMethods.push({
        id: "binance",
        name: "Binance Pay",
        logo: "assets/binance.png",
        qrCode: "assets/QR/BinancePay_qr.png",
        address: "YOUR_BINANCE_PAY_ID", // Placeholder to be replaced
        addressLabel: "Binance Pay ID:",
        referral: {
          text: "Don't have Binance?",
          linkText: "Create Binance Account",
          url: "https://accounts.binance.com/register",
          icon: "assets/binance.png"
        }
      });
    }
    
    // Check for RedotPay QR code
    const redotpayQrExists = await fileExists('./assets/QR/RedotPay_qr.png');
    const redotpayLogoExists = await fileExists('./assets/RedotPay.png');
    
    if (redotpayQrExists && redotpayLogoExists) {
      paymentMethods.push({
        id: "redotpay",
        name: "Redotpay",
        logo: "assets/RedotPay.png",
        qrCode: "assets/QR/RedotPay_qr.png",
        address: "YOUR_REDOTPAY_ID", // Placeholder to be replaced
        addressLabel: "Redotpay ID:",
        referral: {
          text: "Don't have Redotpay?",
          linkText: "Create Redotpay Account",
          url: "https://url.hk/i/en/79143",
          icon: "assets/redotpay.png"
        }
      });
    }
    
    // Check for USDT QR codes across networks
    const networks = [
      { id: "BEP20", name: "BEP20", displayName: "Binance Smart Chain", file: "USDT bnb.png" },
      { id: "TRC20", name: "TRC20", displayName: "TRON", file: "USDT tron.png" },
      { id: "SOL", name: "SOL", displayName: "Solana", file: "USDT solana.png" },
      { id: "POL", name: "POL", displayName: "Polygon", file: "USDT polygon.png" },
      { id: "OP", name: "OP", displayName: "Optimism", file: "USDT optimism.png" },
      { id: "ARB", name: "ARB", displayName: "Arbitrum", file: "USDT arbitrum.png" },
      { id: "AVAX", name: "AVAX", displayName: "Avalanche", file: "USDT avalanche.png" },
      { id: "CELO", name: "CELO", displayName: "Celo", file: "USDT celo.png" },
      { id: "NEAR", name: "NEAR", displayName: "NEAR Protocol", file: "USDT near.png" },
      { id: "APT", name: "APT", displayName: "Aptos", file: "USDT aptos.png" },
      { id: "XTZ", name: "XTZ", displayName: "Tezos", file: "USDT tezos.png" },
      { id: "TON", name: "TON", displayName: "The Open Network", file: "USDT ton.png" }
    ];
    
    const usdtLogoExists = await fileExists('./assets/usdt.png');
    if (usdtLogoExists) {
      const detectedNetworks = [];
      
      for (const network of networks) {
        const exists = await fileExists(`./assets/QR/${network.file}`);
        if (exists) {
          detectedNetworks.push({
            id: network.id,
            name: network.name,
            displayName: network.displayName,
            qrCode: `assets/QR/${network.file}`,
            address: `YOUR_${network.id}_USDT_ADDRESS` // Placeholder to be replaced
          });
        }
      }
      
      if (detectedNetworks.length > 0) {
        paymentMethods.push({
          id: "usdt",
          name: "USDT",
          logo: "assets/usdt.png",
          isMultiNetwork: true,
          networks: detectedNetworks
        });
      }
    }
    
  } catch (error) {
    console.error('Error detecting payment methods:', error);
  }
  
  return paymentMethods;
}

// Extract theme colors from CSS or use defaults
async function extractThemeColors() {
  try {
    const cssResponse = await fetch('./donate.css');
    if (!cssResponse.ok) {
      throw new Error(`Failed to fetch donate.css: ${cssResponse.status}`);
    }
    
    const css = await cssResponse.text();
    
    // Try to extract primary color
    let primaryColor = "#2563eb"; // Default blue
    const primaryColorMatch = css.match(/--primary(?:-color)?:\s*(#[0-9a-fA-F]{3,6});/);
    if (primaryColorMatch && primaryColorMatch[1]) {
      primaryColor = primaryColorMatch[1];
    }
    
    // Try to extract secondary color
    let secondaryColor = "#f59e0b"; // Default amber
    const secondaryColorMatch = css.match(/--secondary(?:-color)?:\s*(#[0-9a-fA-F]{3,6});/);
    if (secondaryColorMatch && secondaryColorMatch[1]) {
      secondaryColor = secondaryColorMatch[1];
    }
    
    return { primaryColor, secondaryColor };
    
  } catch (error) {
    console.error('Error extracting theme colors:', error);
    // Return default colors if extraction fails
    return { 
      primaryColor: "#2563eb", 
      secondaryColor: "#f59e0b" 
    };
  }
}

// Check if a file exists
async function fileExists(url) {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (e) {
    // If we're running in a local environment or extension context where fetch may fail
    // Try to use an Image object as fallback for image files
    if (url.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    }
    return false;
  }
}

// Generate the configuration object
function generateConfig(manifest, paymentMethods, themeColors) {
  // Default initial tab is the first payment method
  let initialTab = paymentMethods.length > 0 ? paymentMethods[0].id : "binance";
  
  return {
    // Extension Information
    extension: {
      name: manifest.name || "LocalDrop",
      logo: manifest.icons && manifest.icons["128"] ? manifest.icons["128"] : "assets/logo.png",
      description: manifest.description || "Support the development with a donation",
      theme: {
        primaryColor: themeColors.primaryColor,
        secondaryColor: themeColors.secondaryColor
      }
    },
    
    // Donation Methods detected from files
    donationMethods: paymentMethods,
    
    // UI Settings
    ui: {
      initialTab: initialTab,
      footerText: "Thank you for your support! ❤️",
      backButtonText: "",
      
      // Display mode: "popup" by default
      displayMode: "popup",
      
      // Optimal size settings for popup mode
      size: {
        width: 320,
        height: 550,
        
        // Chrome extension popup size constraints
        maxWidth: 600,
        maxHeight: 600,
        
        minWidth: 280,
        minHeight: 450,
        responsive: true
      }
    }
  };
}

// Save the generated config to config.js
async function saveConfig(config) {
  const configContent = `/**
 * LocalDrop Configuration File (auto-generated)
 * 
 * This file was automatically generated by auto-config.js
 * 
 * IMPORTANT: Replace the placeholder addresses with your own personal
 * payment addresses to receive donations.
 */

const LOCAL_DROP_CONFIG = ${JSON.stringify(config, null, 2)};

// Don't modify below this line
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOCAL_DROP_CONFIG;
}`;

  try {
    // In a browser extension context, we can't write to files directly
    // So we'll provide the content for download or copying
    console.log('Generated config:');
    console.log(configContent);
    
    // If we're in a Node.js environment (for local development)
    if (typeof window === 'undefined' && typeof process !== 'undefined') {
      const fs = require('fs');
      fs.writeFileSync('./config.js', configContent, 'utf8');
      console.log('Config saved to config.js');
    } else {
      // In browser, we'll create a download link
      const blob = new Blob([configContent], { type: 'text/javascript' });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = 'config.js';
      downloadLink.textContent = 'Download generated config.js';
      downloadLink.style.display = 'block';
      downloadLink.style.margin = '20px 0';
      
      // Add to document if running in browser
      if (document.body) {
        const container = document.createElement('div');
        container.style.padding = '20px';
        container.style.fontFamily = 'monospace';
        
        const heading = document.createElement('h2');
        heading.textContent = 'LocalDrop Auto Configuration';
        
        const instructions = document.createElement('p');
        instructions.textContent = 'Download the generated config and replace it in your extension files:';
        
        container.appendChild(heading);
        container.appendChild(instructions);
        container.appendChild(downloadLink);
        
        document.body.appendChild(container);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error saving config:', error);
    return false;
  }
}

// Function to run the auto-config from the browser
function runAutoConfig() {
  // Create UI for auto-config results
  const container = document.createElement('div');
  container.id = 'auto-config-container';
  container.style.padding = '20px';
  container.style.fontFamily = 'system-ui, sans-serif';
  container.style.maxWidth = '800px';
  container.style.margin = '0 auto';
  container.style.lineHeight = '1.5';
  
  const heading = document.createElement('h1');
  heading.textContent = 'LocalDrop Auto Configuration';
  heading.style.color = '#2563eb';
  
  const status = document.createElement('div');
  status.id = 'auto-config-status';
  status.textContent = 'Starting automatic configuration...';
  status.style.padding = '10px';
  status.style.margin = '20px 0';
  status.style.backgroundColor = '#f0f9ff';
  status.style.border = '1px solid #bae6fd';
  status.style.borderRadius = '4px';
  
  container.appendChild(heading);
  container.appendChild(status);
  
  if (document.body) {
    document.body.innerHTML = '';
    document.body.appendChild(container);
  }
  
  // Override console.log to also display in UI
  const originalConsoleLog = console.log;
  console.log = function() {
    originalConsoleLog.apply(console, arguments);
    
    const message = Array.from(arguments).join(' ');
    const logElement = document.createElement('div');
    logElement.textContent = message;
    logElement.style.padding = '5px 10px';
    
    if (message.includes('✅')) {
      logElement.style.color = '#059669';
    } else if (message.includes('❌')) {
      logElement.style.color = '#dc2626';
    }
    
    status.appendChild(logElement);
  };
  
  // Run the auto-config
  setTimeout(() => {
    fetchManifest().then(manifest => {
      console.log(`✅ Found extension: ${manifest.name}`);
      return Promise.all([
        manifest,
        detectPaymentMethods(),
        extractThemeColors()
      ]);
    }).then(([manifest, paymentMethods, themeColors]) => {
      console.log(`✅ Found ${paymentMethods.length} payment methods`);
      console.log(`✅ Theme colors: Primary ${themeColors.primaryColor}, Secondary ${themeColors.secondaryColor}`);
      
      const config = generateConfig(manifest, paymentMethods, themeColors);
      return saveConfig(config);
    }).then(() => {
      console.log('✅ Auto configuration completed');
    }).catch(error => {
      console.error('❌ Error:', error);
    });
  }, 500);
}

// Auto-run if in a browser context with DOM
if (typeof window !== 'undefined' && window.document) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAutoConfig);
  } else {
    runAutoConfig();
  }
}