#!/usr/bin/env node

/**
 * LocalDrop CLI Tool
 * 
 * This script provides command-line utilities for managing LocalDrop configuration:
 * - auto: Auto-detect host extension details and update config.js
 * - default: Reset LocalDrop to default configuration
 * 
 * Usage:
 * node localdrop-cli.js auto     - Auto-configure based on host extension
 * node localdrop-cli.js default  - Reset to default configuration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m'
};

// Print LocalDrop banner
function printBanner() {
  console.log(`
${colors.cyan}${colors.bright}▓█████▄  ▒█████   ███▄    █  ▄▄▄     ▄▄▄█████▓ ██▓ ▒█████   ███▄    █${colors.reset} 
${colors.cyan}${colors.bright}▒██▀ ██▌▒██▒  ██▒ ██ ▀█   █ ▒████▄   ▓  ██▒ ▓▒▓██▒▒██▒  ██▒ ██ ▀█   █${colors.reset} 
${colors.cyan}${colors.bright}░██   █▌▒██░  ██▒▓██  ▀█ ██▒▒██  ▀█▄ ▒ ▓██░ ▒░▒██▒▒██░  ██▒▓██  ▀█ ██▒${colors.reset}
${colors.cyan}${colors.bright}░▓█▄   ▌▒██   ██░▓██▒  ▐▌██▒░██▄▄▄▄██░ ▓██▓ ░ ░██░▒██   ██░▓██▒  ▐▌██▒${colors.reset}
${colors.cyan}${colors.bright}░▒████▓ ░ ████▓▒░▒██░   ▓██░ ▓█   ▓██▒ ▒██▒ ░ ░██░░ ████▓▒░▒██░   ▓██░${colors.reset}
${colors.cyan}${colors.bright} ▒▒▓  ▒ ░ ▒░▒░▒░ ░ ▒░   ▒ ▒  ▒▒   ▓▒█░ ▒ ░░   ░▓  ░ ▒░▒░▒░ ░ ▒░   ▒ ▒${colors.reset} 
${colors.cyan}${colors.bright} ░ ▒  ▒   ░ ▒ ▒░ ░ ░░   ░ ▒░  ▒   ▒▒ ░   ░     ▒ ░  ░ ▒ ▒░ ░ ░░   ░ ▒░${colors.reset}
${colors.bright} ░ ░  ░ ░ ░ ░ ▒     ░   ░ ░   ░   ▒    ░       ▒ ░░ ░ ░ ▒     ░   ░ ░${colors.reset} 
${colors.bright}   ░        ░ ░           ░       ░  ░         ░      ░ ░           ░${colors.reset} 
${colors.cyan}${colors.bright} ░                                                                     ${colors.reset}
${colors.yellow}LocalDrop CLI Tool${colors.reset} - ${colors.dim}Donation system for Chrome extensions${colors.reset}
`);
}

// Helper function to safely write files with proper encoding
function safeWriteFile(filePath, content) {
  try {
    // Always use UTF-8 without BOM to avoid encoding issues
    fs.writeFileSync(filePath, content, { encoding: 'utf8' });
    return true;
  } catch (error) {
    console.error(`${colors.red}❌ Error writing to ${path.basename(filePath)}:${colors.reset}`, error);
    
    // Try to recover if possible
    try {
      // Create a backup with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = `${filePath}.${timestamp}.bak`;
      
      console.log(`${colors.yellow}⚠️ Attempting to create backup at ${backupPath}${colors.reset}`);
      fs.writeFileSync(backupPath, content, { encoding: 'utf8' });
      console.log(`${colors.green}✅ Backup created successfully${colors.reset}`);
    } catch (backupError) {
      console.error(`${colors.red}❌ Could not create backup:${colors.reset}`, backupError);
    }
    
    return false;
  }
}

// Execute auto-configuration
async function runAutoConfig() {
  console.log(`${colors.blue}🔍 Looking for host extension details...${colors.reset}`);
  
  try {
    // Find parent directory (host extension)
    const currentDir = process.cwd();
    const parentDir = path.resolve(currentDir, '..');
    
    // Look for manifest.json in parent directory
    let manifestPath = '';
    let manifest = null;
    let isIntegratedInExtension = false;
    
    if (fs.existsSync(path.join(parentDir, 'manifest.json'))) {
      try {
        const parentManifestContent = fs.readFileSync(path.join(parentDir, 'manifest.json'), 'utf8');
        const parentManifest = JSON.parse(parentManifestContent);
        
        // Check if this looks like a real browser extension manifest (should have version & manifest_version)
        if (parentManifest.version && parentManifest.manifest_version) {
          manifestPath = path.join(parentDir, 'manifest.json');
          manifest = parentManifest;
          isIntegratedInExtension = true;
          console.log(`${colors.green}✅ Found host extension: ${manifest.name}${colors.reset}`);
        }
      } catch (err) {
        // If we can't read or parse the parent manifest, continue with other options
      }
    } 
    
    // If no valid parent extension found, check local manifest
    if (!isIntegratedInExtension && fs.existsSync(path.join(currentDir, 'manifest.json'))) {
      manifestPath = path.join(currentDir, 'manifest.json');
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      console.log(`${colors.yellow}⚠️ Using local manifest.json - LocalDrop not integrated in host extension${colors.reset}`);
    } 
    
    // If no parent or local manifest, show clear warning
    if (!manifest) {
      console.log(`${colors.yellow}⚠️ No host extension detected - using default LocalDrop values${colors.reset}`);
      console.log(`${colors.yellow}⚠️ This appears to be a standalone LocalDrop installation${colors.reset}`);
      manifest = {
        name: "LocalDrop",
        description: "A donation system for Chrome extensions",
        icons: { "128": "assets/logo.png" }
      };
    }
    
    // Try to detect extension theme colors
    let primaryColor = "#2563eb";
    let secondaryColor = "#f59e0b";
    let foundColors = false;
    
    // If we found a parent extension, search for its CSS files for theme colors
    if (isIntegratedInExtension) {
      // Check if there's a CSS file with theme colors in parent
      const cssFiles = [];
      fs.readdirSync(parentDir).forEach(file => {
        if (file.endsWith('.css')) {
          cssFiles.push(path.join(parentDir, file));
        }
      });
      
      // Subdirectories in parent that might contain CSS
      const subDirs = ['css', 'styles', 'style', 'assets', 'src'];
      subDirs.forEach(subDir => {
        const dirPath = path.join(parentDir, subDir);
        if (fs.existsSync(dirPath)) {
          fs.readdirSync(dirPath).forEach(file => {
            if (file.endsWith('.css')) {
              cssFiles.push(path.join(dirPath, file));
            }
          });
        }
      });
      
      // Extract colors from CSS files
      for (const cssFile of cssFiles) {
        try {
          const cssContent = fs.readFileSync(cssFile, 'utf8');
          
          // Look for primary color
          const primaryMatch = cssContent.match(/(--primary(?:-color)?|--theme-color|--main-color):\s*(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\))/i);
          if (primaryMatch && primaryMatch[2]) {
            primaryColor = primaryMatch[2];
            foundColors = true;
          }
          
          // Look for secondary color
          const secondaryMatch = cssContent.match(/(--secondary(?:-color)?|--accent-color|--highlight-color):\s*(#[0-9a-fA-F]{3,8}|rgb\([^)]+\)|rgba\([^)]+\))/i);
          if (secondaryMatch && secondaryMatch[2]) {
            secondaryColor = secondaryMatch[2];
            foundColors = true;
          }
          
          if (foundColors) break;
        } catch (err) {
          // Skip file if can't read
        }
      }
    }
    
    if (foundColors) {
      console.log(`${colors.green}✅ Found theme colors: Primary ${primaryColor}, Secondary ${secondaryColor}${colors.reset}`);
    } else {
      console.log(`${colors.yellow}⚠️ Using default theme colors${colors.reset}`);
    }
    
    // Check for donation methods
    console.log(`${colors.blue}🔍 Scanning for donation assets...${colors.reset}`);
    
    const qrDir = path.join(currentDir, 'assets', 'QR');
    const donationMethods = [];
    
    // Add Binance Pay if assets exist
    if (fs.existsSync(path.join(qrDir, 'BinancePay_qr.png')) && 
        fs.existsSync(path.join(currentDir, 'assets', 'binance.png'))) {
      donationMethods.push({
        id: "binance",
        name: "Binance Pay",
        logo: "assets/binance.png",
        qrCode: "assets/QR/BinancePay_qr.png",
        address: "YOUR_BINANCE_PAY_ID", // Placeholder
        addressLabel: "Binance Pay ID:",
        referral: {
          text: "Don't have Binance?",
          linkText: "Create Binance Account",
          url: "https://accounts.binance.com/register",
          icon: "assets/binance.png"
        }
      });
    }
    
    // Add RedotPay if assets exist
    if (fs.existsSync(path.join(qrDir, 'RedotPay_qr.png')) && 
        fs.existsSync(path.join(currentDir, 'assets', 'RedotPay.png'))) {
      donationMethods.push({
        id: "redotpay",
        name: "Redotpay",
        logo: "assets/RedotPay.png",
        qrCode: "assets/QR/RedotPay_qr.png",
        address: "YOUR_REDOTPAY_ID", // Placeholder
        addressLabel: "Redotpay ID:",
        referral: {
          text: "Don't have Redotpay?",
          linkText: "Create Redotpay Account",
          url: "https://url.hk/i/en/79143",
          icon: "assets/redotpay.png"
        }
      });
    }
    
    // Add USDT if assets exist
    const networkFiles = {
      "BEP20": { name: "BEP20", displayName: "Binance Smart Chain", file: "USDT bnb.png" },
      "TRC20": { name: "TRC20", displayName: "TRON", file: "USDT tron.png" },
      "SOL": { name: "SOL", displayName: "Solana", file: "USDT solana.png" },
      "POL": { name: "POL", displayName: "Polygon", file: "USDT polygon.png" },
      "OP": { name: "OP", displayName: "Optimism", file: "USDT optimism.png" },
      "ARB": { name: "ARB", displayName: "Arbitrum", file: "USDT arbitrum.png" },
      "AVAX": { name: "AVAX", displayName: "Avalanche", file: "USDT avalanche.png" },
      "CELO": { name: "CELO", displayName: "Celo", file: "USDT celo.png" },
      "NEAR": { name: "NEAR", displayName: "NEAR Protocol", file: "USDT near.png" },
      "APT": { name: "APT", displayName: "Aptos", file: "USDT aptos.png" },
      "XTZ": { name: "XTZ", displayName: "Tezos", file: "USDT tezos.png" },
      "TON": { name: "TON", displayName: "The Open Network", file: "USDT ton.png" }
    };
    
    const detectedNetworks = [];
    
    if (fs.existsSync(path.join(currentDir, 'assets', 'usdt.png'))) {
      Object.entries(networkFiles).forEach(([id, network]) => {
        if (fs.existsSync(path.join(qrDir, network.file))) {
          detectedNetworks.push({
            id,
            name: network.name,
            displayName: network.displayName,
            qrCode: `assets/QR/${network.file}`,
            address: `YOUR_${id}_USDT_ADDRESS` // Placeholder
          });
        }
      });
      
      if (detectedNetworks.length > 0) {
        donationMethods.push({
          id: "usdt",
          name: "USDT",
          logo: "assets/usdt.png",
          isMultiNetwork: true,
          networks: detectedNetworks
        });
      }
    }
    
    console.log(`${colors.green}✅ Found ${donationMethods.length} donation methods with ${detectedNetworks.length} USDT networks${colors.reset}`);
    
    // Check if config.js already exists and try to load it
    let existingConfig = null;
    const configPath = path.join(currentDir, 'config.js');
    let preservingUserChanges = false;
    
    // Check if we're already in default state
    let isDefaultConfig = false;
    
    if (fs.existsSync(configPath)) {
      try {
        const configContent = fs.readFileSync(configPath, 'utf8');
        
        // Check if this looks like a default config file
        if (configContent.includes('This file contains the default configuration settings for LocalDrop') || 
            configContent.includes('DEFAULT configuration reset by')) {
          isDefaultConfig = true;
          console.log(`${colors.blue}ℹ️ Current config.js is already in default state${colors.reset}`);
        }
        
        const configMatch = configContent.match(/const LOCAL_DROP_CONFIG = ({[\s\S]*?});/);
        
        if (configMatch && configMatch[1]) {
          existingConfig = JSON.parse(configMatch[1]);
          
          // Only preserve user customizations if not in default state
          if (!isDefaultConfig) {
            preservingUserChanges = true;
            console.log(`${colors.green}✅ Found existing config.js with user customizations - these will be preserved${colors.reset}`);
          }
        }
      } catch (err) {
        console.log(`${colors.yellow}⚠️ Couldn't parse existing config.js, creating a new one${colors.reset}`);
      }
    }
    
    // If we're not integrated in a host extension and config.js is already in default state,
    // we can exit early since no changes are needed
    if (!isIntegratedInExtension && isDefaultConfig) {
      console.log(`${colors.green}✅ LocalDrop is already in default state and not integrated in a host extension${colors.reset}`);
      console.log(`${colors.green}✅ No changes needed to config.js${colors.reset}`);
      return;
    }
    
    // Generate new configuration
    const newConfig = {
      extension: {
        name: manifest.name || "LocalDrop",
        logo: manifest.icons && manifest.icons["128"] ? manifest.icons["128"] : "assets/logo.png",
        description: manifest.description || "Support the development with a donation",
        theme: {
          primaryColor,
          secondaryColor
        }
      },
      donationMethods,
      ui: {
        initialTab: donationMethods.length > 0 ? donationMethods[0].id : "binance",
        footerText: "Thank you for your support! ❤️",
        backButtonText: "",
        displayMode: "popup",
        size: {
          width: 320,
          height: 550,
          maxWidth: 600,
          maxHeight: 600,
          minWidth: 280,
          minHeight: 450,
          responsive: true
        }
      }
    };
    
    // If we have an existing config to preserve, merge user modifications
    if (preservingUserChanges && existingConfig) {
      // Preserve extension info modifications
      if (existingConfig.extension) {
        if (existingConfig.extension.name !== "LocalDrop") {
          newConfig.extension.name = existingConfig.extension.name;
        }
        
        if (existingConfig.extension.logo !== "assets/logo.png") {
          newConfig.extension.logo = existingConfig.extension.logo;
        }
        
        if (existingConfig.extension.description !== "Support the development with a donation") {
          newConfig.extension.description = existingConfig.extension.description;
        }
        
        if (existingConfig.extension.theme) {
          if (existingConfig.extension.theme.primaryColor) {
            newConfig.extension.theme.primaryColor = existingConfig.extension.theme.primaryColor;
          }
          if (existingConfig.extension.theme.secondaryColor) {
            newConfig.extension.theme.secondaryColor = existingConfig.extension.theme.secondaryColor;
          }
        }
      }
      
      // Preserve donation method customizations
      if (existingConfig.donationMethods && existingConfig.donationMethods.length > 0) {
        // Update detected methods with user customizations
        newConfig.donationMethods = newConfig.donationMethods.map(newMethod => {
          const existingMethod = existingConfig.donationMethods.find(m => m.id === newMethod.id);
          if (existingMethod) {
            // Preserve addresses and settings
            if (existingMethod.address) newMethod.address = existingMethod.address;
            if (existingMethod.addressLabel) newMethod.addressLabel = existingMethod.addressLabel;
            
            // For USDT networks
            if (newMethod.isMultiNetwork && newMethod.networks && existingMethod.networks) {
              newMethod.networks = newMethod.networks.map(newNetwork => {
                const existingNetwork = existingMethod.networks.find(n => n.id === newNetwork.id);
                if (existingNetwork && existingNetwork.address) {
                  newNetwork.address = existingNetwork.address;
                }
                return newNetwork;
              });
              
              // Add networks from existing config that weren't auto-detected
              const extraNetworks = existingMethod.networks.filter(
                existingNetwork => !newMethod.networks.some(newNetwork => newNetwork.id === existingNetwork.id)
              );
              
              if (extraNetworks.length > 0) {
                newMethod.networks = [...newMethod.networks, ...extraNetworks];
                console.log(`${colors.green}✅ Preserved ${extraNetworks.length} custom USDT networks${colors.reset}`);
              }
            }
            
            // Preserve referral info
            if (existingMethod.referral) {
              newMethod.referral = { ...newMethod.referral, ...existingMethod.referral };
            }
          }
          return newMethod;
        });
        
        // Add custom payment methods that weren't auto-detected
        const customMethods = existingConfig.donationMethods.filter(
          existingMethod => !newConfig.donationMethods.some(newMethod => newMethod.id === existingMethod.id)
        );
        
        if (customMethods.length > 0) {
          newConfig.donationMethods = [...newConfig.donationMethods, ...customMethods];
          console.log(`${colors.green}✅ Preserved ${customMethods.length} custom payment methods${colors.reset}`);
        }
      }
      
      // Preserve UI customizations
      if (existingConfig.ui) {
        if (existingConfig.ui.initialTab) {
          newConfig.ui.initialTab = existingConfig.ui.initialTab;
        }
        
        if (existingConfig.ui.footerText && existingConfig.ui.footerText !== "Thank you for your support! ❤️") {
          newConfig.ui.footerText = existingConfig.ui.footerText;
        }
        
        if (existingConfig.ui.backButtonText) {
          newConfig.ui.backButtonText = existingConfig.ui.backButtonText;
        }
        
        if (existingConfig.ui.displayMode) {
          newConfig.ui.displayMode = existingConfig.ui.displayMode;
        }
        
        if (existingConfig.ui.size) {
          newConfig.ui.size = { ...newConfig.ui.size, ...existingConfig.ui.size };
        }
      }
    }
    
    // Message for the header based on whether we found a host extension
    const headerMessage = isIntegratedInExtension
      ? "This file was generated by auto command based on host extension details."
      : "This file was generated by auto command in standalone mode (no host extension)."
    
    // Save the configuration to config.js
    const configContent = `/**
 * LocalDrop Configuration File
 * 
 * ${headerMessage}
 * You can edit this file to customize the donation interface.
 * 
 * IMPORTANT: Replace placeholders (like YOUR_BINANCE_PAY_ID) with your actual
 * donation addresses to receive donations.
 */

