/**
 * ISATab Viewer - Main Entry Point
 *
 * A modern ES module implementation for visualizing ISA-TAB files.
 *
 * @example
 * ```javascript
 * import ISATabViewer from 'isatab-viewer';
 *
 * // Create a new viewer instance
 * const viewer = new ISATabViewer({ container: '#viewer' });
 *
 * // Load and render an investigation file
 * await ISATabViewer.renderFromFile('path/to/i_investigation.txt', '#viewer');
 * ```
 */

export { default } from './components/ISATabViewer.js';
export { viewerInstance } from './components/ISATabViewer.js';

// Re-export parser functions for advanced usage
export { parseInvestigation, parseAssayFile, processSampleStatistics } from './parser/index.js';

// Re-export utilities
export { fetchFile, loadInvestigation } from './utils/file-loader.js';

// Re-export templates
export {
  studyListTemplate,
  tableTemplate,
  sampleDistributionTemplate,
  investigationTemplate,
  studyTemplate
} from './renderer/index.js';
