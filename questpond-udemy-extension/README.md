# 🎓 QuestPond Udemy Beautifier (Chrome Extension)

Transform QuestPond's dashboard and course player into a modern, sleek **Udemy-style** learning platform.

---

## ✨ Features

### 1. 📊 Udemy-Style Course Dashboard (`/p/questvideos`)
* **Udemy "My Learning" Header**: Dark hero banner with tabs (*All courses*, *Interview Questions*, *Live Training*, *Latest Videos*).
* **Weekly Streak & Goal Card**: Track your active learning progress visually.
* **4-Column Responsive Course Cards Grid**:
  * Rich, tech-themed thumbnail artwork (Angular, .NET, C#, Azure, SQL, Docker, React, AI/ML, etc.).
  * Course titles, lesson counts, and instructor info.
  * Purple Udemy progress bars.
  * Star rating and "Start Course" quick actions.
* **Interactive Lecture Modal**: Click any course card to inspect all lessons with duration badges and jump directly to any lecture.
* **Live Search & Filter Pills**: Instant real-time filtering without page reloads.
* **Interview Mode Switch**: Filter specifically for interview question series.

### 2. 🎬 Dark Theater Video Player (`/courses/*/lectures/*`)
* **Dark Top Navigation Bar**: Clean course title, Udemy purple "Complete and Continue" button, and back navigation.
* **Dark Theater Video Wrapper**: Immersive black canvas for videos.
* **Udemy Sub-Tabs**: *Overview*, *Notes*, *Announcements*, *Reviews*, *Learning tools*.
* **Refined Sidebar Curriculum**:
  * Square completion checkboxes (filled purple on complete).
  * Section duration statistics (e.g. `11/11 | 4hr 32min`).
  * Individual lesson duration badges (e.g. `⏱ 71:26`).
  * Highlighted active lecture with purple left border.

### 3. ⚙️ Extension Popup
* One-click toggle to enable or disable the extension.
* Dark mode and curriculum feature preferences.
* Quick reload and direct link to QuestPond.

---

## 🚀 How to Install in Google Chrome / Brave / Edge

1. Open your browser and go to `chrome://extensions/` (or `edge://extensions/`).
2. Turn ON **"Developer mode"** in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left.
4. Select the folder:
   ```
   c:\Users\onerock\Downloads\PROJECT\QuestPond\questpond-udemy-extension
   ```
5. Open or refresh [QuestPond Dashboard](https://questpond.teachable.com/p/questvideos) to experience the new Udemy UI!

---

## 📁 Extension File Structure

```text
questpond-udemy-extension/
├── manifest.json                  # Manifest V3 configuration
├── service-worker.js              # Background service worker
├── icons/                         # Extension icons (16px, 48px, 128px)
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
├── content-scripts/
│   ├── common.css                 # Udemy design variables and reset
│   ├── dashboard.css              # Dashboard layout and card styles
│   ├── dashboard.js               # Dashboard DOM scraper and Udemy renderer
│   ├── lecture.css                # Lecture player dark theater and sidebar styles
│   └── lecture.js                 # Lecture metadata parser and sub-tabs
└── popup/
    ├── popup.html                 # Extension popup interface
    ├── popup.css                  # Popup stylesheet
    └── popup.js                   # Popup settings handler
```
