/**
 * LocalDrop Auto Configuration Module (v1.0.0)
 * 
 * This module provides functionality for auto-generating LocalDrop configuration by:
 * 1. Reading extension metadata from the host extension's manifest.json
 * 2. Detecting QR codes and payment methods
 * 3. Extracting theme colors from CSS
 * 4. Setting optimal popup dimensions
 * 
 * IMPORTANT: This script no longer runs automatically. Use localdrop-cli.js instead:
 * - Run "node localdrop-cli.js auto" to auto-configure
 * - Run "node localdrop-cli.js default" to reset to defaults
 */

// Export auto-config functions for use by CLI tool
module.exports = {
  loadExistingConfig,
  fetchManifest,
  detectPaymentMethods,
  extractThemeColors,
  fileExists,
  generateConfig,
  saveConfig
};

// Load existing config if available
async function loadExistingConfig() {
  try {
    // Try to fetch the existing config file
    const response = await fetch('./config.js');
    if (!response.ok) {
      return null;
    }
    
    const configContent = await response.text();
    
    // Extract the LOCAL_DROP_CONFIG object from the file content
    const configMatch = configContent.match(/const LOCAL_DROP_CONFIG = ({[\s\S]*?});/);
    if (configMatch && configMatch[1]) {
      try {
        // Parse the configuration object
        return JSON.parse(configMatch[1]);
      } catch (e) {
        console.warn('Could not parse existing config, will generate a new one');
      }
    }
    
    return null;
  } catch (e) {
    console.log('No existing config.js found, will generate a new one');
    return null;
  }
}

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

// Generate the configuration object, preserving existing values
function generateConfig(manifest, paymentMethods, themeColors, existingConfig) {
  // Default initial tab is the first payment method
  let initialTab = paymentMethods.length > 0 ? paymentMethods[0].id : "binance";
  
  // Create base configuration
  const newConfig = {
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
  
  // If we have an existing config, preserve user-modified values
  if (existingConfig) {
    console.log('Preserving values from existing config.js');
    
    // Preserve extension information if it exists
    if (existingConfig.extension) {
      // Preserve name if manually set
      if (existingConfig.extension.name && existingConfig.extension.name !== "LocalDrop") {
        newConfig.extension.name = existingConfig.extension.name;
      }
      
      // Preserve logo if manually set
      if (existingConfig.extension.logo && existingConfig.extension.logo !== "assets/logo.png") {
        newConfig.extension.logo = existingConfig.extension.logo;
      }
      
      // Preserve description if manually set
      if (existingConfig.extension.description && 
          existingConfig.extension.description !== "Support the development with a donation") {
        newConfig.extension.description = existingConfig.extension.description;
      }
      
      // Preserve theme colors if manually set
      if (existingConfig.extension.theme) {
        if (existingConfig.extension.theme.primaryColor) {
          newConfig.extension.theme.primaryColor = existingConfig.extension.theme.primaryColor;
        }
        if (existingConfig.extension.theme.secondaryColor) {
          newConfig.extension.theme.secondaryColor = existingConfig.extension.theme.secondaryColor;
        }
      }
    }
    
    // Preserve donation method customizations, especially addresses
    if (existingConfig.donationMethods && existingConfig.donationMethods.length > 0) {
      // For each detected payment method, check if there's a customized version in the existing config
      newConfig.donationMethods = newConfig.donationMethods.map(newMethod => {
        const existingMethod = existingConfig.donationMethods.find(m => m.id === newMethod.id);
        if (existingMethod) {
          // Preserve address, custom labels, and referral links
          if (existingMethod.address) newMethod.address = existingMethod.address;
          if (existingMethod.addressLabel) newMethod.addressLabel = existingMethod.addressLabel;
          
          // For multi-network methods like USDT, preserve network-specific addresses
          if (newMethod.isMultiNetwork && newMethod.networks && existingMethod.networks) {
            newMethod.networks = newMethod.networks.map(newNetwork => {
              const existingNetwork = existingMethod.networks.find(n => n.id === newNetwork.id);
              if (existingNetwork && existingNetwork.address) {
                newNetwork.address = existingNetwork.address;
              }
              return newNetwork;
            });
          }
          
          // Preserve referral information
          if (existingMethod.referral) {
            newMethod.referral = { ...newMethod.referral, ...existingMethod.referral };
          }
        }
        return newMethod;
      });
      
      // Add any additional custom payment methods that might be in the existing config
      const existingCustomMethods = existingConfig.donationMethods.filter(
        existingMethod => !newConfig.donationMethods.some(newMethod => newMethod.id === existingMethod.id)
      );
      
      if (existingCustomMethods.length > 0) {
        newConfig.donationMethods = [...newConfig.donationMethods, ...existingCustomMethods];
      }
    }
    
    // Preserve UI customizations
    if (existingConfig.ui) {
      // Preserve initialTab if set
      if (existingConfig.ui.initialTab) {
        newConfig.ui.initialTab = existingConfig.ui.initialTab;
      }
      
      // Preserve footer text if customized
      if (existingConfig.ui.footerText && 
          existingConfig.ui.footerText !== "Thank you for your support! ❤️") {
        newConfig.ui.footerText = existingConfig.ui.footerText;
      }
      
      // Preserve back button text
      if (existingConfig.ui.backButtonText !== undefined) {
        newConfig.ui.backButtonText = existingConfig.ui.backButtonText;
      }
      
      // Preserve display mode
      if (existingConfig.ui.displayMode) {
        newConfig.ui.displayMode = existingConfig.ui.displayMode;
      }
      
      // Preserve size settings
      if (existingConfig.ui.size) {
        newConfig.ui.size = { ...newConfig.ui.size, ...existingConfig.ui.size };
      }
    }
  }
  
  return newConfig;
}

// Save the generated config to config.js
async function saveConfig(config) {
  const configContent = `/**
 * LocalDrop Configuration File (auto-generated)
 * 
 * This file was automatically generated by the LocalDrop CLI tool.
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