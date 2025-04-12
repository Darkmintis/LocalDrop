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

## 🚀 Quick Start (2-Minute Setup)

### Just Three Simple Steps:

1. **Clone this repo into your extension's root folder:**
   ```
   git clone https://github.com/Darkmintis/LocalDrop.git .
   ```

2. **Replace the QR codes in `assets/QR/` with your own payment QR codes**
   
3. **Update your wallet addresses in `config.js`**

That's it! LocalDrop is now ready to use in your extension.

## ⚙️ Configuration

LocalDrop is designed to be easily customizable through the `config.js` file. This central configuration allows you to personalize the donation system without modifying the core files.

### Basic Configuration

Configure your extension information including name, logo path, and theme colors in the config.js file.

### Payment Method Configuration

Set up your donation methods with properties like ID, name, logo path, QR code path, address, and referral information.

### UI Settings

Customize UI elements like the initial tab to display, footer text, and back button text.


## 🧩 Customizing QR Codes

Replace the default QR codes with your own:

1. Generate QR codes for your payment addresses using any QR code generator
2. Save them in the `assets/QR/` folder following this naming convention:
   - `BinancePay_qr.png` - For Binance Pay
   - `RedotPay_qr.png` - For Redotpay
   - `USDT bnb.png`, `USDT tron.png`, etc. - For various USDT networks


## 🚧 Roadmap

- Better Auto-detection of extension properties
- One-click setup with no manual configuration
- Dark mode support and automatic theme detection
- Additional payment methods
- Analytics integration



## 👥 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
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
