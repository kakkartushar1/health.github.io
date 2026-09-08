# Repository Guidelines

## Project Structure & Module Organization

This is a static workout website. `index.html` is the landing page, while
`Upper_Body.html`, `upper_body_pull.html`, `upper_body_push.html`, and
`Lower_Body.html` contain workout plans. Exercise media is stored under
`assets/images/exercises/`; many page-specific images are embedded directly in
the HTML. Tests live in `tests/` and use matching `*.test.js` files. Keep
generated or editor-only files out of the repository; `node_modules/`,
`.vscode/`, and `.slingshot/` are ignored.

## Build, Test, and Development Commands

- `npm install` — install the locked Jest/jsdom development dependencies.
- `npm test` — run the complete Jest test suite.
- `python -m http.server 8000` — serve the repository locally for browser
  checks at `http://localhost:8000` (there is no compilation or build step).

Run the test suite after changing page structure, links, accessibility markup,
exercise content, or image sources.

## Coding Style & Naming Conventions

Use four spaces in HTML/CSS and two spaces in JavaScript tests, matching the
existing files. Keep HTML semantic and accessible: preserve `lang`, headings,
skip links, descriptive `alt` text, lazy-loaded images, and meaningful link
labels. Use lowercase hyphenated names for new generic assets where practical;
preserve the existing page filename casing and underscore pattern when editing
or linking workout pages. There is no configured formatter or linter, so keep
formatting consistent with nearby code and avoid broad reformatting of the
large embedded-image pages.

## Testing Guidelines

Tests run with Jest in the Node environment and parse pages through jsdom.
Place new tests in `tests/` with the page or behavior name, for example
`tests/index.test.js`. Assert both user-visible content and important
regressions such as file links, accessibility attributes, image fallbacks, and
external media URLs. Run `npm test` before submitting changes.

## Commit & Pull Request Guidelines

Use concise, imperative commit subjects with the repository's established
prefixes, such as `feat(ui): ...`, `fix: ...`, or `chore: ...`. Pull requests
should explain the user-facing change, list affected pages/assets, include test
results (`npm test`), and attach screenshots for visual changes. Call out any
external image or video URL changes and verify that links still resolve.
