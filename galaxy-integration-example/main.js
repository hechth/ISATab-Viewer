/**
 * Galaxy Integration Example for ISATab Viewer
 *
 * This example shows how to integrate the ISATab Viewer into Galaxy
 * as an interactive visualization, similar to how tabulator is integrated.
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
import ISATabViewer from 'isatab-viewer';

// Configuration thresholds
const DATA_LIMIT = 10000; // Maximum rows to load initially

// Access container element
const appElement = document.querySelector('#app');

// Development mode mock data
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
 * Fetch ISA-TAB dataset from Galaxy API
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
    if (!['isatab', 'txt'].includes(fileType)) {
        showMessage('Warning', `Expected ISA-TAB file, got: ${fileType}`);
    }

    // Fetch file content
    const content = await fetchFileContent(datasetId);
    if (!content) {
        return;
    }

    // Check file size
    if (content.length > DATA_LIMIT) {
        showMessage('Note', `Large file detected (${content.length} bytes). Some features may be limited.`);
    }

    // Parse and render
    try {
        // Create viewer instance
        const viewer = new ISATabViewer({
            container: '#viewer-container',
            separator: '\t'
        });

        // Process the investigation file content
        viewer.processFile(`galaxy://${datasetId}`, content, '#viewer-container');

        hideMessage();
        console.log('[isatab-viewer] Visualization ready');
    } catch (error) {
        showMessage('Error', `Failed to render visualization: ${error.message}`);
        console.error('[isatab-viewer]', error);
    }
}

// Start initialization
init();
