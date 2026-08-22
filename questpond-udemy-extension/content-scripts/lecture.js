// QuestPond Udemy Beautifier - Lecture & Video Player Page Script

(function () {
  'use strict';

  if (window.__qp_lecture_initialized) return;

  function isLecturePage() {
    return (
      document.querySelector('#courseSidebar') !== null ||
      document.querySelector('.lecture-content') !== null ||
      document.querySelector('.course-player-container') !== null ||
      window.location.pathname.includes('/lectures/') ||
      document.body.classList.contains('revamped_lecture_player') ||
      document.body.classList.contains('lecture')
    );
  }

  function getLectureId() {
    const match = window.location.pathname.match(/lectures\/(\d+)/);
    return match ? match[1] : window.location.pathname;
  }

  function transformLecturePage() {
    document.body.classList.add('qp-udemy-transformed');

    const lectureMain = document.querySelector('div[role="main"].lecture-content, .course-mainbar');
    if (!lectureMain) return;

    // 1. Header Course Title Enhancement
    const headerLeft = document.querySelector('header .lecture-left, .course-player__header-left');
    const courseTitleEl = document.querySelector('.course-sidebar-head h2, .course-sidebar__header');
    
    if (headerLeft && courseTitleEl && !document.querySelector('.qp-header-course-title')) {
      const courseTitle = courseTitleEl.textContent.trim();
      const titleSpan = document.createElement('span');
      titleSpan.className = 'qp-header-course-title';
      titleSpan.textContent = courseTitle;
      titleSpan.title = courseTitle;
      headerLeft.appendChild(titleSpan);
    }

    // 2. Arrange Layout: Video Player at Top, then Heading, then Tabs, then Tab Content
    const videoAttachment = document.querySelector('.lecture-attachment-type-video, .course-mainbar__video-area');
    const headingEl = document.querySelector('h2#lecture_heading, .course-mainbar__top-heading');
    const originalContents = document.querySelector('#lecture-contents-container, .lecture-attachment-type-text, .lecture-attachment-type-file');

    // Create Theater Wrapper if needed
    let theaterWrapper = document.querySelector('.qp-video-theater-wrapper');
    if (videoAttachment && !theaterWrapper) {
      theaterWrapper = document.createElement('div');
      theaterWrapper.className = 'qp-video-theater-wrapper';

      const theaterContainer = document.createElement('div');
      theaterContainer.className = 'qp-video-theater-container';

      // Move video attachment inside theater container
      videoAttachment.parentNode.insertBefore(theaterWrapper, videoAttachment);
      theaterContainer.appendChild(videoAttachment);
      theaterWrapper.appendChild(theaterContainer);
    }

    // Re-order within lectureMain: Theater first, then Heading
    if (theaterWrapper && headingEl) {
      lectureMain.prepend(theaterWrapper);
      theaterWrapper.after(headingEl);
    }

    // 3. Create or Update Tabs & Interactive Tab Panes
    let tabsRow = document.querySelector('.qp-lecture-tabs-row');
    let tabContainer = document.querySelector('.qp-tab-panes-wrapper');

    if (headingEl && !tabsRow) {
      tabsRow = document.createElement('div');
      tabsRow.className = 'qp-lecture-tabs-row';
      tabsRow.innerHTML = `
        <div class="qp-lecture-subtab active" data-tab="overview">Overview</div>
        <div class="qp-lecture-subtab" data-tab="notes">Notes</div>
        <div class="qp-lecture-subtab" data-tab="announcements">Announcements</div>
        <div class="qp-lecture-subtab" data-tab="reviews">Reviews</div>
        <div class="qp-lecture-subtab" data-tab="tools">Learning tools</div>
      `;
      headingEl.after(tabsRow);
    }

    if (tabsRow && !tabContainer) {
      tabContainer = document.createElement('div');
      tabContainer.className = 'qp-tab-panes-wrapper';

      // Pane 1: Overview (Contains original notes & attachments)
      const overviewPane = document.createElement('div');
      overviewPane.className = 'qp-tab-pane active';
      overviewPane.id = 'qp-pane-overview';
      if (originalContents) {
        overviewPane.appendChild(originalContents);
      }

      // Pane 2: Interactive Notes
      const notesPane = document.createElement('div');
      notesPane.className = 'qp-tab-pane';
      notesPane.id = 'qp-pane-notes';
      renderNotesSystem(notesPane);

      // Pane 3: Announcements
      const announcementsPane = document.createElement('div');
      announcementsPane.className = 'qp-tab-pane';
      announcementsPane.id = 'qp-pane-announcements';
      announcementsPane.innerHTML = `
        <div class="qp-announcement-card">
          <div class="qp-announcement-header">
            <img src="https://uploads.teachablecdn.com/attachments/lLUWyYLvQ1mnIeKlBHri_quest+pond.jpg" class="qp-announcement-avatar" alt="Instructor">
            <div>
              <strong>QuestPond Instructor Team</strong>
              <span>Posted recently • Course Announcement</span>
            </div>
          </div>
          <p>Welcome to this module! Make sure to download the attached source code and follow along with the hands-on lab exercises. If you have questions, leave a note or ask in our live weekend sessions.</p>
        </div>
      `;

      // Pane 4: Reviews
      const reviewsPane = document.createElement('div');
      reviewsPane.className = 'qp-tab-pane';
      reviewsPane.id = 'qp-pane-reviews';
      reviewsPane.innerHTML = `
        <div class="qp-reviews-card">
          <h3>Student Feedback & Ratings</h3>
          <div class="qp-stars-summary">
            <span class="qp-rating-num">4.8</span>
            <div class="qp-stars-row">★★★★★</div>
            <span class="qp-rating-count">Course Rating • 1,420+ Reviews</span>
          </div>
          <div class="qp-review-item">
            <strong>Rahul S.</strong> <span style="color:#e59819;">★★★★★</span>
            <p>Excellent step-by-step practical explanations. The architecture diagrams and code samples are top-notch!</p>
          </div>
        </div>
      `;

      // Pane 5: Learning Tools
      const toolsPane = document.createElement('div');
      toolsPane.className = 'qp-tab-pane';
      toolsPane.id = 'qp-pane-tools';
      toolsPane.innerHTML = `
        <div class="qp-tools-card">
          <h3>Learning Schedule & Reminders</h3>
          <p>Set a weekly study goal to stay consistent and finish your course faster.</p>
          <div class="qp-goal-box">
            <span>Weekly Goal: <strong>3 sessions / week</strong></span>
            <button class="qp-btn-purple" style="padding: 6px 14px; font-size: 13px;">Sync with Calendar</button>
          </div>
        </div>
      `;

      tabContainer.appendChild(overviewPane);
      tabContainer.appendChild(notesPane);
      tabContainer.appendChild(announcementsPane);
      tabContainer.appendChild(reviewsPane);
      tabContainer.appendChild(toolsPane);

      tabsRow.after(tabContainer);

      // Sub-tab switching logic
      tabsRow.querySelectorAll('.qp-lecture-subtab').forEach(tab => {
        tab.addEventListener('click', () => {
          tabsRow.querySelectorAll('.qp-lecture-subtab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          const targetTab = tab.getAttribute('data-tab');
          tabContainer.querySelectorAll('.qp-tab-pane').forEach(pane => pane.classList.remove('active'));
          
          const activePane = document.getElementById(`qp-pane-${targetTab}`);
          if (activePane) activePane.classList.add('active');
        });
      });
    }

    // 4. Transform Sidebar Curriculum Items & Durations
    const sectionItems = document.querySelectorAll('li.section-item, li.course-sidebar__element');
    let totalMinutes = 0;
    let completedCount = 0;

    sectionItems.forEach(li => {
      if (li.classList.contains('completed')) completedCount++;

      const nameEl = li.querySelector('.lecture-name, .course-sidebar__element-col-text');
      if (nameEl && !nameEl.dataset.parsed) {
        nameEl.dataset.parsed = 'true';
        const rawText = nameEl.textContent.trim();
        const durationMatch = rawText.match(/\((\d+:\d+(?::\d+)?)\)/);

        if (durationMatch) {
          const durationStr = durationMatch[1];
          const cleanTitle = rawText.replace(/\s*\(\d+:\d+(?::\d+)?\)\s*$/, '').trim();

          const parts = durationStr.split(':').map(Number);
          if (parts.length === 2) {
            totalMinutes += parts[0] + parts[1] / 60;
          } else if (parts.length === 3) {
            totalMinutes += parts[0] * 60 + parts[1] + parts[2] / 60;
          }

          nameEl.innerHTML = `
            <span>${cleanTitle}</span>
            <span class="qp-lesson-duration-badge">⏱ ${durationStr}</span>
          `;
        }
      }
    });

    // 5. Enhance Section Titles with Progress Stats
    const sectionTitles = document.querySelectorAll('.course-section .section-title');
    sectionTitles.forEach(secTitle => {
      if (!secTitle.dataset.enhanced) {
        secTitle.dataset.enhanced = 'true';
        const text = secTitle.textContent.trim();
        const count = sectionItems.length;
        const hours = Math.floor(totalMinutes / 60);
        const mins = Math.round(totalMinutes % 60);
        const timeFormatted = hours > 0 ? `${hours}hr ${mins}min` : `${mins}min`;

        secTitle.innerHTML = `
          <span>${text}</span>
          <span style="font-size: 12px; font-weight: 500; color: #6a6f73;">${completedCount}/${count} | ${timeFormatted}</span>
        `;
      }
    });

    window.__qp_lecture_initialized = true;
  }

  // Interactive Notes System (Saved locally in localStorage)
  function renderNotesSystem(container) {
    const lectureId = getLectureId();
    const storageKey = `qp_notes_${lectureId}`;
    let savedNotes = JSON.parse(localStorage.getItem(storageKey) || '[]');

    container.innerHTML = `
      <div class="qp-notes-editor-box">
        <div class="qp-notes-input-wrapper">
          <textarea id="qp-note-input" placeholder="Type your personal note for this lecture here..."></textarea>
          <div class="qp-notes-actions">
            <button id="qp-save-note-btn" class="qp-btn-purple">💾 Save Note</button>
          </div>
        </div>
        <div class="qp-notes-list-header">
          <h4>Your Notes for this Lecture (${savedNotes.length})</h4>
        </div>
        <div id="qp-notes-list" class="qp-notes-list"></div>
      </div>
    `;

    const noteInput = container.querySelector('#qp-note-input');
    const saveBtn = container.querySelector('#qp-save-note-btn');
    const listContainer = container.querySelector('#qp-notes-list');

    function updateList() {
      if (savedNotes.length === 0) {
        listContainer.innerHTML = `
          <div class="qp-empty-notes">
            <div style="font-size: 32px; margin-bottom: 8px;">📝</div>
            <p>No notes added for this lecture yet. Click above to create your first note!</p>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = savedNotes.map((note, index) => `
        <div class="qp-note-card">
          <div class="qp-note-card-header">
            <span class="qp-note-tag">⏱ Note #${index + 1} • ${note.date}</span>
            <button class="qp-note-delete-btn" data-index="${index}" title="Delete Note">✕</button>
          </div>
          <div class="qp-note-text">${escapeHtml(note.text)}</div>
        </div>
      `).join('');

      listContainer.querySelectorAll('.qp-note-delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-index'), 10);
          savedNotes.splice(idx, 1);
          localStorage.setItem(storageKey, JSON.stringify(savedNotes));
          updateList();
        });
      });
    }

    saveBtn.addEventListener('click', () => {
      const text = noteInput.value.trim();
      if (!text) return;

      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      savedNotes.unshift({ text, date: dateStr });
      localStorage.setItem(storageKey, JSON.stringify(savedNotes));
      noteInput.value = '';
      updateList();
    });

    updateList();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  // Dark Mode State Handler
  function applyDarkMode(enabled) {
    if (enabled) {
      document.documentElement.classList.add('qp-dark-mode');
      document.body.classList.add('qp-dark-mode');
    } else {
      document.documentElement.classList.remove('qp-dark-mode');
      document.body.classList.remove('qp-dark-mode');
    }
    updateAllToggleButtons(enabled);
  }

  // Inject In-Page Theme Toggle Button into Lecture Header
  function injectInPageThemeToggle() {
    if (document.getElementById('qp-inpage-theme-toggle')) return;

    const navTargets = [
      document.querySelector('header .lecture-nav'),
      document.querySelector('.course-player__header-right'),
      document.querySelector('header.header nav'),
      document.querySelector('header')
    ];

    const targetNav = navTargets.find(el => el !== null);
    if (!targetNav) return;

    const isDark = document.body.classList.contains('qp-dark-mode');
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'qp-inpage-theme-toggle';
    toggleBtn.className = 'qp-inpage-theme-toggle';
    toggleBtn.title = 'Toggle Dark / Light Mode';
    toggleBtn.innerHTML = isDark ? '☀️ Light' : '🌙 Dark';

    toggleBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const currentDark = document.body.classList.contains('qp-dark-mode');
      const newDark = !currentDark;
      applyDarkMode(newDark);

      if (chrome?.storage?.local) {
        await chrome.storage.local.set({ darkMode: newDark });
      }
    });

    targetNav.prepend(toggleBtn);
  }

  function updateAllToggleButtons(isDark) {
    document.querySelectorAll('.qp-inpage-theme-toggle').forEach(btn => {
      btn.innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
    });
  }

  // Check stored dark mode preference on load
  if (chrome?.storage?.local) {
    chrome.storage.local.get(['darkMode'], (result) => {
      if (result && result.darkMode) {
        applyDarkMode(true);
      }
    });

    // Listen for live setting changes from popup
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'settingChanged' && request.key === 'darkMode') {
        applyDarkMode(request.value);
      }
    });
  }

  function init() {
    if (!isLecturePage()) return;
    transformLecturePage();
    injectInPageThemeToggle();

    // Observe dynamic lecture navigation (SPA)
    const observer = new MutationObserver(() => {
      injectInPageThemeToggle();
      if (!document.querySelector('.qp-header-course-title') || !document.querySelector('.qp-tab-panes-wrapper')) {
        transformLecturePage();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
