# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio and blog site for Eduardo Aguad (aguad.dev). Built with Hugo, vanilla CSS, and vanilla JS — no frontend build tools or npm dependencies required.

## Commands

```bash
# Development server (includes drafts)
hugo server -D

# Production build
hugo --gc --minify
```

Hugo must be installed locally (`hugo` CLI). The extended version with Sass support is used (v0.128.0+).

## Architecture

- **Hugo static site generator** using Go templates (`layouts/`)
- **Single-page landing** at `layouts/index.html` with anchor sections: `#work`, `#blog`, `#about`, `#social`
- **Blog posts** live in `content/posts/` as Markdown with Hugo front matter
- **Asset pipeline**: Hugo processes `assets/css/main.css` and `assets/js/main.js` (minified in production)
- **Static files** in `static/` are served as-is (images, the standalone `/openclaw/` page)
- **Templates**: `layouts/partials/` for reusable components (head, navbar, footer, scripts), `layouts/_default/` for baseof/single/list

## Styling

CSS custom properties define the design system in `assets/css/main.css`. Theme switching (dark default / light) uses `data-theme` attribute on `<html>`. Responsive breakpoint at 768px. Reduced-motion media queries are respected.

## JavaScript

`assets/js/main.js` initializes on DOMContentLoaded with independent modules: theme toggle, matrix rain canvas, typewriter effect, scroll reveal (Intersection Observer), smooth scroll, contact form, mouse parallax, and Konami Code easter egg.

## Deployment

GitHub Actions (`.github/workflows/hugo.yml`) auto-deploys to GitHub Pages on push to `main`.

## Content

Blog posts use numbered directory prefixes for ordering (e.g., `content/posts/3.langchain-intro/`). Hugo config in `hugo.toml` — goldmark renderer has `unsafe: true` for raw HTML in Markdown. Code highlighting uses `github-dark` style.
