/**
 * ISA-TAB Investigation File Parser
 *
 * Parses ISA-Tab investigation files (i_*.txt) and extracts structured data.
 * Supports both TSV (tab-separated) and CSV (comma-separated) formats.
 */

const SECTIONS = {
  ONTOLOGY_SOURCE_REFERENCE: 'ONTOLOGY SOURCE REFERENCE',
  INVESTIGATION: 'INVESTIGATION',
  INVESTIGATION_CONTACTS: 'INVESTIGATION CONTACTS',
  INVESTIGATION_PUBLICATIONS: 'INVESTIGATION PUBLICATIONS',
  STUDY: 'STUDY'
};

/**
 * Create a template object for a new study
 * @returns {Object} Study template with empty sections
 */
function createStudyTemplate() {
  return {
    STUDY: {},
    'STUDY CONTACTS': {},
    'STUDY PUBLICATIONS': {},
    'STUDY FACTORS': {},
    'STUDY DESIGN DESCRIPTORS': {},
    'STUDY ASSAYS': {},
    'STUDY PROTOCOLS': {}
  };
}

/**
 * Remove all occurrences of a substring from a string
 * @param {string} find - Substring to find
 * @param {string} replace - Replacement string (usually empty)
 * @param {string} str - Source string
 * @returns {string} Modified string
 */
function replaceStr(find, replace, str) {
  if (typeof str !== 'string') return str;
  return str.split(find).join(replace);
}

/**
 * Process a single line of an investigation file
 * @param {string} line - The line to process
 * @param {Object} currentStudy - Current study being parsed
 * @param {string} currentSection - Current section header
 * @param {Object} investigation - Investigation object being built
 * @returns {{currentStudy: Object, currentSection: string}} Updated state
 */
function processInvestigationFileLine(line, currentStudy, currentSection, investigation) {
  // Skip comment lines
  if (line.startsWith('#')) {
    return { currentStudy, currentSection };
  }

  // Check if this is a section header
  if (SECTIONS[line] || (currentStudy && line in currentStudy)) {
    currentSection = line;

    if (line === 'STUDY') {
      if (currentStudy) {
        investigation.STUDY.push(currentStudy);
      }
      currentStudy = createStudyTemplate();
    }

    return { currentStudy, currentSection };
  }

  // Parse data line
  const parts = line.split('\t');

  if (parts.length > 0) {
    const fieldName = parts[0];
    const fieldValues = parts.slice(1).map(v => replaceStr('"', '', v)).filter(v => v !== '');

    if (currentStudy && currentSection) {
      if (!currentStudy[currentSection]) {
        currentStudy[currentSection] = {};
      }
      currentStudy[currentSection][fieldName] = fieldValues;
    } else if (currentSection) {
      investigation[currentSection][fieldName] = fieldValues;
    }
  }

  return { currentStudy, currentSection };
}

/**
 * Parse an investigation file content
 * @param {string} fileContents - Raw file content as string
 * @param {Object} options - Parsing options
 * @param {string} [options.separator='\t'] - Field separator ('\t' for TSV, ',' for CSV)
 * @returns {Object} Parsed investigation data structure
 */
export function parseInvestigation(fileContents, options = {}) {
  const { separator = '\t' } = options;

  const investigation = {
    'ONTOLOGY SOURCE REFERENCE': {},
    INVESTIGATION: {},
    'INVESTIGATION CONTACTS': {},
    'INVESTIGATION PUBLICATIONS': {},
    STUDY: []
  };

  const lines = fileContents.split(/\r\n|\r|\n/g);
  let currentSection = '';
  let currentStudy;

  for (const line of lines) {
    const result = processInvestigationFileLine(
      line.trim(),
      currentStudy,
      currentSection,
      investigation
    );
    currentStudy = result.currentStudy;
    currentSection = result.currentSection;
  }

  // Push the last study if exists
  if (currentStudy) {
    investigation.STUDY.push(currentStudy);
  }

  return investigation;
}

/**
 * Generate records array from a study section
 * @param {Object} studyInformation - Study object containing sections
 * @param {string} fieldName - Section name (e.g., 'STUDY PUBLICATIONS')
 * @returns {Array} Array of record objects
 */
export function generateRecords(studyInformation, fieldName) {
  const result = [];
  const records = studyInformation[fieldName];

  if (!records) return result;

  for (const field in records) {
    const values = records[field];
    for (let i = 0; i < values.length; i++) {
      if (!result[i]) {
        result[i] = {};
      }
      result[i][field] = replaceStr('"', '', values[i]);
    }
  }

  return result;
}

/**
 * Extract study information from parsed investigation
 * @param {Object} investigation - Parsed investigation object
 * @param {string} studyId - Study identifier to find
 * @returns {Object|null} Study data or null if not found
 */
export function getStudyById(investigation, studyId) {
  for (const study of investigation.STUDY) {
    const studyIdentifier = study.STUDY?.['Study Identifier']?.[0];
    if (studyIdentifier && studyIdentifier.includes(studyId)) {
      return {
        studyId: replaceStr('"', '', studyIdentifier),
        studyTitle: replaceStr('"', '', study.STUDY['Study Title']?.[0] || ''),
        studyDescription: replaceStr('"', '', study.STUDY['Study Description']?.[0] || ''),
        studyFileName: replaceStr('"', '', study.STUDY['Study File Name']?.[0] || ''),
        publications: generateRecords(study, 'STUDY PUBLICATIONS'),
        protocols: generateRecords(study, 'STUDY PROTOCOLS'),
        contacts: generateRecords(study, 'STUDY CONTACTS'),
        factors: generateRecords(study, 'STUDY FACTORS'),
        assays: generateRecords(study, 'STUDY ASSAYS')
      };
    }
  }
  return null;
}
