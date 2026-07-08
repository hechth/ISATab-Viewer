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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
