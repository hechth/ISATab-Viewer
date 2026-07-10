# ISATab Viewer

A modern web viewer for ISA-Tab files. Part of the [ISA tools](http://www.isa-tools.org) suite.

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.11084.svg)](https://doi.org/10.5281/zenodo.11084)

## What is ISA-Tab?

ISA-Tab is a spreadsheet-based, tab-delimited format for recording metadata describing the context, design and execution of one or more related investigations and their associated studies. It is widely used in life sciences for standardizing experimental metadata.

## Quick Start

### Using a Web Browser

The easiest way to try the ISATab Viewer is to run it locally:

```bash
git clone https://github.com/ISA-tools/ISATab-Viewer.git
cd ISATab-Viewer
npm install
npm run dev
```

Then open http://localhost:3000 in your browser to see the demo with sample datasets.

### As an NPM Package

```bash
npm install isatab-viewer
```

Then use in your project:

```html
<!-- Include the built files -->
<script src="node_modules/isatab-viewer/dist/isatab-viewer.umd.cjs"></script>
<link rel="stylesheet" href="node_modules/isatab-viewer/dist/isatab-viewer.css">

<!-- Your HTML structure -->
<div id="viewer-container" class="isa-view">
  <div class="isa-study-list"><ul id="study-list"></ul></div>
  <div class="isa-main-view"><div id="study-info"></div></div>
</div>

<!-- Load an ISA-Tab file -->
<script>
  ISATabViewer.rendering.render_isatab_from_file('path/to/i_investigation.txt', '#viewer-container');
</script>
```

### From CDN

```html
<script src="https://unpkg.com/isatab-viewer/dist/isatab-viewer.umd.cjs"></script>
<link rel="stylesheet" href="https://unpkg.com/isatab-viewer/dist/isatab-viewer.css">

<div id="viewer-container" class="isa-view">
  <div class="isa-study-list"><ul id="study-list"></ul></div>
  <div class="isa-main-view"><div id="study-info"></div></div>
</div>

<script>
  ISATabViewer.rendering.render_isatab_from_file('i_investigation.txt', '#viewer-container');
</script>
```

## Features

- **Study Navigation**: Browse multiple studies within an investigation
- **Sample Distribution**: View characteristics distribution (organism, cell type, disease state, etc.)
- **Assay Tables**: Interactive tables showing assay data with sorting
- **Metadata Display**: Publications, protocols, factors, and contacts
- **Resizable Sidebar**: Adjust the study list panel width
- **Responsive Design**: Works on desktop and tablet devices

## File Requirements

The viewer expects standard ISA-Tab files:
- Investigation file (`i_*.txt`) - required
- Study file (`s_*.txt`) - recommended for sample data
- Assay files (`a_*.txt`) - optional, for detailed assay information

Files should be tab-separated (TSV format). CSV support is available via the `separator` option.

## Development

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint
```

## Project Structure

```
ISATab-Viewer/
├── src/                    # Source code (ES Modules)
│   ├── components/         # Main viewer component
│   ├── parser/             # ISA-Tab parsing logic
│   ├── renderer/           # DOM rendering utilities
│   ├── utils/              # Helper functions
│   └── styles/             # CSS styles
├── dist/                   # Built distribution files
├── test_data_sets/         # Sample datasets for testing
└── package.json            # Project configuration
```

## License

MIT License. See [LICENSE](LICENSE) for details.

## Credits

Developed by the ISA team at the University of Oxford. Originally created as part of the ISA-a-thon at BGI Hong Kong.

## Related Projects

- [ISAcreator](https://github.com/ISA-tools/ISAcreator) - Desktop application for creating ISA-Tab files
- [ISAtools](https://github.com/ISA-tools/ISAtools) - Python library for working with ISA data
