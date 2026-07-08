/**
 * ISATabViewer - Main Viewer Component
 *
 * A modern ES module implementation of the ISA-TAB viewer.
 * Based on the original implementation from 2014.
 */

import Handlebars from 'handlebars';
import { hashCode } from '../utils/index.js';
import { setHtml, exists, $, $$ } from '../renderer/index.js';
import '../styles/main.css';

// Global state (mimics original implementation)
const investigation = {
  'ONTOLOGY SOURCE REFERENCE': {},
  INVESTIGATION: {},
  'INVESTIGATION CONTACTS': {},
  'INVESTIGATION PUBLICATIONS': {},
  STUDY: []
};

const spreadsheets = {};

const options = {
  splitter: '\t'
};

let currentPlacement = '';
let isLoadingData = false;

/**
 * Process an investigation file
 */
async function process_file(file_name, file_contents, placement) {
  isLoadingData = true;
  const lines = file_contents.split(/\r\n|\r|\n/g);
  let current_section = '';
  let current_study;

  // Reset investigation data
  investigation.STUDY = [];
  investigation['ONTOLOGY SOURCE REFERENCE'] = {};
  investigation.INVESTIGATION = {};
  investigation['INVESTIGATION CONTACTS'] = {};
  investigation['INVESTIGATION PUBLICATIONS'] = {};

  for (const line of lines) {
    const result = process_investigation_file_line(line.trim(), current_study, current_section);
    current_study = result.current_study;
    current_section = result.current_section;
  }

  if (current_study) {
    investigation.STUDY.push(current_study);
  }

  // Store placement for later use
  currentPlacement = placement;

  render_study_list(placement);

  // Load study files asynchronously
  for (const study_index in investigation.STUDY) {
    const study_information = investigation.STUDY[study_index];
    const study_file = study_information.STUDY['Study File Name']?.[0]?.replace(/"/g, '');
    const base_directory = file_name.substring(0, file_name.lastIndexOf('/') + 1);

    if (study_file) {
      try {
        const response = await fetch(base_directory + study_file);
        if (response.ok) {
          const study_file_contents = await response.text();
          spreadsheets[study_file] = process_assay_file(study_file, study_file_contents);
          const processed_characteristics = spreadsheets[study_file].stats;

          // Update sample distribution if element exists
          if (exists('#sample-distribution')) {
            const sample_stats = process_study_sample_statistics(processed_characteristics);
            const source = $('#sample-distribution-template')?.innerHTML;
            if (source) {
              const template = Handlebars.compile(source);
              const html = template({ sample_stats: sample_stats });
              setHtml('#sample-distribution', html);
            }
          }
        }
      } catch (error) {
        console.warn(`Could not load study file ${study_file}:`, error.message);
      }
    }

    // Load assay files
    const assays = generate_records(study_information, 'STUDY ASSAYS');
    for (const assay of assays) {
      const assay_file_name = assay['Study Assay File Name'];
      if (assay_file_name) {
        try {
          const full_url = base_directory + assay_file_name;
          const response = await fetch(full_url);
          if (response.ok) {
            const file_contents = await response.text();
            process_assay_file(assay_file_name, file_contents);
          } else {
            console.warn(`HTTP error ${response.status} for ${assay_file_name}`);
          }
        } catch (error) {
          console.warn(`Could not load assay file ${assay_file_name}:`, error.message);
        }
      }
    }
  }

  isLoadingData = false;
  return investigation;
}

/**
 * Process each line of the investigation file
 */
function process_investigation_file_line(line_contents, current_study, current_section) {
  // Skip comment lines
  if (line_contents.startsWith('#')) {
    return { current_study, current_section };
  }

  // Check for section headers
  const valid_sections = [
    'ONTOLOGY SOURCE REFERENCE',
    'INVESTIGATION',
    'INVESTIGATION CONTACTS',
    'INVESTIGATION PUBLICATIONS',
    'STUDY',
    'STUDY CONTACTS',
    'STUDY PUBLICATIONS',
    'STUDY FACTORS',
    'STUDY DESIGN DESCRIPTORS',
    'STUDY ASSAYS',
    'STUDY PROTOCOLS'
  ];

  if (valid_sections.includes(line_contents)) {
    current_section = line_contents;

    if (current_section === 'STUDY') {
      if (current_study) {
        investigation.STUDY.push(current_study);
      }
      current_study = create_study_template();
    }

    return { current_study, current_section };
  }

  // Parse data line
  const parts = line_contents.split(options.splitter);

  if (parts.length > 0) {
    const field_name = parts[0];
    const field_values = parts.slice(1).map(v => replace_str('"', '', v)).filter(v => v !== '');

    if (current_study && current_section) {
      if (!current_study[current_section]) {
        current_study[current_section] = {};
      }
      current_study[current_section][field_name] = field_values;
    } else if (current_section) {
      investigation[current_section][field_name] = field_values;
    }
  }

  return { current_study, current_section };
}

/**
 * Process an assay file
 */
function process_assay_file(file_name, file_contents) {
  spreadsheets[file_name] = { headers: [], rows: [] };

  const lines = file_contents.split(/\r\n|\r|\n/g);
  let count = 0;

  const position_to_characteristic = {};
  const characteristics = {};

  for (const line of lines) {
    const line_contents = line.trim();
    if (!line_contents) continue;

    const parts = line_contents.split(options.splitter);
    const processed_parts = [];

    for (let index = 0; index < parts.length; index++) {
      const part = parts[index];
      const column_value = replace_str('"', '', part);
      processed_parts.push(column_value);

      if (count === 0 && column_value.includes('Characteristics')) {
        characteristics[column_value] = {};
        position_to_characteristic[index] = column_value;
      } else if (index in position_to_characteristic) {
        const characteristic_name = position_to_characteristic[index];
        if (!(column_value in characteristics[characteristic_name])) {
          characteristics[characteristic_name][column_value] = 0;
        }
        characteristics[characteristic_name][column_value]++;
      }
    }

    if (count === 0) {
      spreadsheets[file_name].headers = processed_parts;
    } else {
      spreadsheets[file_name].rows.push({ columns: processed_parts });
    }

    count++;
  }

  return characteristics;
}

/**
 * Render the study list
 */
function render_study_list(placement) {
  const studies = [];

  for (const study_index in investigation.STUDY) {
    const study_id = investigation.STUDY[study_index].STUDY['Study Identifier']?.[0]?.replace(/"/g, '');
    const study_title = investigation.STUDY[study_index].STUDY['Study Title']?.[0]?.replace(/"/g, '');
    if (study_id) {
      studies.push({ hash: hashCode(study_id), id: study_id, title: study_title });
    }
  }

  setHtml('.isa-breadcrumb-items', `<li class="active">${studies[0]?.id || 'Unknown'}</li>`);

  // Use template from script tag or default
  let source = $('#study-list-template')?.innerHTML;
  if (!source) {
    source = `
      <h3>ISA-Tab files</h3>
      <ul>
        {{#each studies}}
        <li id="list-{{this.hash}}" onclick="ISATabViewer.rendering.render_study('{{this.id}}', '{{this.hash}}')">
          {{this.id}}
        </li>
        {{/each}}
      </ul>
    `;
  }

  const template = Handlebars.compile(source);
  const html = template({ studies });

  setHtml('#study-list', html);

  // Render first study by default
  if (studies.length > 0) {
    render_study(studies[0].id, studies[0].hash);
  }
}

/**
 * Set active list item
 */
function set_active_list_item(study_id_hash) {
  const items = $$('#study-list li');
  for (const item of items) {
    item.classList.remove('active');
  }
  const activeItem = $(`#list-${study_id_hash}`);
  if (activeItem) {
    activeItem.classList.add('active');
  }
}

/**
 * Process study sample statistics
 */
function process_study_sample_statistics(stats) {
  const study_sample_stats = [];
  for (const characteristic_name in stats) {
    const record = { name: characteristic_name, distribution: [] };
    for (const distribution_item in stats[characteristic_name]) {
      record.distribution.push({
        name: distribution_item,
        value: stats[characteristic_name][distribution_item]
      });
    }
    study_sample_stats.push(record);
  }
  return study_sample_stats;
}

/**
 * Generate records from a section
 */
function generate_records(study_information, field_name) {
  const result = [];
  const records = study_information[field_name] || {};

  for (const field in records) {
    const values = records[field];
    for (let i = 0; i < values.length; i++) {
      if (!result[i]) {
        result[i] = {};
      }
      result[i][field] = replace_str('"', '', values[i]);
    }
  }
  return result;
}

/**
 * Post-process assay records to add icons
 */
function postprocess_assay_records(records) {
  for (const assay_index in records) {
    const assay = records[assay_index];
    const measurement_type = assay['Study Assay Measurement Type'] || '';

    assay.icon = measurement_type.includes('metabolite') ? 'assay-icon-metabolomics'
      : measurement_type.includes('prote') ? 'assay-icon-proteomics'
      : measurement_type.includes('transcript') ? 'assay-icon-transcriptomics'
      : measurement_type.includes('chemistry') ? 'assay-icon-chemistry'
      : measurement_type.includes('genom') ? 'assay-icon-genomics'
      : '';
  }
  return records;
}

/**
 * Check if investigation is empty
 */
function is_empty_investigation() {
  const investigation_title = investigation.INVESTIGATION['Investigation Title'];
  if (!investigation_title || investigation_title.length === 0) {
    return true;
  }
  return false;
}

/**
 * Render the investigation view
 */
function render_investigation() {
  if (is_empty_investigation()) {
    return;
  }

  investigation.investigation_id = investigation.INVESTIGATION['Investigation Identifier'];
  investigation.investigation_title = investigation.INVESTIGATION['Investigation Title'];
  investigation.investigation_description = investigation.INVESTIGATION['Investigation Description'];
  investigation.contacts = generate_records(investigation, 'INVESTIGATION CONTACTS');
  investigation.publications = generate_records(investigation, 'INVESTIGATION PUBLICATIONS');

  setHtml('.isa-breadcrumb-items', `<li class="active">${investigation.investigation_id}</li>`);

  let source = $('#investigation-template')?.innerHTML;
  if (!source) {
    source = `
      <div id="investigation-title">{{investigation_title}}</div>
      <div id="investigation-description">{{investigation_description}}</div>
      <div class="cf"></div>
      <br/>
      <div id="investigation-contacts">
        <span class="section-header">Contacts</span>
        <ul>
          {{#each contacts}}
          <li>
            <p>{{[Investigation Person First Name]}} {{[Investigation Person Last Name]}}</p>
            <p>{{[Investigation Person Affiliation]}}</p>
          </li>
          {{/each}}
        </ul>
      </div>
      <div id="investigation-publications">
        <span class="section-header">Publications</span>
        <ul>
          {{#each publications}}
          <li>
            <p>{{[Investigation Publication Title]}}</p>
          </li>
          {{/each}}
        </ul>
      </div>
    `;
  }

  const template = Handlebars.compile(source);
  const html = template(investigation);
  setHtml('#study-info', html);
}

/**
 * Render a study
 */
function render_study(study_id, study_id_hash) {
  set_active_list_item(study_id_hash);

  setHtml('.isa-breadcrumb-items', `<li class="active">${study_id}</li>`);

  let study = null;
  for (const study_index in investigation.STUDY) {
    const study_information = investigation.STUDY[study_index];
    const sid = study_information.STUDY['Study Identifier']?.[0]?.replace(/"/g, '');
    if (sid === study_id) {
      study = study_information;
      break;
    }
  }

  if (!study) {
    console.warn(`Study ${study_id} not found`);
    return;
  }

  const study_data = {
    study_id,
    study_id_hash,
    study_id_display: study.STUDY['Study Identifier']?.[0]?.replace(/"/g, ''),
    study_title: study.STUDY['Study Title']?.[0]?.replace(/"/g, ''),
    study_description: study.STUDY['Study Description']?.[0]?.replace(/"/g, ''),
    study_file: study.STUDY['Study File Name']?.[0]?.replace(/"/g, ''),
    publications: generate_records(study, 'STUDY PUBLICATIONS'),
    protocols: generate_records(study, 'STUDY PROTOCOLS'),
    contacts: generate_records(study, 'STUDY CONTACTS'),
    factors: generate_records(study, 'STUDY FACTORS'),
    assays: postprocess_assay_records(generate_records(study, 'STUDY ASSAYS'))
  };

  // Add sample stats if available
  if (study_data.study_file && spreadsheets[study_data.study_file]) {
    study_data.sample_stats = process_study_sample_statistics(spreadsheets[study_data.study_file].stats);
  }

  // Use template from script tag or default
  let source = $('#study-template')?.innerHTML;
  if (!source) {
    source = getDefaultStudyTemplate();
  }

  const template = Handlebars.compile(source);
  const html = template(study_data);

  setHtml('#study-info', html);
}

/**
 * Default study template
 */
function getDefaultStudyTemplate() {
  return `
    <div id="study-title">{{study_title}}</div>
    <div id="study-description">{{study_description}}</div>
    <div class="cf"></div>
    <br/>

    <div id="samples">
      <span class="section-header">Samples</span>
      <div class="cf"></div>
      <br/><br/>
      <button class="btn btn-green" onclick="ISATabViewer.rendering.render_assay('{{study_id}}','{{study_id_hash}}','{{study_file}}')">
        View Samples
      </button>
      <br/>
      <div id="sample-distribution">
        {{#if sample_stats}}
        <ul id="sample_stats">
          {{#each sample_stats}}
          <li>
            <p class="characteristic_type">{{name}}</p>
            {{#each distribution}}
            <div class="distribution-group">
              <div class="distribution">{{name}}</div>
              <div class="distribution-value"><span>{{value}}</span></div>
            </div>
            <div class="cf"></div>
            {{/each}}
          </li>
          {{/each}}
        </ul>
        {{/if}}
      </div>
    </div>

    <div id="assays">
      <span class="section-header">Assays</span>
      <ul>
        {{#each assays}}
        <li>
          <div class="assay-icon {{icon}}"></div>
          <p class="measurement-type">{{[Study Assay Measurement Type]}}</p>
          <p class="technology-type">{{[Study Assay Technology Type]}}</p>
          <p class="technology-platform">{{[Study Assay Technology Platform]}}</p>
          <p class="assay-file-name">{{[Study Assay File Name]}}</p>
          <button class="btn btn-green" onclick="ISATabViewer.rendering.render_assay('{{../study_id}}','{{../study_id_hash}}','{{[Study Assay File Name]}}')">
            View
          </button>
        </li>
        {{/each}}
      </ul>
    </div>

    <div class="cf"></div>
    <br/><br/>

    <div id="publications">
      <span class="section-header">Publications</span>
      <ul>
        {{#each publications}}
        <li>
          <p class="publication-title">{{[Study Publication Title]}}</p>
          <p class="publication-authors">{{[Study Publication Author List]}}</p>
          <p class="publication-pubmedid">Pubmed ID: {{[Study PubMed ID]}}</p>
          {{#if [Study Publication DOI]}}
          <p class="publication-doi">DOI: <a href="https://doi.org/{{[Study Publication DOI]}}">{{[Study Publication DOI]}}</a></p>
          {{/if}}
        </li>
        {{/each}}
      </ul>
    </div>

    <div id="protocols">
      <span class="section-header">Protocols</span>
      <ul>
        {{#each protocols}}
        <li>
          <p class="protocol-name">{{[Study Protocol Name]}} ({{[Study Protocol Type]}})</p>
          <p class="protocol-description">{{[Study Protocol Description]}}</p>
        </li>
        {{/each}}
      </ul>
    </div>

    <div id="factors">
      <span class="section-header">Factors</span>
      <ul>
        {{#each factors}}
        <li>
          <p class="protocol-name">{{[Study Factor Name]}} ({{[Study Factor Type]}})</p>
        </li>
        {{/each}}
      </ul>
    </div>

    <div id="contacts">
      <span class="section-header">Contacts</span>
      <ul>
        {{#each contacts}}
        <li>
          <p class="contact-name">{{[Study Person First Name]}} {{[Study Person Last Name]}}</p>
          <p class="contact-affiliation">{{[Study Person Affiliation]}}</p>
        </li>
        {{/each}}
      </ul>
    </div>
  `;
}

/**
 * Render an assay table
 */
function render_assay(study_id, study_id_hash, file_name) {
  setHtml('.isa-breadcrumb-items', `
    <li onclick="ISATabViewer.rendering.render_study('${study_id}', '${study_id_hash}')">${study_id}</li>
    <li class="active">${file_name}</li>
  `);

  const spreadsheet = spreadsheets[file_name];
  if (!spreadsheet) {
    if (isLoadingData) {
      const loadingHtml = `<div class="loading"><p>Loading data for "${file_name}"...</p><p>Please wait a moment and click the button again.</p></div>`;
      setHtml('#study-info', loadingHtml);
    } else {
      const errorHtml = `<div class="error"><p class="error">Data for "${file_name}" could not be loaded.</p><p>The file may not exist or there was an error fetching it.</p></div>`;
      setHtml('#study-info', errorHtml);
    }
    return;
  }

  let source = $('#table-template')?.innerHTML;
  if (!source) {
    source = `
      <table class="isa-table">
        <thead><tr>{{#each headers}}<th>{{this}}</th>{{/each}}</tr></thead>
        <tbody>{{#each rows}}<tr>{{#each columns}}<td>{{this}}</td>{{/each}}</tr>{{/each}}</tbody>
      </table>
    `;
  }

  const template = Handlebars.compile(source);
  const html = template(spreadsheet);

  setHtml('#study-info', html);
}

/**
 * Create a study template
 */
function create_study_template() {
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
 * Replace string occurrences
 */
function replace_str(find, replace, str) {
  if (typeof str !== 'string') return str;
  return str.split(find).join(replace);
}

/**
 * Render from a file
 */
async function render_isatab_from_file(investigation_file, placement, opts = {}) {
  if (opts.separator) {
    options.splitter = opts.separator;
  }

  try {
    const response = await fetch(investigation_file);
    if (!response.ok) {
      throw new Error(`Failed to load ${investigation_file}`);
    }
    const file_contents = await response.text();
    await process_file(investigation_file, file_contents, placement);
  } catch (error) {
    console.error('Error loading investigation file:', error);
    setHtml(placement, `<p class="error">Error loading file: ${error.message}</p>`);
  }
}

// Expose API globally (matching original implementation)
if (typeof window !== 'undefined') {
  window.ISATabViewer = {
    rendering: {
      process_file,
      render_study_list,
      render_study,
      render_assay,
      render_isatab_from_file,
      render_investigation,
      generate_records,
      process_assay_file,
      process_study_sample_statistics
    },
    investigation,
    spreadsheets,
    options
  };
}

export default {
  rendering: {
    process_file,
    render_study_list,
    render_study,
    render_assay,
    render_isatab_from_file
  }
};
