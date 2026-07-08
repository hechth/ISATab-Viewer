/**
 * Utility Module Exports
 */

export {
  fetchFile,
  loadInvestigation,
  loadStudyFile,
  loadAssayFile,
  getStudyFileName,
  getAssayFileNames
} from './file-loader.js';

/**
 * Generate a hash code from a string
 * @param {string} s - Input string
 * @returns {number} Hash code
 */
export function hashCode(s) {
  return s.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
}
