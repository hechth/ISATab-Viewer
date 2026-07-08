/**
 * Unit Tests for Investigation Parser
 */

import { describe, it, expect } from 'vitest';
import { parseInvestigation, generateRecords, getStudyById } from './investigation.js';

describe('parseInvestigation', () => {
  it('should parse a minimal investigation file', () => {
    const content = `INVESTIGATION
Investigation Identifier\t"TEST-I-1"
Investigation Title\t"Test Investigation"
Investigation Description\t"A test investigation"
STUDY
Study Identifier\t"S-1"
Study Title\t"Test Study"
`;

    const result = parseInvestigation(content);

    expect(result.INVESTIGATION['Investigation Identifier']).toEqual(['TEST-I-1']);
    expect(result.INVESTIGATION['Investigation Title']).toEqual(['Test Investigation']);
    expect(result.STUDY).toHaveLength(1);
    expect(result.STUDY[0].STUDY['Study Identifier']).toEqual(['S-1']);
  });

  it('should handle empty lines and comments', () => {
    const content = `# This is a comment
INVESTIGATION
Investigation Identifier\t"TEST-I-1"

# Another comment
STUDY
Study Identifier\t"S-1"
`;

    const result = parseInvestigation(content);

    expect(result.INVESTIGATION['Investigation Identifier']).toEqual(['TEST-I-1']);
    expect(result.STUDY).toHaveLength(1);
  });

  it('should parse multiple studies', () => {
    const content = `STUDY
Study Identifier\t"S-1"
Study Title\t"Study One"
STUDY
Study Identifier\t"S-2"
Study Title\t"Study Two"
`;

    const result = parseInvestigation(content);

    expect(result.STUDY).toHaveLength(2);
    expect(result.STUDY[0].STUDY['Study Identifier']).toEqual(['S-1']);
    expect(result.STUDY[1].STUDY['Study Identifier']).toEqual(['S-2']);
  });

  it('should handle CSV separator', () => {
    const content = `INVESTIGATION
Investigation Identifier,"TEST-I-1"
Investigation Title,"Test Investigation"
`;

    const result = parseInvestigation(content, { separator: ',' });

    expect(result.INVESTIGATION['Investigation Identifier']).toEqual(['TEST-I-1']);
  });

  it('should remove quotes from values', () => {
    const content = `INVESTIGATION
Investigation Identifier\t"Value with \"quotes\""
`;

    const result = parseInvestigation(content);

    expect(result.INVESTIGATION['Investigation Identifier']).toEqual(['Value with quotes']);
  });

  it('should handle empty values', () => {
    const content = `INVESTIGATION
Investigation Identifier\t""
Investigation Title\t"Title"
`;

    const result = parseInvestigation(content);

    // Empty quoted values should result in empty array
    expect(result.INVESTIGATION['Investigation Identifier'].length).toBe(0);
    expect(result.INVESTIGATION['Investigation Title']).toEqual(['Title']);
  });

  it('should parse investigation contacts section', () => {
    const content = `INVESTIGATION CONTACTS
Investigation Person Last Name\t"Doe"
Investigation Person First Name\t"John"
Investigation Person Email\t"john@example.com"
`;

    const result = parseInvestigation(content);

    expect(result['INVESTIGATION CONTACTS']['Investigation Person Last Name']).toEqual(['Doe']);
    expect(result['INVESTIGATION CONTACTS']['Investigation Person First Name']).toEqual(['John']);
  });
});

describe('generateRecords', () => {
  it('should generate records from a section', () => {
    const study = {
      'STUDY PUBLICATIONS': {
        'Study Publication Title': ['Title 1', 'Title 2'],
        'Study PubMed ID': ['12345', '67890']
      }
    };

    const records = generateRecords(study, 'STUDY PUBLICATIONS');

    expect(records).toHaveLength(2);
    expect(records[0]['Study Publication Title']).toBe('Title 1');
    expect(records[0]['Study PubMed ID']).toBe('12345');
    expect(records[1]['Study Publication Title']).toBe('Title 2');
    expect(records[1]['Study PubMed ID']).toBe('67890');
  });

  it('should return empty array for missing section', () => {
    const study = { STUDY: {} };
    const records = generateRecords(study, 'STUDY PUBLICATIONS');
    expect(records).toEqual([]);
  });

  it('should remove quotes from record values', () => {
    const study = {
      'STUDY FACTORS': {
        'Study Factor Name': ['"Factor A"', '"Factor B"']
      }
    };

    const records = generateRecords(study, 'STUDY FACTORS');

    expect(records[0]['Study Factor Name']).toBe('Factor A');
    expect(records[1]['Study Factor Name']).toBe('Factor B');
  });
});

describe('getStudyById', () => {
  it('should find study by identifier', () => {
    const investigation = {
      STUDY: [
        {
          STUDY: {
            'Study Identifier': ['S-1'],
            'Study Title': ['Test Study'],
            'Study Description': ['A description']
          }
        }
      ]
    };

    const study = getStudyById(investigation, 'S-1');

    expect(study).not.toBeNull();
    expect(study.studyId).toBe('S-1');
    expect(study.studyTitle).toBe('Test Study');
  });

  it('should return null for non-existent study', () => {
    const investigation = {
      STUDY: [
        {
          STUDY: {
            'Study Identifier': ['S-1']
          }
        }
      ]
    };

    const study = getStudyById(investigation, 'S-999');
    expect(study).toBeNull();
  });

  it('should handle partial match in study identifier', () => {
    const investigation = {
      STUDY: [
        {
          STUDY: {
            'Study Identifier': ['BII-S-3']
          }
        }
      ]
    };

    const study = getStudyById(investigation, 'BII-S-3');
    expect(study).not.toBeNull();
  });
});
