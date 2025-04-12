// LocalDrop Background Script - Popup mode enforced
// This script handles the configuration loading, context menu functionality,
// and automatic configuration generation

// Store configuration globally
let config = null;

// Auto-configuration system
function checkAndGenerateConfig() {
  try {
    // Use a simple versioning mechanism to check if re-configuration is needed
    chrome.storage.local.get(['configVersion', 'lastConfigUpdate'], function(data) {
      const manifestVersion = chrome.runtime.getManifest().version;
      const currentTime = Date.now();
      const lastUpdate = data.lastConfigUpdate || 0;
      
      // Check if we need to regenerate config (on version change or first run)
      if (data.configVersion !== manifestVersion || currentTime - lastUpdate > 30 * 24 * 60 * 60 * 1000) {
        console.log('LocalDrop: Auto-generating configuration...');
        
        // Execute the config generator in the background
        const configScript = document.createElement('script');
        configScript.src = chrome.runtime.getURL('config-generator.js');
        configScript.onload = function() {
          // Update version and timestamp after config generation
          chrome.storage.local.set({
            configVersion: manifestVersion,
            lastConfigUpdate: currentTime
          });
          
          console.log('LocalDrop: Configuration auto-generated successfully');
          // Reload config after generation
          loadConfig();
        };
        document.head.appendChild(configScript);
      }
    });
  } catch (error) {
    console.error('LocalDrop: Error in auto-configuration', error);
  }
}

// Load configuration when extension loads
function loadConfig() {
  fetch(chrome.runtime.getURL('config.js'))
    .then(response => response.text())
    .then(text => {
      try {
        // Safely evaluate the script to extract the config
        const getConfig = new Function(text + '; return LOCAL_DROP_CONFIG;');
        config = getConfig();
        console.log('LocalDrop: Config loaded successfully');
      } catch (error) {
        console.error('LocalDrop: Error parsing config.js', error);
      }
    })
    .catch(error => {
      console.error('LocalDrop: Error loading config.js', error);
    });
}

// Initialize the extension
function init() {
  // First load the config
  loadConfig();
  
  // Then check if we need to auto-generate a new one
  checkAndGenerateConfig();
}

// Run initialization
init();

// Listen for messages requesting the config
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getConfig') {
    sendResponse({ config });
    return true;
  }
  
  // Force using popup mode for any attempt to open donate page
  if (request.action === 'openDonate') {
    // Instead of opening a new tab or window, always use the popup
    chrome.action.openPopup();
    sendResponse({ success: true, mode: 'popup' });
    return true;
  }
  
  return true; // Required for async sendResponse
});

// Add context menu for easy access
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'openLocalDrop',
    title: 'Support with donation',
    contexts: ['all']
  });
  
  // Set popup as default action
  enforcePopupBehavior();
});

// Handle context menu clicks - force popup mode
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openLocalDrop') {
    // Always open as popup
    chrome.action.openPopup();
  }
});

// Intercept any chrome.tabs.create or chrome.windows.create attempts
// and redirect to popup mode instead
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'createTab' || message.action === 'createWindow') {
    console.log('LocalDrop: Intercepted tab/window creation attempt, using popup instead');
    chrome.action.openPopup();
    sendResponse({ success: true, mode: 'popup' });
    return true;
  }
});

// Function to enforce popup behavior
function enforcePopupBehavior() {
  // Ensure the popup is set as the default action
  chrome.action.setPopup({ popup: 'donate.html' });
  
  // Handle browser or extension updates
  chrome.runtime.onUpdateAvailable.addListener(() => {
    // Re-enforce popup setting before update
    chrome.action.setPopup({ popup: 'donate.html' });
  });
  
  // Handle browser startup
  chrome.runtime.onStartup.addListener(() => {
    // Re-enforce popup setting on startup
    chrome.action.setPopup({ popup: 'donate.html' });
  });
}

// Handle direct extension icon clicks
chrome.action.onClicked.addListener(() => {
  // This shouldn't fire if popup is set correctly,
  // but as a fallback, force open the popup
  chrome.action.openPopup();
});

// Emergency fallback - if popup fails to open for any reason
window.addEventListener('error', function(event) {
  if (event.message && event.message.includes('popup')) {
    console.warn('LocalDrop: Popup error detected, attempting recovery');
    // Try to recover by enforcing popup behavior again
    enforcePopupBehavior();
  }
});