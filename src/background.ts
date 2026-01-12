import {incrementBlockedCount} from "./shared/chromeApi.ts";

console.log("Background service worker loaded");

// --- Helpers ---

// Extract domain from URL
function getDomain(url: string): string | null {
    try {
        return new URL(url).hostname;
    } catch {
        return null;
    }
}

// Check if a URL should be blocked
function isBlocked(url: string, blockedDomains: string[], blockedKeywords: string[]): boolean {
    const domain = getDomain(url);
    if (!domain) return false;

    // Match blocked domains: allow subdomains
    if (blockedDomains.some(blocked => domain.toLowerCase().endsWith(blocked.toLowerCase()))) {
        return true;
    }

    // Match keywords anywhere in URL
    if (blockedKeywords.some(keyword => url.toLowerCase().includes(keyword.toLowerCase()))) {
        return true;
    }

    return false;
}

// --- Main removal function ---
async function removeIfBlocked(url: string) {
    // Read current blocked lists and counter
    const storage = await chrome.storage.local.get({
        blockedDomains: [],
        blockedKeywords: [],
        blockedVisitsCount: 0,
    }) as {
        blockedDomains: string[];
        blockedKeywords: string[];
        blockedVisitsCount: number;
    };

    // Check if this URL is blocked
    if (isBlocked(url, storage.blockedDomains, storage.blockedKeywords)) {
        // Delete from browser history
        await chrome.history.deleteUrl({ url });
        console.log(`Blocked and removed: ${url}`);
        // Increment blocked visits counter
        await incrementBlockedCount()
    }
}

// --- Listener ---
chrome.history.onVisited.addListener(async (item: chrome.history.HistoryItem) => {
    if (!item.url) return;
    await removeIfBlocked(item.url);
});
