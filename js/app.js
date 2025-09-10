'use strict';

import { loadCourseCache } from './course-data.js';
import { loadHomeState, renderHomePage, wireHomeEvents } from './home.js';
import { renderPlayersPage, hasIncompletePlayers, wirePlayersEvents } from './players.js';
import { renderCoursesPage, wireCoursesEvents } from './courses.js';

(function() {
  const app = document.getElementById('app');
  if (!app) return;

  let currentPage = '';

  // Wire the nav bar buttons
  function wireNavBar() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.target;
            // Force blur to persist any pending field edits
            if (document.activeElement && typeof document.activeElement.blur === 'function') {
                document.activeElement.blur();
            }
            // If leaving Players page, ensure no incomplete rows
            if (currentPage === 'players' && hasIncompletePlayers()) {
                alert('Please complete or delete all player rows before leaving the Players page.');
                return;
            }
            
            showPage(target);
        });
    });
  }

  // Wire help buttons
  function wireHelpButtons() {
    document.querySelectorAll('.help-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        const helpSection = button.getAttribute('data-help');
        showHelp(helpSection);
      });
    });
  }
  
  function showHelp(section = '') {
    const helpUrl = 'help.html' + (section ? `#${section}` : '');
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    try {
      // On mobile, we'll force a new tab each time for better reliability
      if (isMobile) {
        helpTab = window.open(helpUrl, '_blank');
        if (helpTab) {
          // Store the tab ID in localStorage when opened
          localStorage.setItem(HELP_TAB_KEY, helpTabId);
          // Set up a message channel for communication
          const channel = new BroadcastChannel('handicalc_help');
          channel.postMessage({ type: 'NAVIGATE', url: helpUrl });
        }
        return false;
      }
      
      // Desktop behavior
      if (helpTab && !helpTab.closed) {
        helpTab.location.href = helpUrl;
        helpTab.focus();
        return false;
      }
      
      // Open new help tab with unique name
      const tabName = `handicalc_help_${Date.now()}`;
      helpTab = window.open(helpUrl, tabName, 'noopener,noreferrer');
      
      if (helpTab) {
        helpTab.focus();
      } else {
        window.open(helpUrl, '_blank');
      }
      
    } catch (e) {
      console.error('Error managing help tab:', e);
      window.open(helpUrl, '_blank');
    }
    return false;
  }
  

  function showPage(id) {
    if (id === currentPage) return;

    //SHow the current page
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
      const isTarget = p.id === id;
      p.hidden = !isTarget;
    });

    // Focus pages container for accessibility after nav changes
    document.getElementById('pages')?.focus({ preventScroll: true });
    currentPage = id;
    if (id === 'players') {
      renderPlayersPage();
    } else if (id === 'courses') {
      renderCoursesPage();
    } else if (id === 'home') {
      renderHomePage();
    }
  }

  function initApp() {
    // Wire all the controls
    wireNavBar();
    wireHelpButtons();
    wireHomeEvents();
    wirePlayersEvents();
    wireCoursesEvents();

    // Hide splash
    const splash = document.getElementById('splash');
    if (splash) splash.remove();

    // Show the home page
    loadHomeState();
    showPage('home');
  }

  // Initialize app
  setTimeout(() => initApp(), 1500);
  loadCourseCache();  // Runs whist waiting for the splash to go away
  
})();
