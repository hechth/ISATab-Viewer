# Galaxy Integration for ISATab Viewer

This directory contains the integration of the ISATab Viewer into Galaxy as an interactive visualization, following the pattern used by the [tabulator visualization](https://github.com/galaxyproject/galaxy-visualizations/tree/main/packages/tabulator).

## Overview

The ISATab Viewer can be integrated into Galaxy to visualize ISA-Tab files (investigation files with `.txt` extension). When a user selects an ISA-Tab dataset and chooses "Visualize", Galaxy will render the interactive viewer showing:

- Study list navigation
- Investigation metadata
- Sample characteristics distribution
- Assay tables with sorting
- Publications, protocols, factors, and contacts

## Package Structure

```
packages/isatab-viewer/
├── package.json          # NPM configuration
├── index.html            # Entry HTML file (Galaxy provides this)
├── main.js               # Main JavaScript entry point
├── main.css              # Styles
└── vite.config.js        # Vite build configuration
```

## How It Works

1. **Galaxy injects configuration** via `dataset.incoming`:
   ```javascript
   {
     "root": "/",
     "visualization_config": {
       "dataset_id": "abc123xyz"
     }
   }
   ```

2. **The viewer fetches the ISA-Tab file** from the Galaxy API using the dataset ID.

3. **The ISA-TAB content is parsed** and rendered interactively using the ISATab Viewer library.

## Setup Instructions

### Option 1: Using the Built Bundle (Recommended)

This approach builds the ISATab Viewer as a standalone package that includes all necessary code.

1. **Build the ISATab Viewer** from the main project:
   ```bash
   cd /path/to/ISATab-Viewer
   npm install
   npm run build
   ```

2. **Create the Galaxy visualization package structure**:
   ```bash
   mkdir -p $GALAXY_ROOT/tool-data/visualizations/packages/isatab-viewer
   cp -r dist/* $GALAXY_ROOT/tool-data/visualizations/packages/isatab-viewer/
   cp galaxy-integration-example/index.html $GALAXY_ROOT/tool-data/visualizations/packages/isatab-viewer/
   cp galaxy-integration-example/main.js $GALAXY_ROOT/tool-data/visualizations/packages/isatab-viewer/
   cp galaxy-integration-example/main.css $GALAXY_ROOT/tool-data/visualizations/packages/isatab-viewer/
   ```

3. **Configure Galaxy** in `galaxy.yml`:
   ```yaml
   visualizations:
     - name: isatab-viewer
       title: ISA-TAB Viewer
       path: tool-data/visualizations/packages/isatab-viewer
       data_types:
         - isatab
         - txt
   ```

4. **Restart Galaxy**:
   ```bash
   cd $GALAXY_ROOT
   sh run.sh --reload
   ```

### Option 2: Development Mode

For local development and testing:

```bash
cd galaxy-integration-example
npm install
npm run dev
```

This starts a local server at http://localhost:3000 for testing.

## Data Flow

```
User selects ISA-Tab dataset
        ↓
User clicks "Visualize" → Galaxy loads isatab-viewer package
        ↓
main.js reads dataset_id from incoming config
        ↓
Fetches dataset content from /api/datasets/{id}/display
        ↓
Parses ISA-Tab investigation file
        ↓
Loads associated study and assay files
        ↓
Renders interactive visualization
```

## Limitations

1. **Single File Input**: Currently, the visualization expects a single investigation file. For full ISA-Tab functionality with studies and assays, Galaxy would need to provide access to related files in the same dataset archive.

2. **File Size**: Large ISA-Tab files may take time to load. Consider implementing pagination or lazy loading for very large datasets.

3. **Cross-Origin**: If Galaxy runs on a different domain than the visualization, CORS headers must be properly configured.

## Customization

The viewer can be customized by modifying `main.js`:

```javascript
// Change the separator (for CSV instead of TSV)
await window.ISATabViewer.rendering.render_isatab_from_file(
  `galaxy://${datasetId}`,
  '#viewer-container',
  { separator: ',' }
);
```

## Troubleshooting

### Visualization not loading

Check browser console for errors. Common issues:
- Missing `window.ISATabViewer` - ensure the library is loaded
- CORS errors - check Galaxy's CORS configuration
- Dataset ID not found - verify the dataset exists

### Empty visualization

- Verify the dataset contains valid ISA-Tab format
- Check that the investigation file starts with proper section headers
- Look for errors in the browser console

### Styling conflicts

The ISATab Viewer includes its own CSS. If there are conflicts with Galaxy's theme:
- Override specific styles in `main.css`
- Use more specific CSS selectors
- Adjust the z-index values if elements overlap

## References

- [ISA-Tab Format Specification](https://isa-tools.org/format/)
- [Galaxy Visualizations Documentation](https://docs.galaxyproject.org/en/latest/admin/special_topics/visualizations.html)
- [Tabulator Galaxy Integration](https://github.com/galaxyproject/galaxy-visualizations/tree/main/packages/tabulator)
