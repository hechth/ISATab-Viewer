/**
 * File Loading Utilities
 *
 * Handles fetching ISA-TAB files from various sources.
 */

/**
 * Fetch file content from a URL
 * @param {string} url - URL to fetch
 * @returns {Promise<string>} File content as text
 */
export async function fetchFile(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

/**
 * Load an investigation file and all associated study/assay files
 * @param {string} investigationUrl - URL of the investigation file
 * @param {Object} options - Loading options
 * @returns {Promise<Object>} Complete investigation data with all files loaded
 */
export async function loadInvestigation(investigationUrl, options = {}) {
  // Get base directory from investigation URL
  const baseUrl = investigationUrl.substring(0, investigationUrl.lastIndexOf('/') + 1);

  // Load investigation file
  const investigationContent = await fetchFile(investigationUrl);

  return {
    baseUrl,
    investigationUrl,
    investigationContent,
    options
  };
}

/**
 * Load a study file
 * @param {string} studyFileName - Name of the study file
 * @param {string} baseUrl - Base URL for file resolution
 * @returns {Promise<{fileName: string, content: string}>}
 */
export async function loadStudyFile(studyFileName, baseUrl) {
  const url = baseUrl + studyFileName;
  const content = await fetchFile(url);
  return { fileName: studyFileName, content };
}

/**
 * Load an assay file
 * @param {string} assayFileName - Name of the assay file
 * @param {string} baseUrl - Base URL for file resolution
 * @returns {Promise<{fileName: string, content: string}>}
 */
export async function loadAssayFile(assayFileName, baseUrl) {
  const url = baseUrl + assayFileName;
  const content = await fetchFile(url);
  return { fileName: assayFileName, content };
}

/**
 * Extract study file name from investigation data
 * @param {Object} study - Study object
 * @returns {string|null} Study file name or null
 */
export function getStudyFileName(study) {
  return study.STUDY?.['Study File Name']?.[0] || null;
}

/**
 * Extract assay file names from study data
 * @param {Object} study - Study object
 * @returns {Array} Array of assay file names
 */
export function getAssayFileNames(study) {
  const assays = study['STUDY ASSAYS'] || {};
  const fileNames = [];

  for (const key in assays) {
    if (key.includes('Study Assay File Name')) {
      const values = assays[key];
      for (const value of values) {
        if (value && !fileNames.includes(value)) {
          fileNames.push(value);
        }
      }
    }
  }

  return fileNames;
}
