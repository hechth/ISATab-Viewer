/**
 * Development Entry Point
 *
 * This file is used for local development and testing.
 * Loads test data sets similar to the original demo.
 */

import ISATabViewer from './components/ISATabViewer.js';
import './styles/main.css';

// Default dataset to load
const DEFAULT_DATASET = 'test_data_sets/PXD017710/i_PXD017710.txt';

/**
 * Initialize the viewer when DOM is ready
 */
async function init() {
  // Use window.ISATabViewer which is set up by the component's side effects
  const viewer = window.ISATabViewer;

  if (!viewer || !viewer.rendering) {
    console.error('ISATabViewer not available');
    const studyInfo = document.querySelector('#study-info');
    if (studyInfo) {
      studyInfo.innerHTML = '<p class="error">ISATabViewer not loaded properly</p>';
    }
    return;
  }

  try {
    await viewer.rendering.render_isatab_from_file(
      DEFAULT_DATASET,
      '#investigation_file'
    );
  } catch (error) {
    console.error('Failed to load dataset:', error);
    const studyInfo = document.querySelector('#study-info');
    if (studyInfo) {
      studyInfo.innerHTML = `
        <p class="error">Failed to load dataset: ${error.message}</p>
        <p>Note: You need to run this on a local server. Use <code>npm run dev</code>.</p>
      `;
    }
  }
}

/**
 * Load the dataset selected from the dropdown
 */
window.loadSelectedDataset = async function() {
  const selector = document.getElementById('dataset-selector');
  if (!selector || !window.ISATabViewer) return;

  const selectedPath = selector.value;
  console.log('Loading selected dataset:', selectedPath);

  try {
    await window.ISATabViewer.rendering.render_isatab_from_file(
      selectedPath,
      '#investigation_file'
    );
  } catch (error) {
    console.error('Failed to load dataset:', error);
    const studyInfo = document.querySelector('#study-info');
    if (studyInfo) {
      studyInfo.innerHTML = `<p class="error">Failed to load dataset: ${error.message}</p>`;
    }
  }
};

/**
 * Setup resizable sidebar
 */
function setupResizableSidebar() {
  const resizeHandle = document.getElementById('resize-handle');
  const studyListPanel = document.getElementById('study-list-panel');
  const mainViewPanel = document.getElementById('main-view-panel');

  if (!resizeHandle || !studyListPanel || !mainViewPanel) return;

  let isResizing = false;

  // Set initial positions
  function updateLayout() {
    const studyListWidth = parseFloat(studyListPanel.style.width) || 25;
    mainViewPanel.style.marginLeft = `${studyListWidth + 0.6}%`; // Account for resize handle width
  }
  updateLayout();

  resizeHandle.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizeHandle.classList.add('resizing');
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const container = document.getElementById('investigation_file');
    const containerRect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Enforce min/max width
    if (newWidth >= 15 && newWidth <= 50) {
      studyListPanel.style.width = `${newWidth}%`;
      mainViewPanel.style.marginLeft = `${newWidth + 0.6}%`; // Account for resize handle width
    }
  });

  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      resizeHandle.classList.remove('resizing');
      document.body.style.userSelect = '';
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    init();
    setupResizableSidebar();
  });
} else {
  init();
  setupResizableSidebar();
}
