# LocalDrop

<div align="center">

![LocalDrop Logo](assets/logo.png)

[![GitHub release](https://img.shields.io/badge/release-v1.0.0-blue.svg)](https://github.com/Darkmintis/LocalDrop/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/Darkmintis/LocalDrop/pulls)

**An elegant, embeddable donation system for browser extensions**

[Features](#key-features) • [Installation](#installation) • [Configuration](#configuration) • [Examples](#integration-examples) • [Support](#support)

</div>

## 📖 Overview

LocalDrop is a professional donation system designed specifically for browser extensions. It enables users to contribute directly through your extension's interface, without being redirected to external pages - creating a seamless donation experience that maintains your extension's context and user flow.

<div align="center">
  <img src="assets/QR/BinancePay_qr.png" alt="LocalDrop Screenshot" width="250" style="border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</div>

## ⚠️ Important Notice

**The QR codes and wallet addresses in this repository are for DEMONSTRATION PURPOSES ONLY.**

To receive actual donations, you **MUST**:
1. Replace all demo QR codes with your own in the `assets/QR/` directory
2. Update wallet addresses in `config.js` with your actual addresses
3. Update referral links if you want to use your own referral programs

## 🌟 Key Features

- **Seamless Integration** - Stays within your extension's popup UI
- **Multi-Payment Support** - Includes Binance Pay, Redotpay, and USDT across 12 networks
- **Responsive Design** - Adapts perfectly to different extension popup sizes
- **Elegant UI/UX** - Professional animations and intuitive interactions
- **Highly Customizable** - Simple configuration through a single file
- **Custom Branding** - Easily adapts to your extension's visual identity
- **Copy-to-Clipboard** - One-click copying of wallet addresses
- **Network Selection** - USDT with support for multiple blockchains

## 🚀 Installation

### Step 1: Add Files to Your Extension

Clone this repository or download the files and copy them to your extension project:

```bash
git clone https://github.com/Darkmintis/LocalDrop.git
```

Essential files:
- `donate.html` - The donation interface
- `donate.css` - Styling for the donation page
- `donate.js` - Functionality for the donation system
- `config.js` - Configuration file (edit this to customize)
- `assets/` - Directory containing all images and QR codes

### Step 2: Update Your Manifest

Add the donation files to your extension's `manifest.json`:

```json
"web_accessible_resources": [
  {
    "resources": ["donate.html", "donate.css", "donate.js", "config.js", "assets/*"],
    "matches": ["<all_urls>"]
  }
]
```

### Step 3: Add a Donation Button

Add a button to your extension that opens the donation page:

```javascript
document.getElementById('donate-button').addEventListener('click', function() {
  chrome.windows.create({
    url: chrome.runtime.getURL('donate.html'),
    type: 'popup',
    width: 400,
    height: 600
  });
});
```

## ⚙️ Configuration

LocalDrop is designed to be easily customizable through the `config.js` file. This central configuration allows you to personalize the donation system without modifying the core files.

### Basic Configuration

```javascript
const LOCAL_DROP_CONFIG = {
  // Extension Information
  extension: {
    name: "Your Extension Name",
    logo: "path/to/your/logo.png",
    theme: {
      primaryColor: "#4285F4",
      secondaryColor: "#FBBC05"
    }
  }
};
```

### Payment Method Configuration

```javascript
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
      url: "YOUR_REFERRAL_LINK",
      icon: "assets/binance-sm.png"
    }
  },
  // Additional payment methods...
]
```

### UI Settings

```javascript
ui: {
  initialTab: "binance",
  footerText: "Thank you for your support!",
  backButtonText: "Back to Extension"
}
```

## 📝 Integration Examples

### Example 1: Popup Window

Open the donation system in a new popup window:

```javascript
// In your extension's JavaScript
function openDonationPopup() {
  chrome.windows.create({
    url: chrome.runtime.getURL('donate.html'),
    type: 'popup',
    width: 400,
    height: 600
  });
}

// Add this to your button's click handler
document.getElementById('support-button').addEventListener('click', openDonationPopup);
```

### Example 2: Embedded Iframe

Embed the donation system directly within your extension's interface:

```html
<!-- In your popup.html -->
<div id="content">
  <!-- Your extension's main content -->
</div>

<div id="donation-container" style="display: none; width: 100%; height: 500px;"></div>

<button id="donate-button">Support Us</button>
<button id="back-button" style="display: none;">Back</button>

<script src="popup.js"></script>
```

```javascript
// In popup.js
document.getElementById('donate-button').addEventListener('click', function() {
  // Toggle visibility
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
  // Return to main content
  document.getElementById('content').style.display = 'block';
  document.getElementById('donation-container').style.display = 'none';
  document.getElementById('donate-button').style.display = 'block';
  document.getElementById('back-button').style.display = 'none';
});
```

## 🧩 Customizing QR Codes

Replace the default QR codes with your own:

1. Generate QR codes for your payment addresses using any QR code generator
2. Save them in the `assets/QR/` folder following this naming convention:
   - `BinancePay_qr.png` - For Binance Pay
   - `RedotPay_qr.png` - For Redotpay
   - `USDT bnb.png`, `USDT tron.png`, etc. - For various USDT networks

## 📱 Browser Compatibility

- Google Chrome 88+
- Microsoft Edge 88+
- Mozilla Firefox 86+ (requires Manifest V3 support)
- Opera 74+
- Brave 1.20+

## 🚧 Roadmap

- Auto-detection of extension properties
- One-click setup with no manual configuration
- Dark mode support and automatic theme detection
- Additional payment methods
- Analytics integration

## 🔧 Troubleshooting

**Issue:** QR codes not displaying correctly
- Make sure your QR code images are in the correct format and located in the `assets/QR/` directory
- Verify the image paths in `config.js` are correct

**Issue:** Buttons not working
- Check your browser console for any JavaScript errors
- Verify that event listeners are properly attached to your buttons

## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Support

If you find LocalDrop useful, please consider supporting its development:

[![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsor-ff69b4)](https://github.com/sponsors/Darkmintis)
[![Star on GitHub](https://img.shields.io/github/stars/Darkmintis/LocalDrop?style=social)](https://github.com/Darkmintis/LocalDrop/stargazers)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Darkmintis">Darkmintis</a></sub>
</div>
