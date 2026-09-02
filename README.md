# Persistent Permalinks

This BookStack theme module adds a copyable, stable permalink entry to the `Details` sidebar for shelves, books, chapters and pages.

The generated links are ID-based so they remain valid even when:
- the page title changes
- the book name changes
- the shelf, book or chapter slug changes

For pages, the existing BookStack permalink route `/link/{id}` is used.
For books, chapters and shelves, this module adds equivalent redirect routes:
- `/link/book/{id}`
- `/link/chapter/{id}`
- `/link/shelf/{id}`

When opened, these permalinks redirect to the current canonical BookStack URL for the target entity.

## Requirements and considerations

- BookStack v26.03 or newer (the module uses BookStack's adjacent-view registration API).
- This is an unsupported customization built on BookStack's theme/module system.
- It adds custom authenticated web routes for book, chapter and shelf permalinks.
- The copy interaction and confirmation popup depend on JavaScript.
- The permalink is always displayed in the popup so it can be selected and copied manually if browser clipboard access fails.

## Installation

### Install via `bookstack:install-module`

Preferred install method:

```bash
php artisan bookstack:install-module https://github.com/patattzel/bookstack-persistent-permalinks/releases/latest/download/bookstack-persistent-permalinks.zip
```

Requirements:
- an active BookStack theme to already be configured
- a published GitHub release containing `bookstack-persistent-permalinks.zip`

BookStack expects a real module ZIP where `bookstack-module.json` exists at the ZIP root.
The normal GitHub repository source ZIP is not suitable for `bookstack:install-module`.

This repository includes:
- `scripts/package-module.sh` to build a compatible ZIP locally into `dist/bookstack-persistent-permalinks.zip`
- `.github/workflows/release-module-zip.yml` to attach that ZIP to GitHub releases

Release flow for maintainers:
1. Create a GitHub release from this repository.
2. The GitHub Action builds `bookstack-persistent-permalinks.zip`.
3. The workflow uploads that ZIP as a release asset.
4. Users can then install via the `releases/latest/download/...` URL above.

To build the installable ZIP locally:

```bash
bash scripts/package-module.sh
```

### Manual install into an active theme

This repository is a standalone module package, not a full theme.
Copy or clone the repository into your active theme's `modules` folder, for example:

```bash
cd /path/to/bookstack/themes/<your-active-theme>/modules
git clone https://github.com/patattzel/bookstack-persistent-permalinks.git persistent-permalinks
```

Result:

```text
themes/<your-active-theme>/modules/persistent-permalinks/
```

## Structure

This repository is itself a BookStack theme module package:

```text
bookstack-persistent-permalinks/
├── bookstack-module.json
├── functions.php
├── lang/
├── public/
└── views/
```

The package contains:
- `bookstack-module.json` for module metadata
- `functions.php` for route and adjacent-view registration
- `views/` for the permalink row inserted after BookStack's entity metadata
- `lang/` for label and toast text
- `public/` for the permalink copy JavaScript
- `scripts/package-module.sh` for creating a BookStack-compatible release ZIP

## Usage

Open any shelf, book, chapter or page view in BookStack.

In the `Details` sidebar you will see a `Copy permalink` row.
Clicking that row copies the stable permalink to the clipboard without opening it. A confirmation popup displays the permalink for manual copying and also provides a `Copy again` action.

## Compatibility

The module inserts its own view after BookStack's `entities.meta` view instead of overriding complete sidebar templates. This keeps BookStack's sidebar and configurable layout updates intact.

Clipboard writes use the modern Clipboard API in secure contexts and automatically fall back to the browser copy command if that API is unavailable or rejects the request. The sidebar action is a button rather than a link, so it cannot accidentally navigate to the permalink when JavaScript or clipboard access fails.

## Development

Run the JavaScript tests and basic syntax checks with:

```bash
node --test tests/permalink-copy.test.mjs
php -l functions.php
node --check public/permalink-copy.js
bash scripts/package-module.sh
unzip -t dist/bookstack-persistent-permalinks.zip
```

## Files

Main implementation paths:
- `functions.php`
- `views/permalink-module/details-link.blade.php`
- `public/permalink-copy.js`
- `public/permalink-copy.css`
