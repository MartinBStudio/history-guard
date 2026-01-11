console.log("Background service worker loaded");

// Listen for new history entries
chrome.history.onVisited.addListener(async (item: chrome.history.HistoryItem) => {
    console.log("New history entry:", item.url);

    if (!item.url) return; // skip if undefined

    // Get current saved history from storage
    const result = (await chrome.storage.local.get({ historyItems: [] })) as { historyItems: string[] };
    const historyItems: string[] = result.historyItems;

    // Add new URL to the front
    historyItems.unshift(item.url); // now TS knows item.url is string

    // Keep only last 50 items
    const limitedHistory = historyItems.slice(0, 50);

    // Save back to storage
    await chrome.storage.local.set({ historyItems: limitedHistory });
});

