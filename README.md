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

Clone this repository into your BookStack `themes` directory:

```bash
cd /path/to/bookstack/themes
git clone https://github.com/patattzel/bookstack-persistent-permalinks.git persistent-permalinks
```

Then enable the theme in your BookStack environment:

```env
APP_THEME=persistent-permalinks
```

After changing the theme configuration, clear/rebuild BookStack caches as you normally would for your installation.

## Structure

This repository is an active BookStack theme containing a theme module:

```text
themes/persistent-permalinks/
└── modules/persistent-permalinks/
```

The module contains:
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
- `modules/persistent-permalinks/functions.php`
- `modules/persistent-permalinks/views/permalink-module/details-link.blade.php`
- `modules/persistent-permalinks/public/permalink-copy.js`
