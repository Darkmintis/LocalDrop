# LocalDrop - In-Extension Donation System (v1.0.0)

A professional donation system that can be embedded directly within your Chrome extension, allowing users to donate without leaving your extension's popup.

## ⚠️ IMPORTANT NOTE ⚠️

**The QR codes and wallet addresses included in this project are for DEMONSTRATION PURPOSES ONLY.**

To receive actual donations, you **MUST**:
1. Replace the demo QR codes with your own QR codes in the `assets/QR/` folder
2. Update the wallet addresses in `config.js` with your own addresses
3. Update the referral links if you want to use your own referral programs

## Features

- Stays within the extension popup - no new tabs or external pages
- Beautiful, professional UI with animations and interactions
- Supports multiple payment methods: Binance Pay, Redotpay, and USDT
- USDT support across 12 different networks
- Responsive design that adapts to your extension's popup size
- **NEW IN v1.0.0**: Config-driven setup - all customization from a single file!
- Custom branding with your extension's name and logo

## Quick Start Guide

### 1. Add Files to Your Extension

Copy these files to your extension:
- `donate.html`
- `donate.css`
- `donate.js`
- `config.js` - Edit this file to customize (only file you need to modify)
- `assets/` folder (contains all QR codes and icons)

### 2. Update Your Manifest

Add the donation files to your extension's web_accessible_resources:

```json
"web_accessible_resources": [
  {
    "resources": ["donate.html", "donate.css", "donate.js", "config.js", "assets/*"],
    "matches": ["<all_urls>"]
  }
]
```

### 3. Customize via config.js

Edit `config.js` to customize LocalDrop for your extension:

```javascript
// Example config.js customization
const LOCAL_DROP_CONFIG = {
  // Extension Information
  extension: {
    name: "Your Extension Name",  // Your extension name
    logo: "path/to/your/logo.png",  // Path to your extension logo
    theme: {
      primaryColor: "#4285F4",  // Main theme color (buttons, highlights)
      secondaryColor: "#FBBC05" // Secondary color (used for some accents)
    }
  },
  
  // Other settings can remain default
};
```

### 4. Open the Donation Page

Add this code to your extension to open the donation page when a button is clicked:

```javascript
// Add this to your popup.js or background.js
document.getElementById('donate-button').addEventListener('click', function() {
  chrome.windows.create({
    url: chrome.runtime.getURL('donate.html'),
    type: 'popup',
    width: 400,
    height: 600
  });
});
```

## Detailed Customization Guide

### Edit config.js

The `config.js` file is the central place to customize all aspects of LocalDrop:

#### Extension Information
```javascript
extension: {
  name: "Your Extension Name",  // Your extension name
  logo: "path/to/your/logo.png",  // Path to your extension logo
  theme: {
    primaryColor: "#2563eb",  // Main theme color
    secondaryColor: "#f59e0b" // Secondary color
  }
}
```

#### Donation Methods

You can modify the existing donation methods or add new ones:

```javascript
donationMethods: [
  {
    id: "binance",
    name: "Binance Pay",
    logo: "assets/binance.png",
    qrCode: "assets/QR/BinancePay_qr.png",
    address: "YOUR_BINANCE_PAY_ID", // Replace with your Binance Pay ID
    addressLabel: "Binance Pay ID:",
    referral: {
      text: "Don't have Binance?",
      linkText: "Create Binance Account",
      url: "YOUR_REFERRAL_LINK", // Replace with your referral link
      icon: "assets/binance-sm.png"
    }
  },
  // Other methods...
]
```

#### UI Settings

```javascript
ui: {
  initialTab: "binance", // Which tab to show by default
  footerText: "Thank you for your support! ❤️",
  backButtonText: "Back to Extension"
}
```

### Update QR Codes

Replace the QR code images in the `assets/QR/` folder with your own QR codes:

1. Generate QR codes for your payment addresses
2. Place them in the `assets/QR/` folder with the following naming convention:
   - Binance Pay: `BinancePay_qr.png`
   - Redotpay: `RedotPay_qr.png`
   - USDT networks: `USDT bnb.png`, `USDT tron.png`, etc.

## Integration Examples

### Example 1: Using in popup.html

```html
<!-- Add to your popup.html -->
<button id="donate-button">Support Development ❤️</button>

<script src="popup.js"></script>
```

```javascript
// In popup.js
document.getElementById('donate-button').addEventListener('click', function() {
  chrome.windows.create({
    url: chrome.runtime.getURL('donate.html'),
    type: 'popup',
    width: 400,
    height: 600
  });
});
```

### Example 2: Embed in a section of your popup

```html
<!-- In your popup.html -->
<div id="content">
  <!-- Your extension's main content -->
</div>

<div id="donation-container" style="display: none; width: 100%; height: 500px;"></div>

<button id="donate-button">Donate</button>
<button id="back-button" style="display: none;">Back to Extension</button>
```

```javascript
// In popup.js
document.getElementById('donate-button').addEventListener('click', function() {
  // Hide main content, show donation section
  document.getElementById('content').style.display = 'none';
  document.getElementById('donation-container').style.display = 'block';
  document.getElementById('donate-button').style.display = 'none';
  document.getElementById('back-button').style.display = 'block';
  
  // Create and add iframe
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('donate.html');
  iframe.style.border = 'none';
  iframe.style.width = '100%';
  iframe.style.height = '100%';
  
  const container = document.getElementById('donation-container');
  container.innerHTML = '';
  container.appendChild(iframe);
});

document.getElementById('back-button').addEventListener('click', function() {
  // Show main content, hide donation section
  document.getElementById('content').style.display = 'block';
  document.getElementById('donation-container').style.display = 'none';
  document.getElementById('donate-button').style.display = 'block';
  document.getElementById('back-button').style.display = 'none';
});
```

## Browser Compatibility

- Chrome 88+
- Edge 88+
- Firefox 86+ (requires Manifest V3 support)

## Coming in v2.0

- Auto-detection of extension properties
- One-line setup with no manual configuration
- Automatic theme detection from your extension

## License

MIT License
