# ISATab Viewer

A modern JavaScript viewer for ISA-Tab files. Part of the [ISA tools](http://www.isa-tools.org) suite.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.11084.svg)](https://doi.org/10.5281/zenodo.11084)

## What is ISA-Tab?

ISA-Tab is a spreadsheet-based, tab-delimited format for recording metadata describing the context, design and execution of one or more related investigations and their associated studies. It is widely used in life sciences for standardizing experimental metadata.

## Installation

### NPM (Recommended)

```bash
npm install isatab-viewer
```

Then import and use in your project:

```javascript
import ISATabViewer from 'isatab-viewer';

// Create a viewer instance
const viewer = new ISATabViewer({ container: '#viewer' });

// Load an investigation file
await ISATabViewer.renderFromFile('path/to/i_investigation.txt', '#viewer');
```

### CDN

Include the built files via CDN:

```html
<script src="https://unpkg.com/isatab-viewer/dist/isatab-viewer.umd.cjs"></script>
<link rel="stylesheet" href="https://unpkg.com/isatab-viewer/dist/isatab-viewer.css">
```

### Development

Clone and run locally:

```bash
git clone https://github.com/ISA-tools/ISATab-Viewer.git
cd ISATab-Viewer
npm install
npm run dev
```

## Usage

### Basic Usage

The simplest way to use the viewer is to call `renderFromFile`:

```javascript
import ISATabViewer from 'isatab-viewer';

async function init() {
  await ISATabViewer.renderFromFile(
    'test_data_sets/BII-S-3/i_gilbert.txt',
    '#my-viewer-container'
  );
}

init();
```

### Custom Configuration

```javascript
import ISATabViewer from 'isatab-viewer';

const viewer = new ISATabViewer({
  container: '#custom-container',
  separator: '\t',  // Use ',' for CSV
  templates: {
    // Override default templates
    studyList: '<ul>{{#each studies}}<li>{{this.id}}</li>{{/each}}</ul>'
  }
});

await viewer.renderFromFile('i_investigation.txt', '#container');
```

### Programmatic API

For more control, you can use the parser functions directly:

```javascript
import { parseInvestigation, parseAssayFile } from 'isatab-viewer';

// Parse investigation file
const investigationContent = await fetch('i_investigation.txt').then(r => r.text());
const investigation = parseInvestigation(investigationContent);

console.log(investigation.STUDY); // Array of studies

// Parse assay/study file
const assayContent = await fetch('s_study.txt').then(r => r.text());
const assayData = parseAssayFile('s_study.txt', assayContent);

console.log(assayData.headers);  // Column headers
console.log(assayData.rows);     // Data rows
console.log(assayData.stats);    // Characteristic statistics
```

### Galaxy Integration

To integrate ISATab Viewer into Galaxy as a visualization:

1. Create a new visualization package following the [Galaxy visualizations structure](https://github.com/galaxyproject/galaxy-visualizations):

```
packages/isatab-viewer/
├── package.json
├── index.html
├── main.js
└── main.css
```

2. In `main.js`:

```javascript
import ISATabViewer from 'isatab-viewer';

const appElement = document.querySelector('#app');
const container = document.createElement('div');
container.id = 'viewer-container';
appElement.appendChild(container);

// Get dataset info from Galaxy
const incoming = JSON.parse(appElement.dataset.incoming || '{}');
const datasetId = incoming.visualization_config.dataset_id;
const root = incoming.root;

// Fetch and render the ISA-Tab file
async function init() {
  const response = await fetch(`${root}api/datasets/${datasetId}`);
  const data = await response.json();
  
  const content = await fetch(`${root}api/datasets/${datasetId}/display`).then(r => r.text());
  
  ISATabViewer.renderFromFile(`data://${datasetId}`, '#viewer-container', {
    // Handle Galaxy-specific data loading
  });
}

init();
```

## API Reference

### ISATabViewer Class

#### Constructor

```javascript
new ISATabViewer(options)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `container` | string | `'#viewer-container'` | CSS selector for the container element |
| `separator` | string | `'\t'` | Field separator (`\t` for TSV, `,` for CSV) |
| `templates` | Object | `{}` | Custom Handlebars templates |

#### Methods

- `processFile(fileName, fileContents, placement)` - Process raw file content
- `renderTo(placement)` - Render to a container
- `renderStudy(studyId, studyIdHash)` - Render a specific study
- `renderAssay(studyId, studyIdHash, fileName)` - Render an assay table

#### Static Methods

- `renderFromFile(investigationFile, placement, options)` - Load and render from URL

### Parser Functions

#### `parseInvestigation(content, options)`

Parse an ISA-TAB investigation file.

**Returns:** `Object` - Parsed investigation data structure

#### `parseAssayFile(fileName, content, options)`

Parse an ISA-TAB assay or study file.

**Returns:** `{ headers: Array, rows: Array, stats: Object }`

#### `processSampleStatistics(stats)`

Convert characteristic statistics to display format.

**Returns:** `Array` - Formatted sample statistics

## File Structure

An ISA-TAB investigation typically includes:

- `i_investigation.txt` - Investigation-level metadata
- `s_study.txt` - Study-level metadata and sample information
- `a_assay.txt` - Assay-specific data

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Note: Requires ES6 module support.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Developed by the ISA team at the University of Oxford. Originally created as part of the ISA-a-thon at BGI Hong Kong.

## Related Projects

- [ISAcreator](https://github.com/ISA-tools/ISAcreator) - Desktop application for creating ISA-Tab files
- [ISAtools](https://github.com/ISA-tools/ISAtools) - Python library for working with ISA data
- [galaxy-isatools](https://github.com/galaxyproject/tools-iuc/tree/master/tools/isatools) - Galaxy tools for ISA
