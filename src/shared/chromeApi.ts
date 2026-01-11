// shared/chromeApi.ts

// Mock data for dev
export const chromeMock = {
    storage: {
        local: {
            // Use Record<string, any> so TS allows indexing
            data: {
                historyItems: [
                    "https://example.com",
                    "https://google.com",
                    "https://stackoverflow.com"
                ],
                blockedDomains: [
                    "example.com",
                    "badsite.com"
                ],
                blockedKeywords: [
                    "ads",
                    "tracker"
                ]
            } as Record<string, any>,

            get: (keys: any, callback: (result: any) => void) => {
                if (typeof keys === "string") {
                    callback({ [keys]: chromeMock.storage.local.data[keys] ?? null });
                } else {
                    callback(chromeMock.storage.local.data);
                }
            },

            set: (items: Record<string, any>, callback?: () => void) => {
                chromeMock.storage.local.data = { ...chromeMock.storage.local.data, ...items };
                if (callback) callback();
            }
        }
    }
};

// Runtime accessor: real Chrome if available, otherwise mock
export function getChromeAPI() {
    if (typeof chrome !== "undefined" && chrome.storage) return chrome;
    return chromeMock;
}