const LOCAL_DROP_CONFIG = ${JSON.stringify(newConfig, null, 2)};

// Don't modify below this line
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOCAL_DROP_CONFIG;
}`;

    // Use safeWriteFile to write with proper encoding
    if (safeWriteFile(configPath, configContent)) {
      console.log(`${colors.green}✅ Configuration saved to config.js${colors.reset}`);
      console.log(`${colors.blue}${colors.bright}Next steps:${colors.reset}`);
      console.log(`${colors.dim}1. Replace placeholder addresses in config.js with your own payment details${colors.reset}`);
      console.log(`${colors.dim}2. Update QR codes in assets/QR/ folder if needed${colors.reset}`);
      console.log(`${colors.dim}3. Test the interface by opening donate.html${colors.reset}`);
    }
    
  } catch (error) {
    console.error(`${colors.red}❌ Error during auto-configuration:${colors.reset}`, error);
    process.exit(1);
  }
}

// Reset to default configuration
function resetToDefault() {
  console.log(`${colors.blue}🔄 Resetting LocalDrop to default configuration...${colors.reset}`);
  
  try {
    const configPath = path.join(process.cwd(), 'config.js');
    
    // Create default config
    const defaultConfig = {
      extension: {
        name: "LocalDrop",
        logo: "assets/logo.png",
        description: "Support the development with a donation",
        theme: {
          primaryColor: "#2563eb",
          secondaryColor: "#f59e0b"
        }
      },
      donationMethods: [
        {
          id: "binance",
          name: "Binance Pay",
          logo: "assets/binance.png",
          qrCode: "assets/QR/BinancePay_qr.png",
          address: "YOUR_BINANCE_PAY_ID",
          addressLabel: "Binance Pay ID:",
          referral: {
            text: "Don't have Binance?",
            linkText: "Create Binance Account",
            url: "https://accounts.binance.com/register",
            icon: "assets/binance.png"
          }
        },
        {
          id: "redotpay",
          name: "Redotpay",
          logo: "assets/RedotPay.png",
          qrCode: "assets/QR/RedotPay_qr.png",
          address: "YOUR_REDOTPAY_ID",
          addressLabel: "Redotpay ID:",
          referral: {
            text: "Don't have Redotpay?",
            linkText: "Create Redotpay Account",
            url: "https://url.hk/i/en/79143",
            icon: "assets/redotpay.png"
          }
        },
        {
          id: "usdt",
          name: "USDT",
          logo: "assets/usdt.png",
          isMultiNetwork: true,
          networks: [
            {
              id: "BEP20",
              name: "BEP20",
              displayName: "Binance Smart Chain",
              qrCode: "assets/QR/USDT bnb.png",
              address: "YOUR_BEP20_USDT_ADDRESS"
            },
            {
              id: "TRC20",
              name: "TRC20",
              displayName: "TRON",
              qrCode: "assets/QR/USDT tron.png",
              address: "YOUR_TRC20_USDT_ADDRESS"
            },
            {
              id: "SOL",
              name: "SOL",
              displayName: "Solana",
              qrCode: "assets/QR/USDT solana.png",
              address: "YOUR_SOL_USDT_ADDRESS"
            }
            // Other networks are available but not included in default config
          ]
        }
      ],
      ui: {
        initialTab: "binance",
        footerText: "Thank you for your support! ❤️",
        backButtonText: "",
        displayMode: "popup",
        size: {
          width: 320,
          height: 550,
          maxWidth: 600,
          maxHeight: 600,
          minWidth: 280,
          minHeight: 450,
          responsive: true
        }
      }
    };
    
    // Write default config with explicit UTF-8 encoding
    const configContent = `/**
 * LocalDrop Default Configuration File
 * 
 * This is the DEFAULT configuration reset by localdrop-cli.js default command.
 * You can edit this file to customize the donation interface.
 * 
 * IMPORTANT: Replace placeholders (like YOUR_BINANCE_PAY_ID) with your actual
 * donation addresses to receive donations.
 */

