// QuestPond Udemy Beautifier - Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(async () => {
  const existing = await chrome.storage.local.get(['extensionEnabled', 'darkMode', 'lectureDarkMode', 'gridColumns']);
  const defaults = {
    extensionEnabled: existing.extensionEnabled !== undefined ? existing.extensionEnabled : true,
    darkMode: existing.darkMode !== undefined ? existing.darkMode : false,
    lectureDarkMode: existing.lectureDarkMode !== undefined ? existing.lectureDarkMode : true,
    gridColumns: existing.gridColumns || '4'
  };
  await chrome.storage.local.set(defaults);
  console.log('QuestPond Udemy Beautifier initialized with settings:', defaults);
});

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.local.get(['extensionEnabled', 'darkMode', 'lectureDarkMode', 'gridColumns']).then(settings => {
      sendResponse(settings);
    });
    return true;
  }
  
  if (request.action === 'saveSettings') {
    chrome.storage.local.set(request.settings).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
