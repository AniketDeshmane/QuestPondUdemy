// QuestPond Beautifier - Popup Interaction Script

document.addEventListener('DOMContentLoaded', async () => {
  const toggleEnabled = document.getElementById('toggle-enabled');
  const toggleDarkMode = document.getElementById('toggle-darkmode');
  const toggleCurriculum = document.getElementById('toggle-curriculum');
  const btnRefresh = document.getElementById('btn-refresh');
  const btnDashboard = document.getElementById('btn-dashboard');
  const statusText = document.getElementById('status-text');

  // Load saved settings
  const settings = await chrome.storage.local.get([
    'extensionEnabled',
    'lectureDarkMode',
    'enhancedCurriculum'
  ]);

  toggleEnabled.checked = settings.extensionEnabled !== false;
  toggleDarkMode.checked = settings.lectureDarkMode !== false;
  toggleCurriculum.checked = settings.enhancedCurriculum !== false;

  updateStatus(toggleEnabled.checked);

  // Toggle events
  toggleEnabled.addEventListener('change', async () => {
    await chrome.storage.local.set({ extensionEnabled: toggleEnabled.checked });
    updateStatus(toggleEnabled.checked);
  });

  toggleDarkMode.addEventListener('change', async () => {
    await chrome.storage.local.set({ lectureDarkMode: toggleDarkMode.checked });
  });

  toggleCurriculum.addEventListener('change', async () => {
    await chrome.storage.local.set({ enhancedCurriculum: toggleCurriculum.checked });
  });

  function updateStatus(enabled) {
    if (enabled) {
      statusText.textContent = 'Active on QuestPond';
      statusText.parentElement.style.background = '#e6f7f0';
      statusText.parentElement.style.color = '#007a4d';
    } else {
      statusText.textContent = 'Paused (Original UI active)';
      statusText.parentElement.style.background = '#fff4e5';
      statusText.parentElement.style.color = '#b76e00';
    }
  }

  // Reload current active tab
  btnRefresh.addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.reload(tab.id);
      window.close();
    }
  });

  // Open QuestPond dashboard
  btnDashboard.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://questpond.teachable.com/p/questvideos' });
    window.close();
  });
});
