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

## Considerations

- This is an unsupported customization built on BookStack's theme/module system.
- It overrides the four `show-sidebar-section-details` Blade views for shelves, books, chapters and pages.
- It adds custom authenticated web routes for book, chapter and shelf permalinks.
- The copy interaction depends on JavaScript.
- On failure, the permalink is still available as a normal link target and can be copied via the browser context menu.

## Installation

### Install via `bookstack:install-module`

Once this repository has a published release asset, it can be installed directly with:

```bash
php artisan bookstack:install-module https://github.com/patattzel/bookstack-persistent-permalinks/releases/latest/download/bookstack-persistent-permalinks.zip
```

This requires:
- an active BookStack theme to already be configured
- a release ZIP asset built from this repository

The repository includes:
- `scripts/package-module.sh` to build a compatible ZIP locally
- `.github/workflows/release-module-zip.yml` to attach that ZIP to GitHub releases

### Manual install into an active theme

This repository is a standalone module package, not a full theme.
Copy the repository contents into your active theme's `modules` folder, for example:

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
- `functions.php` for route registration
- `views/` for the sidebar detail overrides
- `lang/` for label and toast text
- `public/` for the permalink copy JavaScript

## Usage

Open any shelf, book, chapter or page view in BookStack.

In the `Details` sidebar you will see a `Permalink` row.
Clicking that row copies the stable permalink to the clipboard and shows a toast notification.

## Files

Main implementation paths:
- `functions.php`
- `views/permalink-module/details-link.blade.php`
- `public/permalink-copy.js`
