# Selective History (working title)

A Chromium browser extension (Edge + Chrome) that gives users fine-grained control over what gets saved in their browsing history. Instead of wiping everything or relying on InPrivate mode, Selective History lets users define per-domain rules and optional privacy filters to automatically remove unwanted history entries while keeping the rest intact.

## ✨ Features (planned)

### Core
- Automatically remove history entries for selected domains
- Customizable domain list (add/remove/edit)
- Sync rules across devices using `chrome.storage.sync`
- Fast, private, fully local processing (no external servers)

### Privacy Tools
- Optional “Remove adult sites” mode
- Local adult-domain blocklist + keyword heuristics
- User overrides for false positives/negatives

### UI
- React-based Options page for managing rules
- Popup for quick toggles and status
- Clean, modern interface built with Vite + TypeScript

### Architecture
- Manifest V3
- Background service worker for history filtering
- Multi-entry Vite build (background, popup, options)
- Shared typed messaging between UI and background

## 🧱 Tech Stack
- TypeScript
- React
- Vite
- Chrome Extension APIs
- Manifest V3

