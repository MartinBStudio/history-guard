import {getList, incrementBlockedCount} from "./shared/chromeApi.ts";

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

export function isBlocked(
    url: string,
    blockedDomains: string[],
    blockedKeywords: string[]
): boolean {
    const domain = getDomain(url);
    if (!domain) return false;

    // Match blocked domains: allow subdomains
    if (
        blockedDomains.some((blocked) =>
            domain.toLowerCase().endsWith(blocked.toLowerCase())
        )
    ) {
        return true;
    }

    // Match keywords anywhere in URL
    if (
        blockedKeywords.some((keyword) =>
            url.toLowerCase().includes(keyword.toLowerCase())
        )
    ) {
        return true;
    }

    return false;
}


// --- Main removal function ---
async function removeIfBlocked(url: string) {
    // Get decoded lists directly
    const blockedDomains = await getList("blockedDomains");
    const blockedKeywords = await getList("blockedKeywords");

    // Check if this URL is blocked
    if (isBlocked(url, blockedDomains, blockedKeywords)) {
        // Delete from browser history
        await chrome.history.deleteUrl({ url });
        console.log(`Blocked and removed: ${url}`);

        // Increment blocked visits counter
        await incrementBlockedCount();
    }
}

// --- Listener ---
chrome.history.onVisited.addListener(async (item: chrome.history.HistoryItem) => {
    if (!item.url) return;
    await removeIfBlocked(item.url);
});
