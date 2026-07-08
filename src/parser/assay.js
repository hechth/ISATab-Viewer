/**
 * ISA-TAB Assay File Parser
 *
 * Parses ISA-Tab assay files (a_*.txt) and study files (s_*.txt).
 * Extracts headers, rows, and characteristic statistics.
 */

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
 * Parse an assay or study file content
 * @param {string} fileName - Name of the file being parsed
 * @param {string} fileContents - Raw file content as string
 * @param {Object} options - Parsing options
 * @param {string} [options.separator='\t'] - Field separator ('\t' for TSV, ',' for CSV)
 * @returns {{headers: Array, rows: Array, stats: Object}} Parsed data with characteristics stats
 */
export function parseAssayFile(fileName, fileContents, options = {}) {
  const { separator = '\t' } = options;

  const result = {
    headers: [],
    rows: [],
    stats: {}
  };

  const lines = fileContents.split(/\r\n|\r|\n/g);
  let rowCount = 0;

  // Track which columns contain characteristics
  const positionToCharacteristic = {};
  const characteristics = {};

  for (const line of lines) {
    const lineContents = line.trim();
    if (!lineContents) continue;

    const parts = lineContents.split(separator);
    const processedParts = [];

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      const columnValue = replaceStr('"', '', part);
      processedParts.push(columnValue);

      // Track characteristics columns (columns containing "Characteristics")
      if (rowCount === 0 && columnValue.includes('Characteristics')) {
        characteristics[columnValue] = {};
        positionToCharacteristic[index] = columnValue;
      } else if (index in positionToCharacteristic) {
        // Count characteristic value distributions
        const characteristicName = positionToCharacteristic[index];
        if (!(columnValue in characteristics[characteristicName])) {
          characteristics[characteristicName][columnValue] = 0;
        }
        characteristics[characteristicName][columnValue]++;
      }
    }

    if (rowCount === 0) {
      // First row contains headers
      result.headers = processedParts;
    } else {
      // Data rows
      result.rows.push({ columns: processedParts });
    }

    rowCount++;
  }

  result.stats = characteristics;

  return result;
}

/**
 * Process sample statistics from assay characteristics
 * @param {Object} stats - Characteristics statistics object
 * @returns {Array} Formatted sample statistics for display
 */
export function processSampleStatistics(stats) {
  const studySampleStats = [];

  for (const characteristicName in stats) {
    const record = {
      name: characteristicName,
      distribution: []
    };

    for (const distributionItem in stats[characteristicName]) {
      record.distribution.push({
        name: distributionItem,
        value: stats[characteristicName][distributionItem]
      });
    }

    studySampleStats.push(record);
  }

  return studySampleStats;
}

/**
 * Add icon classes based on assay measurement type
 * @param {Array} assays - Array of assay records
 * @returns {Array} Assays with added icon property
 */
export function postprocessAssayRecords(assays) {
  for (const assay of assays) {
    const measurementType = assay['Study Assay Measurement Type'] || '';

    assay.icon = measurementType.includes('metabolite') ? 'assay-icon-metabolomics'
      : measurementType.includes('prote') ? 'assay-icon-proteomics'
      : measurementType.includes('transcript') ? 'assay-icon-transcriptomics'
      : measurementType.includes('chemistry') ? 'assay-icon-chemistry'
      : measurementType.includes('genom') ? 'assay-icon-genomics'
      : '';
  }

  return assays;
}

/**
 * Check if a file is a study file (starts with 's_')
 * @param {string} fileName - File name to check
 * @returns {boolean} True if study file
 */
export function isStudyFile(fileName) {
  return fileName.startsWith('s_');
}

/**
 * Check if a file is an assay file (starts with 'a_')
 * @param {string} fileName - File name to check
 * @returns {boolean} True if assay file
 */
export function isAssayFile(fileName) {
  return fileName.startsWith('a_');
}

/**
 * Check if a file is an investigation file (starts with 'i_')
 * @param {string} fileName - File name to check
 * @returns {boolean} True if investigation file
 */
export function isInvestigationFile(fileName) {
  return fileName.startsWith('i_');
}
