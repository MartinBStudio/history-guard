# History Guard

A lightweight Chromium extension (Edge + Chrome) that keeps your browsing history clean **automatically**. Instead of wiping everything or relying on InPrivate mode, History Guard lets you browse normally while silently removing history entries that match your rules.

No bloat. No tracking. No external servers.  
Just selective amnesia for your browser.

---

## ✨ Features

### Core
- Automatically removes history entries for:
  - domains on your **blocked domain list**
  - visits containing **blocked keywords**
- Fully local processing — nothing leaves your browser
- Works in normal browsing mode (no need for InPrivate)

### Privacy
- Optional **master password lock**  
  Protects your domain list, keyword list, and settings from anyone who opens the extension UI.
- Popup stays private:  
  Only shows the number of removed records, an Options button, and a support link.

### UI
- Minimal popup focused on privacy and clarity
- Options page for:
  - managing blocked domains  
  - managing blocked keywords  
  - setting or removing the master password  
- Clean, simple interface without unnecessary controls

### Behavior
- Runs quietly in the background
- Deletes matching history entries as soon as they appear
- Keeps the rest of your history untouched

---

## 🧱 Tech Stack
- TypeScript  
- React  
- Vite  
- Chrome/Edge Extension APIs  
- Manifest V3 (service worker–based)

---

## 🎯 Philosophy
Selective History is intentionally small.  
It does one job extremely well:

> **Let me browse normally, but don’t save the stuff I don’t want saved.**

No analytics.  
No cloud sync.  
No feature creep.  
Just a clean history, automatically.
