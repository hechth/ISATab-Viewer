/**
 * Galaxy Integration for ISATab Viewer
 *
 * This module integrates the ISATab Viewer into Galaxy as an interactive visualization,
 * similar to how tabulator is integrated into Galaxy visualizations.
 *
 * Directory structure for Galaxy visualization package:
 *
 * packages/isatab-viewer/
 * ├── package.json
 * ├── index.html
 * ├── main.js (this file)
 * └── main.css
 */

import './main.css';

// Access container element - Galaxy provides this
const appElement = document.querySelector('#app');

// Development mode mock data (for local testing without Galaxy)
if (import.meta.env.DEV) {
    const dataIncoming = {
        root: '/',
        visualization_config: {
            dataset_id: 'test_dataset_123',
            file_type: 'isatab'
        }
    };
    appElement.dataset.incoming = JSON.stringify(dataIncoming);
}

// Parse incoming configuration from Galaxy
// Galaxy injects this data via the dataset.incoming attribute
const incoming = JSON.parse(appElement.dataset.incoming || '{}');
const datasetId = incoming.visualization_config?.dataset_id;
const root = incoming.root || '/';

// Build UI elements
const messageElement = document.createElement('div');
messageElement.id = 'message';
messageElement.className = 'message';
appElement.appendChild(messageElement);

const viewerContainer = document.createElement('div');
viewerContainer.id = 'viewer-container';
viewerContainer.className = 'isa-view';
appElement.appendChild(viewerContainer);

function showMessage(title, details = null) {
    const msg = details ? `${title}: ${details}` : title;
    messageElement.textContent = msg;
    messageElement.style.display = 'block';
    console.debug(`[isatab-viewer] ${msg}`);
}

function hideMessage() {
    messageElement.style.display = 'none';
}

/**
 * Fetch ISA-TAB dataset metadata from Galaxy API
 */
async function fetchDataset(id) {
    try {
        const response = await fetch(`${root}api/datasets/${id}`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        showMessage('Error', `Failed to fetch dataset: ${error.message}`);
        return null;
    }
}

/**
 * Fetch raw file content from Galaxy
 * For ISA-Tab, we need the investigation file content
 */
async function fetchFileContent(id) {
    try {
        // Galaxy endpoint for displaying dataset content
        const response = await fetch(`${root}api/datasets/${id}/display`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.text();
    } catch (error) {
        showMessage('Error', `Failed to fetch file content: ${error.message}`);
        return null;
    }
}

/**
 * Initialize the ISATab viewer with Galaxy dataset
 *
 * Note: This expects the dataset to be the investigation file (i_*.txt).
 * For full ISA-Tab visualization with studies and assays, the dataset
 * should be a zipped archive containing all ISA files, or you need to
 * configure Galaxy to provide access to related files.
 */
async function init() {
    if (!datasetId) {
        showMessage('Error', 'No dataset ID provided');
        return;
    }

    showMessage('Loading ISA-TAB visualization...');

    // Fetch dataset metadata
    const dataset = await fetchDataset(datasetId);
    if (!dataset) {
        return;
    }

    // Check if this is a valid ISA-TAB file
    const fileType = dataset.file_type || dataset.extension;
    if (!['isatab', 'txt', 'tabular'].includes(fileType)) {
        showMessage('Warning', `Expected ISA-TAB file, got: ${fileType}. Attempting to load anyway...`);
    }

    // Fetch file content
    const content = await fetchFileContent(datasetId);
    if (!content) {
        return;
    }

    // Wait for ISATabViewer to be available (loaded as global script)
    // In production, the ISATabViewer library should be loaded before this script
    const maxAttempts = 50;
    let attempts = 0;

    while (!window.ISATabViewer && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
    }

    if (!window.ISATabViewer) {
        showMessage('Error', 'ISATabViewer library not loaded. Please check your installation.');
        return;
    }

    // Parse and render
    try {
        // Process the investigation file content using the global API
        await window.ISATabViewer.rendering.render_isatab_from_file(
            `galaxy://${datasetId}`,
            '#viewer-container'
        );

        hideMessage();
        console.log('[isatab-viewer] Visualization ready');
    } catch (error) {
        showMessage('Error', `Failed to render visualization: ${error.message}`);
        console.error('[isatab-viewer]', error);
    }
}

// Start initialization
init();
