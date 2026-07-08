/**
 * Unit Tests for Assay Parser
 */

import { describe, it, expect } from 'vitest';
import {
  parseAssayFile,
  processSampleStatistics,
  postprocessAssayRecords,
  isStudyFile,
  isAssayFile,
  isInvestigationFile
} from './assay.js';

describe('parseAssayFile', () => {
  it('should parse a simple assay file', () => {
    const content = `ID\tCharacteristics[organism]\tCharacteristics[tissue]
s_1\thomo sapiens\tblood
s_2\thomo sapiens\tliver
`;

    const result = parseAssayFile('test.txt', content);

    expect(result.headers).toEqual(['ID', 'Characteristics[organism]', 'Characteristics[tissue]']);
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].columns).toEqual(['s_1', 'homo sapiens', 'blood']);
  });

  it('should track characteristic statistics', () => {
    const content = `ID\tCharacteristics[organism]
s_1\thomo sapiens
s_2\thomo sapiens
s_3\tmus musculus
`;

    const result = parseAssayFile('test.txt', content);

    expect(result.stats['Characteristics[organism]']).toEqual({
      'homo sapiens': 2,
      'mus musculus': 1
    });
  });

  it('should handle empty lines', () => {
    const content = `ID\tValue
s_1\tA

s_2\tB
`;

    const result = parseAssayFile('test.txt', content);

    expect(result.rows).toHaveLength(2);
  });

  it('should handle CSV format', () => {
    const content = `ID,Value
s_1,A
s_2,B
`;

    const result = parseAssayFile('test.txt', content, { separator: ',' });

    expect(result.headers).toEqual(['ID', 'Value']);
    expect(result.rows[0].columns).toEqual(['s_1', 'A']);
  });

  it('should remove quotes from values', () => {
    const content = `ID\tValue
s_1\t"A value"
`;

    const result = parseAssayFile('test.txt', content);

    expect(result.rows[0].columns).toEqual(['s_1', 'A value']);
  });

  it('should handle multiple characteristics columns', () => {
    const content = `ID\tCharacteristics[organism]\tCharacteristics[sex]
s_1\thomo sapiens\tmale
s_2\thomo sapiens\tfemale
s_3\tmus musculus\tmale
`;

    const result = parseAssayFile('test.txt', content);

    expect(result.stats['Characteristics[organism]']).toEqual({
      'homo sapiens': 2,
      'mus musculus': 1
    });
    expect(result.stats['Characteristics[sex]']).toEqual({
      male: 2,
      female: 1
    });
  });
});

describe('processSampleStatistics', () => {
  it('should convert stats to display format', () => {
    const stats = {
      'Characteristics[organism]': {
        'homo sapiens': 10,
        'mus musculus': 5
      }
    };

    const result = processSampleStatistics(stats);

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Characteristics[organism]');
    expect(result[0].distribution).toContainEqual({ name: 'homo sapiens', value: 10 });
    expect(result[0].distribution).toContainEqual({ name: 'mus musculus', value: 5 });
  });

  it('should handle empty stats', () => {
    const result = processSampleStatistics({});
    expect(result).toEqual([]);
  });

  it('should handle multiple characteristics', () => {
    const stats = {
      'Characteristics[organism]': { 'homo sapiens': 10 },
      'Characteristics[sex]': { male: 5, female: 5 }
    };

    const result = processSampleStatistics(stats);

    expect(result).toHaveLength(2);
  });
});

describe('postprocessAssayRecords', () => {
  it('should add metabolomics icon', () => {
    const assays = [
      { 'Study Assay Measurement Type': 'metabolite profiling' }
    ];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('assay-icon-metabolomics');
  });

  it('should add proteomics icon', () => {
    const assays = [
      { 'Study Assay Measurement Type': 'protein expression profiling' }
    ];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('assay-icon-proteomics');
  });

  it('should add transcriptomics icon', () => {
    const assays = [
      { 'Study Assay Measurement Type': 'transcriptome analysis' }
    ];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('assay-icon-transcriptomics');
  });

  it('should add genomics icon', () => {
    const assays = [
      { 'Study Assay Measurement Type': 'genome sequencing' }
    ];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('assay-icon-genomics');
  });

  it('should add chemistry icon', () => {
    const assays = [
      { 'Study Assay Measurement Type': 'chemical analysis' }
    ];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('assay-icon-chemistry');
  });

  it('should return empty string for unknown measurement type', () => {
    const assays = [
      { 'Study Assay Measurement Type': 'unknown type' }
    ];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('');
  });

  it('should handle missing measurement type', () => {
    const assays = [{}];

    const result = postprocessAssayRecords(assays);

    expect(result[0].icon).toBe('');
  });
});

describe('file type detection', () => {
  it('should identify study files', () => {
    expect(isStudyFile('s_sample.txt')).toBe(true);
    expect(isStudyFile('s_PXD017710.txt')).toBe(true);
    expect(isStudyFile('i_investigation.txt')).toBe(false);
    expect(isStudyFile('a_assay.txt')).toBe(false);
  });

  it('should identify assay files', () => {
    expect(isAssayFile('a_assay.txt')).toBe(true);
    expect(isAssayFile('a_PXD017710_protein.txt')).toBe(true);
    expect(isAssayFile('s_sample.txt')).toBe(false);
    expect(isAssayFile('i_investigation.txt')).toBe(false);
  });

  it('should identify investigation files', () => {
    expect(isInvestigationFile('i_investigation.txt')).toBe(true);
    expect(isInvestigationFile('i_gilbert.txt')).toBe(true);
    expect(isInvestigationFile('s_sample.txt')).toBe(false);
    expect(isAssayFile('a_assay.txt')).toBe(false);
  });
});
