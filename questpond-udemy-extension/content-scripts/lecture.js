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

  function transformLecturePage() {
    document.body.classList.add('qp-udemy-transformed');

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

    // 2. Video Player Theater Container
    const videoAttachment = document.querySelector('.lecture-attachment-type-video, .course-mainbar__video-area');
    if (videoAttachment && !videoAttachment.parentNode.classList.contains('qp-video-theater-container')) {
      const theaterWrapper = document.createElement('div');
      theaterWrapper.className = 'qp-video-theater-wrapper';

      const theaterContainer = document.createElement('div');
      theaterContainer.className = 'qp-video-theater-container';

      videoAttachment.parentNode.insertBefore(theaterWrapper, videoAttachment);
      theaterContainer.appendChild(videoAttachment);
      theaterWrapper.appendChild(theaterContainer);
    }

    // 3. Sub-tabs below Video Player
    const headingEl = document.querySelector('h2#lecture_heading, .course-mainbar__top-heading');
    if (headingEl && !document.querySelector('.qp-lecture-tabs-row')) {
      const tabsRow = document.createElement('div');
      tabsRow.className = 'qp-lecture-tabs-row';
      tabsRow.innerHTML = `
        <div class="qp-lecture-subtab active" data-subtab="overview">Overview</div>
        <div class="qp-lecture-subtab" data-subtab="notes">Notes</div>
        <div class="qp-lecture-subtab" data-subtab="announcements">Announcements</div>
        <div class="qp-lecture-subtab" data-subtab="reviews">Reviews</div>
        <div class="qp-lecture-subtab" data-subtab="tools">Learning tools</div>
      `;

      headingEl.parentNode.insertBefore(tabsRow, headingEl.nextSibling);

      // Handle sub-tab switching
      tabsRow.querySelectorAll('.qp-lecture-subtab').forEach(tab => {
        tab.addEventListener('click', () => {
          tabsRow.querySelectorAll('.qp-lecture-subtab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
        });
      });
    }

    // 4. Transform Sidebar Curriculum Items
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

          // Calculate approximate total time
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

    // 5. Enhance Section Titles with Stats
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
    console.log('[QuestPond Beautifier] Lecture player transformed into Udemy theme!');
  }

  function init() {
    if (!isLecturePage()) return;
    transformLecturePage();

    // Observe dynamic changes (e.g. when moving between lectures)
    const observer = new MutationObserver(() => {
      if (!document.querySelector('.qp-header-course-title') || !document.querySelector('.qp-video-theater-wrapper')) {
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
