# Galaxy Integration Example for ISATab Viewer

This directory contains an example of how to integrate the ISATab Viewer into Galaxy as an interactive visualization.

## Structure

Following the pattern used by the [tabulator visualization](https://github.com/galaxyproject/galaxy-visualizations/tree/main/packages/tabulator):

```
packages/isatab-viewer/
├── package.json      # NPM package configuration
├── index.html        # Entry HTML file
├── main.js           # Main JavaScript entry point
└── main.css          # Styles
```

## How It Works

1. **Galaxy provides configuration** via `data-incoming` attribute on the `#app` element:
   ```json
   {
     "root": "/",
     "visualization_config": {
       "dataset_id": "abc123"
     }
   }
   ```

2. **The viewer fetches the dataset** from the Galaxy API using the dataset ID.

3. **The ISA-TAB content is parsed** and rendered interactively.

## Setup Instructions

### 1. Add to Galaxy Visualizations

Copy this package to your Galaxy instance:

```bash
cd $GALAXY_ROOT/tool-data/visualizations
git clone <your-repo> packages/isatab-viewer
```

### 2. Install Dependencies

```bash
cd $GALAXY_ROOT/tool-data/visualizations/packages/isatab-viewer
npm install
npm run build
```

### 3. Configure Galaxy

Add to `galaxy.yml`:

```yaml
visualizations:
  - name: isatab-viewer
    title: ISA-TAB Viewer
    path: tool-data/visualizations/packages/isatab-viewer
    data_types:
      - isatab
      - txt
```

### 4. Rebuild Galaxy

```bash
cd $GALAXY_ROOT
sh run.sh --reload
```

## Development

Run in development mode:

```bash
npm run dev
```

This will start a local server with hot reload for testing.

## Customization

You can customize the viewer by passing options to the constructor:

```javascript
const viewer = new ISATabViewer({
  container: '#viewer-container',
  separator: '\t',  // or ',' for CSV
  templates: {
    // Override default templates
  }
});
```

## Troubleshooting

### Dataset not loading

Check the browser console for CORS errors. Ensure Galaxy's API is accessible.

### File format issues

Verify the uploaded file is valid ISA-TAB format. Check the investigation file starts with proper section headers.

### Styling conflicts

The viewer includes its own CSS. If there are conflicts with Galaxy's theme, adjust the styles in `main.css`.
