// QuestPond Udemy Beautifier - Dashboard Content Script

(function () {
  'use strict';

  // Prevent multiple initializations
  if (window.__qp_dashboard_initialized) return;

  function isDashboardPage() {
    return (
      document.querySelector('#videoBar') !== null ||
      document.querySelector('.category-col') !== null ||
      document.querySelector('#accordion') !== null ||
      window.location.pathname.includes('/p/questvideos') ||
      document.title.toLowerCase().includes('questpond videos')
    );
  }

  // High-Taste Tech gradient generator for Udemy-style course artwork (Leonxlnx/taste-skill)
  const TECH_THEMES = [
    { keywords: ['c#', '.net', 'csharp', 'linq', 'asp.net', 'mvc'], bg: 'linear-gradient(135deg, #1e1b4b 0%, #31104b 50%, #431407 100%)', icon: '💻', tag: 'C# / .NET' },
    { keywords: ['angular', 'rxjs', 'typescript'], bg: 'linear-gradient(135deg, #450a0a 0%, #1e0a16 100%)', icon: '🅰️', tag: 'Angular' },
    { keywords: ['react', 'nextjs', 'redux'], bg: 'linear-gradient(135deg, #082f49 0%, #030712 100%)', icon: '⚛️', tag: 'React' },
    { keywords: ['azure', 'cloud', 'devops'], bg: 'linear-gradient(135deg, #0c2d48 0%, #051622 100%)', icon: '☁️', tag: 'Microsoft Azure' },
    { keywords: ['docker', 'kubernetes', 'k8s', 'container'], bg: 'linear-gradient(135deg, #072635 0%, #04121a 100%)', icon: '🐳', tag: 'Docker & K8s' },
    { keywords: ['sql', 'database', 'msbi', 'ssis', 'ssrs', 'ssas'], bg: 'linear-gradient(135deg, #1c1917 0%, #0c0a09 100%)', icon: '🗄️', tag: 'SQL & Data' },
    { keywords: ['javascript', 'js', 'node', 'web'], bg: 'linear-gradient(135deg, #1c1917 0%, #3a3000 100%)', icon: '⚡', tag: 'JavaScript' },
    { keywords: ['microservices', 'architecture', 'design pattern'], bg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)', icon: '🏗️', tag: 'Architecture' },
    { keywords: ['data structure', 'algorithm', 'dsa'], bg: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', icon: '🌲', tag: 'Algorithms & DSA' },
    { keywords: ['ai', 'ml', 'python', 'machine learning', 'deep learning'], bg: 'linear-gradient(135deg, #134e4a 0%, #042f2e 100%)', icon: '🤖', tag: 'AI & Data Science' },
    { keywords: ['interview', 'q & a', 'resume'], bg: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)', icon: '🎯', tag: 'Interview Prep' },
    { keywords: ['java', 'spring', 'springboot'], bg: 'linear-gradient(135deg, #431407 0%, #1c0a02 100%)', icon: '☕', tag: 'Java Spring' }
  ];

  function getTechTheme(title = '', fullText = '') {
    const searchTarget = (title + ' ' + fullText).toLowerCase();
    for (const theme of TECH_THEMES) {
      if (theme.keywords.some(k => searchTarget.includes(k))) {
        return theme;
      }
    }
    return {
      bg: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
      icon: '💻',
      tag: 'Full Course'
    };
  }

  // Scrape all courses from QuestPond DOM
  function extractCourses() {
    const courses = [];
    const categoryCols = document.querySelectorAll('#videoBar .category-col');

    categoryCols.forEach((col, index) => {
      const headerBtn = col.querySelector('a[data-toggle="collapse"]');
      const strongEl = headerBtn?.querySelector('strong') || col.querySelector('.panel-title a');
      const rawTitle = (strongEl?.textContent || headerBtn?.textContent || `Course ${index + 1}`).trim();
      
      // Clean title casing
      const title = formatCourseTitle(rawTitle);

      const isInterview = col.getAttribute('data-interview') === '1' || headerBtn?.classList.contains('btn-success');
      const isTraining = col.getAttribute('data-red') === '1' || headerBtn?.classList.contains('btn-danger');
      const isLatest = headerBtn?.classList.contains('btn-warning') || col.querySelector('#latestcate') !== null;

      let categoryType = 'standard';
      let categoryLabel = 'Course';
      if (isTraining) {
        categoryType = 'training';
        categoryLabel = 'Live Training';
      } else if (isInterview) {
        categoryType = 'interview';
        categoryLabel = 'Interview Q&A';
      } else if (isLatest) {
        categoryType = 'latest';
        categoryLabel = 'Latest Videos';
      }

      // Extract lectures
      const lectureElements = col.querySelectorAll('ul.list-group li.list-group-item a, .panel-body a');
      const lectures = [];

      lectureElements.forEach(a => {
        const text = a.textContent.trim();
        const durationMatch = text.match(/\((\d+:\d+(?::\d+)?)\)/);
        const duration = durationMatch ? durationMatch[1] : '';
        const cleanLessonTitle = text.replace(/\s*\(\d+:\d+(?::\d+)?\)\s*$/, '').trim();

        lectures.push({
          title: cleanLessonTitle,
          duration: duration,
          url: a.href,
          originalElement: a
        });
      });

      const theme = getTechTheme(title);

      courses.push({
        id: `qp-course-${index}`,
        title: title,
        rawTitle: rawTitle,
        categoryType: categoryType,
        categoryLabel: categoryLabel,
        isInterview: isInterview,
        isTraining: isTraining,
        theme: theme,
        lectureCount: lectures.length,
        lectures: lectures,
        firstUrl: lectures.length > 0 ? lectures[0].url : '#',
        originalCol: col
      });
    });

    return courses;
  }

  function formatCourseTitle(str) {
    if (!str) return '';
    // If all caps, title-case it nicely
    if (str === str.toUpperCase()) {
      return str
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return str;
  }

  // Transform the dashboard into modern Udemy layout
  function renderUdemyDashboard(courses) {
    document.body.classList.add('qp-udemy-transformed');

    // Hide original elements cleanly without deleting them (preserves original JS events)
    const videoBar = document.querySelector('#videoBar');
    if (videoBar) {
      videoBar.classList.add('qp-original-catalog');
    }

    // Remove existing custom UI if already injected
    const existingHero = document.querySelector('.qp-udemy-hero');
    if (existingHero) existingHero.remove();
    const existingContainer = document.querySelector('.qp-udemy-container');
    if (existingContainer) existingContainer.remove();

    // Main insertion target
    const targetParent = videoBar ? videoBar.parentNode : (document.querySelector('main') || document.body);

    // 1. Create Udemy Hero Section
    const hero = document.createElement('div');
    hero.className = 'qp-udemy-hero';
    hero.innerHTML = `
      <h1 class="qp-udemy-hero-title">My learning</h1>
      <div class="qp-udemy-tabs">
        <div class="qp-udemy-tab active" data-tab="all">All courses</div>
        <div class="qp-udemy-tab" data-tab="interview">Interview Questions</div>
        <div class="qp-udemy-tab" data-tab="training">Live Training Recordings</div>
        <div class="qp-udemy-tab" data-tab="latest">Latest Videos</div>
        <div class="qp-udemy-tab" data-tab="archived">Archived</div>
      </div>
    `;

    // 2. Create Udemy Main Container
    const container = document.createElement('div');
    container.className = 'qp-udemy-container';

    // Banner cards (Streak + Schedule)
    const banners = document.createElement('div');
    banners.className = 'qp-udemy-banners-row';
    banners.innerHTML = `
      <div class="qp-streak-card">
        <div class="qp-streak-left">
          <h3>Start a weekly streak</h3>
          <p>Watch 5 minutes of video per day to reach your learning goals.</p>
        </div>
        <div class="qp-streak-right">
          <div class="qp-streak-stat">
            <div class="qp-streak-ring">
              <div class="qp-streak-ring-inner"></div>
            </div>
            <div class="qp-streak-details">
              <strong>1 / 3 days active</strong>
              <span style="color: #6a6f73;">Weekly Goal</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Filter toolbar & Search
    const toolbar = document.createElement('div');
    toolbar.className = 'qp-toolbar';
    toolbar.innerHTML = `
      <div class="qp-filter-pills">
        <div class="qp-pill active-filter" data-filter="all">All Topics</div>
        <div class="qp-pill" data-filter="standard">Core Courses</div>
        <div class="qp-pill" data-filter="interview">Interview Prep</div>
        <div class="qp-pill" data-filter="training">Live Recordings</div>
        
        <label class="qp-interview-toggle-pill" title="Toggle Interview Mode">
          <div class="qp-switch">
            <input type="checkbox" id="qp-custom-interview-toggle">
            <span class="qp-slider"></span>
          </div>
          <span>Interview Mode</span>
        </label>
      </div>

      <div class="qp-search-box">
        <input type="text" class="qp-search-input" id="qp-custom-search" placeholder="Search my courses...">
        <button class="qp-search-btn" title="Search"><i class="fa fa-search">🔍</i></button>
      </div>
    `;

    // Stats Bar
    const statsBar = document.createElement('div');
    statsBar.className = 'qp-stats-bar';
    statsBar.innerHTML = `
      <div id="qp-course-counter">${courses.length} courses</div>
      <div>
        Sort by: 
        <select class="qp-sort-select" id="qp-sort-select">
          <option value="default">Recently Accessed</option>
          <option value="alpha">Title: A to Z</option>
          <option value="lessons">Most Lessons</option>
        </select>
      </div>
    `;

    // Cards Grid
    const grid = document.createElement('div');
    grid.className = 'qp-course-grid';
    grid.id = 'qp-course-grid';

    // Append all parts
    container.appendChild(banners);
    container.appendChild(toolbar);
    container.appendChild(statsBar);
    container.appendChild(grid);

    if (videoBar) {
      targetParent.insertBefore(hero, videoBar);
      targetParent.insertBefore(container, videoBar);
    } else {
      targetParent.prepend(container);
      targetParent.prepend(hero);
    }

    // Populate Cards
    renderCourseCards(courses, grid);

    // Attach Event Listeners
    setupInteractivity(courses, grid);
  }

  function renderCourseCards(coursesToRender, gridElement) {
    gridElement.innerHTML = '';

    if (coursesToRender.length === 0) {
      gridElement.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6a6f73;">
          <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
          <h3 style="color: #1c1d1f; margin-bottom: 8px;">No matching courses found</h3>
          <p>Try adjusting your search query or topic filters.</p>
        </div>
      `;
      const counter = document.getElementById('qp-course-counter');
      if (counter) counter.textContent = '0 courses';
      return;
    }

    const counter = document.getElementById('qp-course-counter');
    if (counter) counter.textContent = `${coursesToRender.length} courses`;

    coursesToRender.forEach((course, idx) => {
      // Calculate realistic visual progress
      const progressPercent = Math.min(100, Math.max(10, ((idx * 23 + 17) % 95)));

      const card = document.createElement('div');
      card.className = 'qp-course-card';
      card.setAttribute('data-course-id', course.id);

      card.innerHTML = `
        <div class="qp-card-thumbnail" style="background: ${course.theme.bg};">
          <span class="qp-thumbnail-badge">${course.categoryLabel}</span>
          <div class="qp-thumbnail-dots" title="Course options">⋮</div>
          <div class="qp-thumbnail-center">
            <div class="qp-thumbnail-icon">${course.theme.icon}</div>
            <div class="qp-thumbnail-tag">${course.theme.tag}</div>
          </div>
        </div>
        <div class="qp-card-body">
          <h3 class="qp-card-title" title="${course.title}">${course.title}</h3>
          <p class="qp-card-instructor">QuestPond • Shivprasad Koirala</p>
          <div class="qp-card-progress-container">
            <div class="qp-card-progressbar">
              <div class="qp-card-progressbar-fill" style="width: ${progressPercent}%;"></div>
            </div>
            <div class="qp-card-footer-info">
              <span class="qp-card-completion">${course.lectureCount} Lessons</span>
              <span class="qp-card-start-btn">Start Course →</span>
            </div>
          </div>
        </div>
      `;

      // Click event: open course lessons drawer/modal
      card.addEventListener('click', (e) => {
        // Prevent trigger if clicked dots
        if (e.target.closest('.qp-thumbnail-dots')) {
          e.stopPropagation();
          return;
        }
        openCourseModal(course);
      });

      gridElement.appendChild(card);
    });
  }

  // Lecture List Modal / Viewer
  function openCourseModal(course) {
    const existingModal = document.querySelector('.qp-modal-overlay');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.className = 'qp-modal-overlay';

    let lessonsHTML = '';
    if (course.lectures.length === 0) {
      lessonsHTML = '<p style="text-align: center; color: #6a6f73; padding: 20px;">No individual lectures listed in this section.</p>';
    } else {
      lessonsHTML = course.lectures.map((lec, i) => `
        <a href="${lec.url}" class="qp-modal-lesson-item" target="_self">
          <div class="qp-modal-lesson-left">
            <span class="qp-modal-lesson-icon">▶</span>
            <span>${lec.title}</span>
          </div>
          ${lec.duration ? `<span class="qp-modal-lesson-duration">${lec.duration}</span>` : ''}
        </a>
      `).join('');
    }

    modal.innerHTML = `
      <div class="qp-modal-card">
        <div class="qp-modal-header" style="background: ${course.theme.bg};">
          <div>
            <span style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">${course.categoryLabel} • ${course.lectureCount} Lectures</span>
            <h3 style="margin-top: 4px;">${course.title}</h3>
          </div>
          <button class="qp-modal-close" title="Close">✕</button>
        </div>
        <div class="qp-modal-body">
          ${lessonsHTML}
        </div>
      </div>
    `;

    // Close handlers
    const closeModal = () => {
      modal.remove();
      document.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeModal();
    };

    modal.querySelector('.qp-modal-close').addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', handleKeyDown);

    document.body.appendChild(modal);
  }

  // Interactivity for Search, Filters, Tabs & Sorting
  function setupInteractivity(allCourses, gridElement) {
    let currentFilter = 'all';
    let currentSearch = '';
    let currentTab = 'all';
    let isInterviewOnly = false;
    let currentSort = 'default';

    function applyFilters() {
      let filtered = allCourses.filter(course => {
        // Tab filter
        if (currentTab === 'interview' && !course.isInterview) return false;
        if (currentTab === 'training' && !course.isTraining) return false;
        if (currentTab === 'latest' && course.categoryType !== 'latest') return false;

        // Pill filter
        if (currentFilter === 'standard' && (course.isInterview || course.isTraining)) return false;
        if (currentFilter === 'interview' && !course.isInterview) return false;
        if (currentFilter === 'training' && !course.isTraining) return false;

        // Interview mode switch
        if (isInterviewOnly && !course.isInterview) return false;

        // Search text
        if (currentSearch) {
          const matchTitle = course.title.toLowerCase().includes(currentSearch);
          const matchLessons = course.lectures.some(l => l.title.toLowerCase().includes(currentSearch));
          if (!matchTitle && !matchLessons) return false;
        }

        return true;
      });

      // Sorting
      if (currentSort === 'alpha') {
        filtered.sort((a, b) => a.title.localeCompare(b.title));
      } else if (currentSort === 'lessons') {
        filtered.sort((a, b) => b.lectureCount - a.lectureCount);
      }

      renderCourseCards(filtered, gridElement);
    }

    // Tab clicks
    document.querySelectorAll('.qp-udemy-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.qp-udemy-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentTab = tab.getAttribute('data-tab');
        applyFilters();
      });
    });

    // Filter pill clicks
    document.querySelectorAll('.qp-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.qp-pill').forEach(p => p.classList.remove('active-filter'));
        pill.classList.add('active-filter');
        currentFilter = pill.getAttribute('data-filter');
        applyFilters();
      });
    });

    // Interview mode toggle
    const interviewToggle = document.getElementById('qp-custom-interview-toggle');
    if (interviewToggle) {
      interviewToggle.addEventListener('change', (e) => {
        isInterviewOnly = e.target.checked;
        applyFilters();

        // Sync with original interview checkbox if present
        const origInterview = document.getElementById('interviewMode') || document.getElementById('myonoffswitch');
        if (origInterview && origInterview.checked !== isInterviewOnly) {
          origInterview.click();
        }
      });
    }

    // Search input
    const searchInput = document.getElementById('qp-custom-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.trim().toLowerCase();
        applyFilters();

        // Sync with original search input
        const origSearch = document.getElementById('searchkey') || document.querySelector('input[ng-model="searchText"]');
        if (origSearch) {
          origSearch.value = e.target.value;
          origSearch.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });
    }

    // Sort select
    const sortSelect = document.getElementById('qp-sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        applyFilters();
      });
    }
  }

  // Enhance Teachable student dashboard (/l/dashboard)
  function enhanceTeachableDashboard() {
    if (!window.location.pathname.includes('/l/dashboard') && !document.querySelector('[data-sentry-component="DashboardInProgress"]')) {
      return;
    }

    // In-progress cards
    const cards = document.querySelectorAll('a[href*="/courses/"]');
    cards.forEach(card => {
      if (card.dataset.enhanced) return;
      card.dataset.enhanced = 'true';

      let title = '';
      const titleEl = card.querySelector('h2, h3, h4, [class*="font-semibold"], [class*="font-bold"], [class*="title"]');
      const textLines = (card.innerText || card.textContent || '').split('\n').map(s => s.trim()).filter(Boolean);
      title = (titleEl?.textContent || textLines[0] || '').trim();
      const firstLineText = textLines[0] || '';

      const fullCardText = (title + ' ' + (card.innerText || '') + ' ' + (card.getAttribute('href') || '') + ' ' + firstLineText).toLowerCase();
      const theme = getTechTheme(title || firstLineText, fullCardText);

      // Re-image legacy/ugly yellow bitmaps with high-taste gradient artwork
      const imgContainer = card.querySelector('.aspect-video, [class*="w-48"], [class*="w-56"], [class*="w-64"], img')?.parentElement || card.firstElementChild;
      const img = card.querySelector('img');

      if (imgContainer) {
        const placeholder = document.createElement('div');
        if (img) placeholder.className = img.className; // Inherit original img classes (e.g. object-cover w-full h-full)
        placeholder.classList.add('qp-dashboard-gradient-thumb');
        placeholder.style.cssText = `
          width: 200px;
          min-width: 200px;
          max-width: 35%;
          height: 100%;
          min-height: 120px;
          flex-shrink: 0;
          background: ${theme.bg};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          padding: 16px 12px;
          text-align: center;
          border-radius: 6px;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
          position: relative;
          overflow: hidden;
        `;
        placeholder.innerHTML = `
          <div style="font-size: 32px; margin-bottom: 6px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));">${theme.icon}</div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; background: rgba(255,255,255,0.18); backdrop-filter: blur(8px); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.25);">${theme.tag}</div>
        `;
        
        if (img) {
          img.replaceWith(placeholder);
        } else {
          imgContainer.prepend(placeholder);
        }
      }
    });

    // Add motivational streak banner on /l/dashboard if not present
    const inProgressContainer = document.querySelector('[data-sentry-component="DashboardInProgress"]');
    const mainHeading = document.querySelector('main h1');
    if ((inProgressContainer || mainHeading) && !document.querySelector('.qp-dashboard-streak-banner')) {
      const banner = document.createElement('div');
      banner.className = 'qp-dashboard-streak-banner';
      banner.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: var(--qp-card-bg, #1c1d1f);
        border: 1px solid var(--qp-border, #3e4143);
        border-radius: 8px;
        padding: 24px;
        margin: 0 auto 32px auto;
        width: 100%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.08);
      `;
      
      banner.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--qp-purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
            </svg>
            <h3 class="qp-streak-title" style="font-size: 19px; font-weight: 700; margin: 0; color: var(--qp-text, #fff);">Daily Learning Goal</h3>
          </div>
          <p class="qp-streak-subtext" style="font-size: 15px; margin: 0; color: var(--qp-text-muted, #d1d7dc);">Keep up the momentum! Watch 1 lesson today to maintain your weekly streak.</p>
        </div>
        <div style="display: flex; align-items: center; gap: 16px; margin-left: 24px;">
          <div style="text-align: right;">
            <div style="font-size: 13px; font-weight: 700; color: var(--qp-text-muted, #d1d7dc); margin-bottom: 2px;">Weekly Progress</div>
            <div style="font-size: 12px; color: var(--qp-purple);">4 days left</div>
          </div>
          <div style="width: 56px; height: 56px; border-radius: 50%; border: 4px solid var(--qp-purple); border-left-color: rgba(164, 53, 240, 0.2); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--qp-text, #fff); font-size: 15px; transform: rotate(-45deg);">
            <span style="transform: rotate(45deg);">86%</span>
          </div>
        </div>
      `;
      
      // Try to insert before the grid instead of inside a random heading parent
      const gridContainer = document.querySelector('.BrowseProducts, [data-sentry-component="DashboardInProgress"] > div');
      if (gridContainer) {
         gridContainer.parentNode.insertBefore(banner, gridContainer);
      } else if (inProgressContainer) {
        inProgressContainer.insertBefore(banner, inProgressContainer.firstChild);
      } else if (mainHeading) {
        mainHeading.parentNode.insertBefore(banner, mainHeading.nextSibling);
      }
    }
  }

  // Enhance Next.js product catalog (/l/products)
  function enhanceProductCatalog() {
    if (!window.location.pathname.includes('/l/products') && !document.querySelector('.BrowseProducts')) {
      return;
    }

    // Re-image all low-res / yellow course thumbnails with sleek modern tech cards
    const productCards = document.querySelectorAll('.ProductCard, div[data-sentry-component="ClickableProductCard"]');
    productCards.forEach(card => {
      if (card.dataset.enhanced) return;
      card.dataset.enhanced = 'true';

      let title = '';
      const titleEl = card.querySelector('h2.ProductTitle, h2, h3, [class*="font-semibold"], [class*="font-bold"], [class*="title"]');
      const textLines = (card.innerText || card.textContent || '').split('\n').map(s => s.trim()).filter(Boolean);
      title = (titleEl?.textContent || textLines[0] || '').trim();
      const firstLineText = textLines[0] || '';

      const fullCardText = (title + ' ' + (card.innerText || '') + ' ' + (card.getAttribute('href') || '') + ' ' + firstLineText).toLowerCase();
      const theme = getTechTheme(title || firstLineText, fullCardText);
      const img = card.querySelector('img');
      const imgContainer = img?.parentElement || card.querySelector('.aspect-video') || card.firstElementChild;

      if (imgContainer) {
        const placeholder = document.createElement('div');
        if (img) placeholder.className = img.className; // Inherit original Tailwind classes
        placeholder.classList.add('qp-catalog-gradient-thumb');
        placeholder.style.cssText = `
          width: 100%;
          aspect-ratio: 16 / 9;
          height: auto;
          min-height: 140px;
          max-height: 180px;
          flex-shrink: 0;
          background: ${theme.bg};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          padding: 16px;
          text-align: center;
          border-bottom: 1px solid #33363b;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
          position: relative;
        `;
        placeholder.innerHTML = `
          <div style="font-size: 36px; margin-bottom: 6px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));">${theme.icon}</div>
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; background: rgba(255,255,255,0.18); backdrop-filter: blur(8px); padding: 3px 8px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.25);">${theme.tag}</div>
        `;
        if (img) {
          img.replaceWith(placeholder);
        } else {
          imgContainer.prepend(placeholder);
        }
      }
    });

    // Fix Category pills: Ensure "Data Science" or first pill is not auto-selected on fresh load without category in URL
    const categoryGroup = document.querySelector('.CourseCategoryToggleGroup');
    if (categoryGroup && !window.location.search.includes('category=') && !window.location.search.includes('categories=')) {
      const activePill = categoryGroup.querySelector('button[data-state="on"], button[aria-checked="true"], button:focus');
      if (activePill && !categoryGroup.dataset.userClicked) {
        activePill.setAttribute('data-state', 'off');
        activePill.setAttribute('aria-checked', 'false');
        activePill.blur();
      }
    }
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

  // Inject In-Page Theme Toggle Button into Navbar
  function injectInPageThemeToggle() {
    if (document.getElementById('qp-inpage-theme-toggle')) return;

    const navTargets = [
      document.querySelector('ul.navbar__menu'),
      document.querySelector('nav.NavigationBar section.flex.gap-4'),
      document.querySelector('ul#hamburger-menu'),
      document.querySelector('.navbar__menu__list'),
      document.querySelector('#site-header nav'),
      document.querySelector('header .lecture-nav'),
      document.querySelector('.course-player__header-right'),
      document.querySelector('header.student-settings-header'),
      document.querySelector('header.header nav'),
      document.querySelector('header nav'),
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

    if (targetNav.tagName === 'UL') {
      const userDropdown = targetNav.querySelector('.user-dropdown') || targetNav.lastElementChild;
      if (userDropdown && userDropdown !== targetNav.firstElementChild) {
        targetNav.insertBefore(toggleBtn, userDropdown);
      } else {
        targetNav.appendChild(toggleBtn);
      }
    } else {
      targetNav.appendChild(toggleBtn);
    }
  }

  function updateAllToggleButtons(isDark) {
    document.querySelectorAll('.qp-inpage-theme-toggle').forEach(btn => {
      btn.innerHTML = isDark ? '☀️ Light' : '🌙 Dark';
    });
  }

  // Enhance Enrolled course page (/courses/enrolled/*, /courses/*)
  function enhanceEnrolledCoursePage() {
    const enrolledLayout = document.querySelector('.enrolled-course-layout');
    if (!enrolledLayout) return;

    const sidebar = enrolledLayout.querySelector('.course-sidebar');
    if (sidebar && !sidebar.dataset.enhanced) {
      sidebar.dataset.enhanced = 'true';
      const titleEl = sidebar.querySelector('h2');
      const title = titleEl ? titleEl.textContent.trim() : document.title;
      const fullText = (title + ' ' + window.location.pathname).toLowerCase();
      const theme = getTechTheme(title, fullText);

      const img = sidebar.querySelector('img.course-image, img');
      if (img) {
        const placeholder = document.createElement('div');
        placeholder.className = 'qp-sidebar-gradient-thumb';
        placeholder.style.cssText = `
          width: 100%;
          aspect-ratio: 16 / 9;
          background: ${theme.bg};
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          padding: 20px 16px;
          text-align: center;
          border-radius: 8px;
          margin-bottom: 16px;
          box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.4);
        `;
        placeholder.innerHTML = `
          <div style="font-size: 40px; margin-bottom: 8px; filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));">${theme.icon}</div>
          <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; background: rgba(255,255,255,0.18); backdrop-filter: blur(8px); padding: 4px 10px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.25);">${theme.tag}</div>
        `;
        img.replaceWith(placeholder);
      }
    }
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

  // Initialization runner
  function init() {
    // Apply Udemy transform class globally across QuestPond
    document.body.classList.add('qp-udemy-transformed');

    // Initial run
    enhanceTeachableDashboard();
    enhanceProductCatalog();
    enhanceEnrolledCoursePage();
    injectInPageThemeToggle();

    // Universal Mutation Observer for React SPA / Asynchronous rendering
    const universalObserver = new MutationObserver(() => {
      injectInPageThemeToggle();
      enhanceTeachableDashboard();
      enhanceProductCatalog();
      enhanceEnrolledCoursePage();

      if (isDashboardPage() && !window.__qp_dashboard_initialized) {
        const deferredCourses = extractCourses();
        if (deferredCourses.length > 0) {
          renderUdemyDashboard(deferredCourses);
          window.__qp_dashboard_initialized = true;
        }
      }
    });
    universalObserver.observe(document.body, { childList: true, subtree: true });

    if (isDashboardPage()) {
      const courses = extractCourses();
      if (courses.length > 0) {
        renderUdemyDashboard(courses);
        window.__qp_dashboard_initialized = true;
        console.log(`[QuestPond Beautifier] Legacy Dashboard transformed with ${courses.length} courses!`);
      }
    }
  }

  // Run when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
