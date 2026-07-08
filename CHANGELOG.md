# Changelog

All notable changes to ISATab Viewer will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Complete rewrite using modern ES modules
- Replaced jQuery with vanilla JavaScript
- Updated Handlebars from v1.3.0 to v4.7.8
- Modernized CSS with flexbox and CSS grid
- Removed IE6/7 compatibility code

### Added
- NPM package for easy installation
- Vite build system
- ESLint and Prettier configuration
- Unit tests with Vitest
- TypeScript-compatible JSDoc comments
- Galaxy integration example

### Removed
- Gist API integration (deprecated by GitHub)
- jQuery dependency
- Legacy clearfix hacks

## [1.0.0] - 2014-06-19

### Added
- Initial release
- Investigation file parsing
- Study file parsing
- Assay file parsing
- Handlebars template rendering
- Gist-based loading
- Local file loading

### Changed
- Original implementation using jQuery 1.11.1
- Handlebars v1.3.0 for templating

---

## Migration Guide (v1.x → v2.x)

### Breaking Changes

1. **Global API changed**
   - Old: `ISATabViewer.rendering.render_isatab_from_file(...)`
   - New: `ISATabViewer.renderFromFile(...)`

2. **Module system**
   - Old: Global script tags
   - New: ES modules via NPM

3. **jQuery removed**
   - If you extended the viewer with jQuery, update to vanilla JS

### Code Migration

```javascript
// v1.x
<script src="jquery.js"></script>
<script src="isatab-viewer.js"></script>
<script>
  ISATabViewer.rendering.render_isatab_from_file('i_investigation.txt', '#container');
</script>

// v2.x
import ISATabViewer from 'isatab-viewer';
await ISATabViewer.renderFromFile('i_investigation.txt', '#container');
```
