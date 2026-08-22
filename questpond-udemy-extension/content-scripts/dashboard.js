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

  // Tech gradient generator for Udemy-style course artwork
  const TECH_THEMES = [
    { keywords: ['c#', '.net', 'csharp', 'linq', 'asp.net', 'mvc'], bg: 'linear-gradient(135deg, #512bd4 0%, #29127a 100%)', icon: '💻', tag: '.NET / C#' },
    { keywords: ['angular', 'rxjs', 'typescript'], bg: 'linear-gradient(135deg, #dd0031 0%, #8b001a 100%)', icon: '🅰️', tag: 'Angular' },
    { keywords: ['react', 'nextjs', 'redux'], bg: 'linear-gradient(135deg, #00758f 0%, #003748 100%)', icon: '⚛️', tag: 'React' },
    { keywords: ['azure', 'cloud', 'devops'], bg: 'linear-gradient(135deg, #0078d4 0%, #004578 100%)', icon: '☁️', tag: 'Microsoft Azure' },
    { keywords: ['docker', 'kubernetes', 'k8s', 'container'], bg: 'linear-gradient(135deg, #2496ed 0%, #0d447a 100%)', icon: '🐳', tag: 'DevOps & Containers' },
    { keywords: ['sql', 'database', 'msbi', 'ssis', 'ssrs', 'ssas'], bg: 'linear-gradient(135deg, #cc292b 0%, #6e1315 100%)', icon: '🗄️', tag: 'SQL & Database' },
    { keywords: ['javascript', 'js', 'node', 'web'], bg: 'linear-gradient(135deg, #f7df1e 0%, #b89f00 100%)', icon: '⚡', tag: 'JavaScript' },
    { keywords: ['microservices', 'architecture', 'design pattern'], bg: 'linear-gradient(135deg, #4f46e5 0%, #2e1065 100%)', icon: '🏗️', tag: 'Software Architecture' },
    { keywords: ['ai', 'ml', 'python', 'machine learning', 'deep learning'], bg: 'linear-gradient(135deg, #10b981 0%, #064e3b 100%)', icon: '🤖', tag: 'AI & Data Science' },
    { keywords: ['interview', 'q & a', 'resume'], bg: 'linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)', icon: '🎯', tag: 'Interview Prep' },
    { keywords: ['java', 'spring', 'springboot'], bg: 'linear-gradient(135deg, #ea580c 0%, #7c2d12 100%)', icon: '☕', tag: 'Java Spring' }
  ];

  function getTechTheme(title) {
    const lower = title.toLowerCase();
    for (const theme of TECH_THEMES) {
      if (theme.keywords.some(k => lower.includes(k))) {
        return theme;
      }
    }
    return {
      bg: 'linear-gradient(135deg, #6366f1 0%, #312e81 100%)',
      icon: '📚',
      tag: 'QuestPond Course'
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
    modal.querySelector('.qp-modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

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

  // Initialization runner
  function init() {
    // Apply Udemy transform class globally across QuestPond
    document.body.classList.add('qp-udemy-transformed');

    if (!isDashboardPage()) return;

    // Check if courses are rendered in DOM
    const courses = extractCourses();
    if (courses.length > 0) {
      renderUdemyDashboard(courses);
      window.__qp_dashboard_initialized = true;
      console.log(`[QuestPond Beautifier] Dashboard transformed with ${courses.length} courses!`);
    } else {
      // If DOM elements render asynchronously, observe DOM
      const observer = new MutationObserver(() => {
        const deferredCourses = extractCourses();
        if (deferredCourses.length > 0) {
          observer.disconnect();
          renderUdemyDashboard(deferredCourses);
          window.__qp_dashboard_initialized = true;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // Run when document is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