const LOCAL_DROP_CONFIG = ${JSON.stringify(defaultConfig, null, 2)};

// Don't modify below this line
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOCAL_DROP_CONFIG;
}`;

    // Use explicit UTF-8 encoding when writing the file
    safeWriteFile(configPath, configContent);
    console.log(`${colors.green}✅ Reset to default configuration${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}❌ Error resetting to default:${colors.reset}`, error);
    process.exit(1);
  }
}

// Show help information
function showHelp() {
  console.log(`
${colors.bright}Available commands:${colors.reset}
  ${colors.cyan}auto${colors.reset}      Auto-detect host extension details and update config.js
  ${colors.cyan}default${colors.reset}   Reset LocalDrop to default configuration
  ${colors.cyan}help${colors.reset}      Show this help information

${colors.bright}Examples:${colors.reset}
  node localdrop-cli.js auto
  node localdrop-cli.js default
`);
}

// Main function
async function main() {
  printBanner();
  
  const command = process.argv[2];
  
  if (!command) {
    showHelp();
    return;
  }
  
  switch (command.toLowerCase()) {
    case 'auto':
      await runAutoConfig();
      break;
    case 'default':
      resetToDefault();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.error(`${colors.red}Unknown command: ${command}${colors.reset}`);
      showHelp();
      process.exit(1);
  }
}

// Execute main function
main().catch(error => {
  console.error(`${colors.red}Unexpected error:${colors.reset}`, error);
  process.exit(1);
});