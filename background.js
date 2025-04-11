// LocalDrop Background Script
// This script handles opening the donation page based on the display mode settings in config.js

// Load configuration
let config = null;

// Chrome extension popup size constraints
const POPUP_MIN_WIDTH = 25;
const POPUP_MIN_HEIGHT = 25;
const POPUP_MAX_WIDTH = 800;
const POPUP_MAX_HEIGHT = 600;

// Function to load the config
function loadConfig() {
  return new Promise((resolve, reject) => {
    fetch(chrome.runtime.getURL('config.js'))
      .then(response => response.text())
      .then(text => {
        // Extract the config object by evaluating the script safely
        try {
          // Create a temporary function to evaluate the script and extract the config
          const getConfig = new Function(text + '; return LOCAL_DROP_CONFIG;');
          config = getConfig();
          resolve(config);
        } catch (error) {
          console.error('Error parsing config.js:', error);
          reject(error);
        }
      })
      .catch(error => {
        console.error('Error loading config.js:', error);
        reject(error);
      });
  });
}

// Load config when extension loads
loadConfig().then(() => {
  console.log('LocalDrop config loaded successfully');
}).catch(error => {
  console.error('Failed to load LocalDrop config:', error);
});

// Listen for messages from popup or context menu
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openDonation') {
    openDonationPage();
    sendResponse({ success: true });
  }
  return true; // Required for async sendResponse
});

// Function to constrain size to Chrome's popup limits
function constrainPopupSize(size) {
  return {
    width: Math.max(POPUP_MIN_WIDTH, Math.min(POPUP_MAX_WIDTH, size.width || POPUP_MIN_WIDTH)),
    height: Math.max(POPUP_MIN_HEIGHT, Math.min(POPUP_MAX_HEIGHT, size.height || POPUP_MIN_HEIGHT))
  };
}

// Function to open the donation page based on display mode
function openDonationPage() {
  // Reload config to ensure we have the latest settings
  loadConfig().then(() => {
    const displayMode = config?.ui?.displayMode || 'popup';
    let sizeSettings = config?.ui?.size || { width: 400, height: 600 };
    
    if (displayMode === 'new-tab') {
      // Open in a new tab with full screen
      chrome.tabs.create({
        url: chrome.runtime.getURL('donate.html'),
        active: true
      });
      console.log('LocalDrop opened in new tab (full screen mode)');
    } else {
      // Constrain size to Chrome's popup limits
      sizeSettings = constrainPopupSize(sizeSettings);
      
      // Open in a popup window with configured size
      chrome.windows.create({
        url: chrome.runtime.getURL('donate.html'),
        type: 'popup',
        width: sizeSettings.width,
        height: sizeSettings.height
      });
      console.log('LocalDrop opened in popup mode with size:', sizeSettings);
    }
  }).catch(error => {
    console.error('Error opening donation page:', error);
    // Fallback to popup mode if there's an error loading config
    const fallbackSize = constrainPopupSize({ width: 400, height: 600 });
    chrome.windows.create({
      url: chrome.runtime.getURL('donate.html'),
      type: 'popup',
      width: fallbackSize.width,
      height: fallbackSize.height
    });
  });
}

// Optional: Add a context menu item for convenience
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openLocalDrop',
    title: 'Support with donation',
    contexts: ['all']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openLocalDrop') {
    openDonationPage();
  }
});