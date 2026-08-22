# 🎓 QuestPond Udemy Beautifier

> A modern Manifest V3 Chrome / Edge / Brave extension that transforms QuestPond's learning dashboard and course player into a clean, sleek, and feature-rich **Udemy-style** experience.

[![GitHub release](https://img.shields.io/github/v/release/AniketDeshmane/QuestPondUdemy?color=purple)](https://github.com/AniketDeshmane/QuestPondUdemy/releases)
[![Build & Release](https://github.com/AniketDeshmane/QuestPondUdemy/actions/workflows/release.yml/badge.svg)](https://github.com/AniketDeshmane/QuestPondUdemy/actions/workflows/release.yml)

---

## 🌟 Key Features

### 1. 📊 Udemy-Style Dashboard (`/p/questvideos`)
* **Dark "My learning" Hero Banner**: Categorized tabs (*All courses*, *Interview Questions*, *Live Training*, *Latest Videos*).
* **Weekly Streak & Habit Tracker**: Visual goal card to motivate daily learning.
* **4-Column Responsive Course Card Grid**:
  * Auto-generated tech gradient artwork & badges (Angular, .NET, C#, Azure, SQL, Docker, React, AI/ML, Software Architecture, etc.).
  * Star ratings, lesson counts, and Udemy purple progress bars.
  * Interactive modal drawer to preview all lessons with durations.
* **Real-time Filter & Search**: Instant course filtering without full page reloads.
* **Interview Mode Switch**: Focus solely on interview question sets.

### 2. 🎬 Dark Theater Video Player (`/courses/*/lectures/*`)
* **Dark Top Navigation**: Course title in header, purple "Complete and Continue" action button.
* **Dark Video Canvas**: Cinema theater background for focus and comfort.
* **Curriculum Sidebar**:
  * Square completion checkboxes with purple checkmarks.
  * Parsed lecture duration tags (e.g. `⏱ 71:26`).
  * Section aggregate statistics (e.g. `11/11 | 4hr 32min`).
* **Udemy Sub-Tabs**: *Overview*, *Notes*, *Announcements*, *Reviews*, *Learning tools*.

### 3. ⚙️ Extension Popup
* Quick toggles for extension features.
* One-click tab reloader.

---

## 🚀 Installation Guide

### Option A: Install from Automated Release ZIP (Recommended)
1. Go to the [**Releases Page**](https://github.com/AniketDeshmane/QuestPondUdemy/releases).
2. Download the latest `questpond-udemy-v1.0-buildXX.zip`.
3. Unzip the downloaded file.
4. In Chrome/Brave/Edge, open `chrome://extensions/`.
5. Turn ON **Developer mode** in the top-right corner.
6. Click **Load unpacked** and choose the unzipped folder.

### Option B: Load from Source Code
1. Clone this repository:
   ```bash
   git clone https://github.com/AniketDeshmane/QuestPondUdemy.git
   ```
2. In your browser, open `chrome://extensions/`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `questpond-udemy-extension` directory.

---

## 📁 Repository Structure

```text
QuestPondUdemy/
├── .github/
│   └── workflows/
│       └── release.yml            # CI/CD: Automated version tagging & ZIP release
├── .gitlab-ci.yml                 # GitLab CI pipeline configuration
├── generate-icons.js              # Icon generator script
├── questpond-udemy-extension/     # Chrome Extension Source
│   ├── manifest.json              # Manifest V3 configuration
│   ├── service-worker.js          # Background service worker
│   ├── icons/                     # Generated PNG icons
│   ├── content-scripts/
│   │   ├── common.css             # Design tokens & resets
│   │   ├── dashboard.css          # Dashboard styling
│   │   ├── dashboard.js           # Dashboard DOM transformation
│   │   ├── lecture.css            # Lecture player styling
│   │   └── lecture.js             # Lecture DOM enhancements
│   └── popup/
│       ├── popup.html             # Extension popup UI
│       ├── popup.css              # Popup styling
│       └── popup.js               # Settings handler
└── README.md
```

---

## 🤖 Automated CI/CD Releases

Every commit pushed to the `main` or `master` branch triggers the GitHub Actions workflow to:
1. Extract the extension version from `manifest.json`.
2. Generate an automated build tag (e.g. `v1.0.0-b1`).
3. Package the extension into a clean, deployable `.zip` archive.
4. Publish a GitHub Release with the ZIP attached as a downloadable asset.
