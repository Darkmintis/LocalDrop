/**
 * LocalDrop Configuration File (v1.0.0)
 * 
 * Edit this file to customize the donation system for your extension.
 * This is the ONLY file you need to modify.
 * 
 * IMPORTANT: The QR codes and addresses in this file are for DEMONSTRATION PURPOSES ONLY.
 * Replace them with your own personal addresses and QR codes to receive donations.
 */

const LOCAL_DROP_CONFIG = {
  // Extension Information
  extension: {
    name: "LocalDrop",  // Your extension name
    logo: "assets/logo.png",  // Path to your extension logo
    description: "Support the development with a donation", // Brief description of your extension
    theme: {
      primaryColor: "#2563eb",  // Main theme color (buttons, highlights)
      secondaryColor: "#f59e0b" // Secondary color (used for some accents)
    }
  },
  
  // Donation Methods
  // IMPORTANT: Replace these demo addresses with your own payment details!
  // You can add, remove, or modify these methods
  donationMethods: [
    {
      id: "binance",
      name: "Binance Pay",
      logo: "assets/binance.png",
      qrCode: "assets/QR/BinancePay_qr.png",
      address: "732365122", // Binance Pay ID
      addressLabel: "Binance Pay ID:",
      referral: {
        text: "Don't have Binance?",
        linkText: "Create Binance Account",
        url: "https://accounts.binance.com/register?ref=WI12IR43&utm_medium=web_share_copy",
        icon: "assets/binance-sm.png"
      }
    },
    {
      id: "redotpay",
      name: "Redotpay",
      logo: "assets/RedotPay.png",
      qrCode: "assets/QR/RedotPay_qr.png",
      address: "1012623527", // Redotpay ID
      addressLabel: "Redotpay ID:",
      referral: {
        text: "Don't have Redotpay?",
        linkText: "Create Redotpay Account",
        url: "https://url.hk/i/en/79143",
        icon: "assets/redotpay-sm.png"
      }
    },
    {
      id: "usdt",
      name: "USDT",
      logo: "assets/usdt.png",
      isMultiNetwork: true, // Enable network selector
      networks: [
        {
          id: "BEP20",
          name: "BEP20",
          displayName: "Binance Smart Chain",
          qrCode: "assets/QR/USDT bnb.png",
          address: "0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5"
        },
        {
          id: "TRC20", 
          name: "TRC20",
          displayName: "TRON",
          qrCode: "assets/QR/USDT tron.png",
          address: "TAAgma5X2d2wFB9ew8VfF1fPZov8Z53y71"
        },
        {
          id: "SOL",
          name: "SOL",
          displayName: "Solana",
          qrCode: "assets/QR/USDT solana.png",
          address: "72MLiBNfWNamXKKMNqrEhR6Nw2iYca6qhuWHfkmUBPzs"
        },
        {
          id: "POL",
          name: "POL",
          displayName: "Polygon",
          qrCode: "assets/QR/USDT polygon.png",
          address: "0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5"
        },
        {
          id: "OP",
          name: "OP",
          displayName: "Optimism",
          qrCode: "assets/QR/USDT optimism.png",
          address: "0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5"
        },
        {
          id: "ARB",
          name: "ARB",
          displayName: "Arbitrum",
          qrCode: "assets/QR/USDT arbitrum.png",
          address: "0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5"
        },
        {
          id: "AVAX",
          name: "AVAX",
          displayName: "Avalanche",
          qrCode: "assets/QR/USDT avalanche.png",
          address: "0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5"
        },
        {
          id: "CELO",
          name: "CELO",
          displayName: "Celo",
          qrCode: "assets/QR/USDT celo.png",
          address: "0xc9A505E28D0ff4C627Bd64c62e885d7f4e94c6d5"
        },
        {
          id: "NEAR",
          name: "NEAR",
          displayName: "NEAR Protocol",
          qrCode: "assets/QR/USDT near.png",
          address: "2aa1004bab443e5afdd10122eba204ae428e995d1f93c670a8bf3736f54f9dbc"
        },
        {
          id: "APT",
          name: "APT",
          displayName: "Aptos",
          qrCode: "assets/QR/USDT aptos.png",
          address: "0x685b4c771911eecd5a786b0238380f75fd5ea7860e834f1370531a7b33ea23d4"
        },
        {
          id: "XTZ",
          name: "XTZ",
          displayName: "Tezos",
          qrCode: "assets/QR/USDT tezos.png",
          address: "tz1UVVKDnZFqb1pomqEwUjJAqxCxYH1b1YxR"
        },
        {
          id: "TON",
          name: "TON",
          displayName: "The Open Network",
          qrCode: "assets/QR/USDT ton.png",
          address: "UQCuM49YXZFBSbojWhs4Wy--u7cxzYLMwAJRljrApxriW30B"
        }
      ]
    }
  ],
  
  // UI Settings
  ui: {
    initialTab: "binance", // Which tab to show by default: "binance", "redotpay", or "usdt"
    footerText: "Thank you for your support! ❤️",
    backButtonText: "",
    
    // Display mode: "popup" or "new-tab"
    // - popup: Opens in a small window with configurable size
    // - new-tab: Opens in a full browser tab with full screen layout
    displayMode: "popup",
    
    // Donation UI size settings (applies to popup mode only)
    size: {
      width: 320,      // Default width
      height: 550,     // Default height updated to match other files

      // Chrome extension popup size constraints - optimal values for this UI
      maxWidth: 600,   // Maximum optimal width for content layout (600px)
      maxHeight: 600,  // Maximum height allowed by Chrome (600px)

      minWidth: 280,   // Minimum width for usable UI with QR code (280px)
      minHeight: 450,  // Minimum height for usable UI (450px)
      responsive: true // Enable responsive adjustments
    }
  }
};

// Don't modify below this line
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LOCAL_DROP_CONFIG;
}
