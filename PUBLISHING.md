# Publishing ISATab Viewer to npm

This document describes the process of publishing the ISATab Viewer package to the npm registry.

## Prerequisites

1. **npm account**: Create an account at https://www.npmjs.com/ if you don't have one
2. **Login to npm**: Run `npm login` and enter your credentials
3. **Package name availability**: Verify the package name `isatab-viewer` is available (or choose a scoped name like `@isa-tools/isatab-viewer`)

## Step-by-Step Publishing Process

### 1. Update Version Number

Update the version in `package.json` following [semantic versioning](https://semver.org/):

```json
"version": "2.0.0"
```

Version format: `MAJOR.MINOR.PATCH`
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### 2. Update CHANGELOG

Document all changes in `CHANGELOG.md`:

```markdown
## [2.0.0] - 2026-01-XX

### Added
- ES Module support with Vite build system
- Resizable sidebar
- Sample data table rendering
- Galaxy integration example

### Changed
- Complete rewrite using modern JavaScript
- Updated Handlebars from v1.3.0 to v4.7.8
- Removed jQuery dependency

### Fixed
- Study file loading timing issues
- Protocol description text wrapping
```

### 3. Run Tests

Ensure all tests pass:

```bash
npm test
```

### 4. Build the Package

Build the distribution files:

```bash
npm run build
```

This creates the `dist/` directory with:
- `isatab-viewer.js` - ES module version
- `isatab-viewer.umd.cjs` - CommonJS version
- `isatab-viewer.css` - Stylesheet

### 5. Preview the Build

Optionally, test the build locally:

```bash
npm run preview
```

### 6. Check Package Contents

Verify what will be published:

```bash
npm pack --dry-run
```

Or:

```bash
npm pack
ls -la *.tgz
tar -tzf isatab-viewer-*.tgz
```

This shows exactly which files will be included in the npm package.

### 7. Publish to npm

#### First Publication

```bash
npm publish
```

#### Subsequent Publications

For patch updates:
```bash
npm version patch  # or minor / major
npm publish
```

Or directly specify version:
```bash
npm version 2.0.1
npm publish
```

### 8. Verify Publication

Check that the package is available:

```bash
npm view isatab-viewer
```

Or visit: https://www.npmjs.com/package/isatab-viewer

## Using Scoped Package Names

If `isatab-viewer` is taken, use a scoped name:

```json
{
  "name": "@isa-tools/isatab-viewer"
}
```

Scoped packages can be public or private:
- **Public**: `npm publish --access public`
- **Private**: Requires npm paid account

## Post-Publication Tasks

### 1. Create Git Tag

```bash
git tag v2.0.0
git push origin v2.0.0
```

### 2. Update GitHub Releases

Create a release on GitHub with:
- Version number as title
- Changelog entries as description
- Attachments if needed

### 3. Notify Users

If this is a major update:
- Update README with new installation instructions
- Announce on relevant forums/mailing lists
- Update dependent projects

## Rollback (if needed)

If you need to unpublish a version:

```bash
npm unpublish isatab-viewer@2.0.0
```

**Note**: npm has strict policies about unpublishing. Versions published within the last 72 hours can be unpublished more easily. After that, you may need to contact npm support.

Better approach: Publish a fixed version instead.

## Continuous Integration (Optional)

Set up automated publishing with GitHub Actions:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm install
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Verification Checklist

Before publishing:

- [ ] Version number updated in `package.json`
- [ ] CHANGELOG updated
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] Package contents verified (`npm pack --dry-run`)
- [ ] README is up-to-date
- [ ] License file present
- [ ] No sensitive data in package
- [ ] Dependencies are up-to-date and secure

## Troubleshooting

### Error: "cannot publish over"

You're trying to publish a version that already exists. Either:
- Increment the version number
- Use `npm unpublish` first (within 72 hours)

### Error: "E403 Forbidden"

You're not logged in or don't have permission:
```bash
npm logout
npm login
```

### Error: "404 Not Found"

The package doesn't exist yet. For first publication, ensure:
- Package name is available
- You're logged in
- If scoped, you have permission for that scope

## Support

For npm-related issues:
- [npm help](https://docs.npmjs.com/)
- [npm support](https://www.npmjs.com/support)

For ISATab Viewer issues:
- [GitHub Issues](https://github.com/ISA-tools/ISATab-Viewer/issues)
