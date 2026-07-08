/**
 * HTML Templates for ISATab Viewer
 *
 * Handlebars templates for rendering different parts of the ISA-TAB viewer.
 */

export const studyListTemplate = `
  <dl>
    <dt>
      <h4 onclick="ISATabViewer.renderInvention()">Investigation {{this.investigation_id}}</h4>
    </dt>
    <dd>
      {{#each studies}}
      <li id="list-{{this.hash}}" onclick="ISATabViewer.renderStudy('{{this.id}}', '{{this.hash}}')">
        {{this.id}}
      </li>
      {{/each}}
    </dd>
  </dl>
`;

export const tableTemplate = `
  <table id="assay-table" class="isa-table">
    <thead>
      <tr>
        {{#each headers}}
        <th>{{this}}</th>
        {{/each}}
      </tr>
    </thead>
    <tbody>
      {{#each rows}}
      <tr>
        {{#each columns}}
        <td>{{this}}</td>
        {{/each}}
      </tr>
      {{/each}}
    </tbody>
  </table>
`;

export const sampleDistributionTemplate = `
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
`;

export const investigationTemplate = `
  <div id="investigation-title">{{investigation_title}}</div>
  <div id="investigation-description">{{investigation_description}}</div>

  <div class="cf"></div>
  <br/>

  <div id="investigation-contacts">
    <span class="section-header">Contacts</span>
    <ul>
      {{#each contacts}}
      <li>
        <p class="investigation-contact">{{[Investigation Person First Name]}} {{[Investigation Person Last Name]}}</p>
        <p class="investigation-contact-address">{{[Investigation Person Address]}}</p>
        <p class="investigation-contact-affiliation">{{[Investigation Person Affiliation]}}</p>
      </li>
      {{/each}}
    </ul>
  </div>

  <div id="investigation-publications">
    <span class="section-header">Publications</span>
    <ul>
      {{#each publications}}
      <li>
        <p class="publication-title">{{[Investigation Publication Title]}}</p>
        <p class="publication-authors">{{[Investigation Publication Author List]}}</p>
        <p class="publication-pubmedid">Pubmed ID <span>{{[Investigation PubMed ID]}}</span></p>
        <p class="publication-doi">DOI <a href="https://doi.org/{{[Investigation Publication DOI]}}">{{[Investigation Publication DOI]}}</a></p>
      </li>
      {{/each}}
    </ul>
  </div>
`;

export const studyTemplate = `
  <div id="study-title">{{study_title}}</div>
  <div id="study-description">{{study_description}}</div>

  <div class="cf"></div>
  <br/>

  <div id="samples">
    <span class="section-header">Samples</span>
    <div class="cf"></div>
    <br/><br/>
    <button class="btn btn-green" onclick="ISATabViewer.renderAssay('{{study_id}}','{{study_id_hash}}','{{study_file}}')">
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
        <button class="btn btn-green" onclick="ISATabViewer.renderAssay('{{../study_id}}','{{../study_id_hash}}','{{[Study Assay File Name]}}')">
          View
        </button>
      </li>
      {{/each}}
    </ul>
  </div>

  <div class="cf"></div>

  <div id="publications">
    <span class="section-header">Publications</span>
    <ul>
      {{#each publications}}
      <li>
        <p class="publication-title">{{[Study Publication Title]}}</p>
        <p class="publication-authors">{{[Study Publication Author List]}}</p>
        <p class="publication-pubmedid">Pubmed ID <span>{{[Study PubMed ID]}}</span></p>
        <p class="publication-doi">DOI <a href="https://doi.org/{{[Study Publication DOI]}}">{{[Study Publication DOI]}}</a></p>
      </li>
      {{/each}}
    </ul>
  </div>

  <div class="cf"></div>
  <br/><br/>

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
        <p class="contact-address">{{[Study Person Address]}}</p>
        <p class="contact-affiliation">{{[Study Person Affiliation]}}</p>
      </li>
      {{/each}}
    </ul>
  </div>
`;
