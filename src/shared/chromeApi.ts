// shared/chromeApi.ts

// Mock data for dev
export const chromeMock = {
    storage: {
        local: {
            data: {
                historyItems: ["https://example.com", "https://google.com", "https://stackoverflow.com"],
                blockedDomains: ["example.com", "badsite.com"],
                blockedKeywords: ["ads", "tracker"]
            } as Record<string, any>,

            get: (keys: any, callback: (result: any) => void) => {
                if (typeof keys === "string") {
                    callback({ [keys]: chromeMock.storage.local.data[keys] ?? [] });
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

/**
 * Clean helpers to modify lists
 */
export async function addToList(listName: "blockedDomains" | "blockedKeywords", value: string) {
    const chromeAPI = getChromeAPI();
    chromeAPI.storage.local.get({ [listName]: [] }, (result) => {
        const items: string[] = result[listName] ?? [];
        if (!items.includes(value)) {
            const updated = [...items, value];
            chromeAPI.storage.local.set({ [listName]: updated });
        }
    });
}

export async function removeFromList(listName: "blockedDomains" | "blockedKeywords", value: string) {
    const chromeAPI = getChromeAPI();
    chromeAPI.storage.local.get({ [listName]: [] }, (result) => {
        const items: string[] = result[listName] ?? [];
        const updated = items.filter(item => item !== value);
        chromeAPI.storage.local.set({ [listName]: updated });
    });
}

export async function getList(listName: "historyItems" | "blockedDomains" | "blockedKeywords"): Promise<string[]> {
    const chromeAPI = getChromeAPI();
    return new Promise((resolve) => {
        chromeAPI.storage.local.get({ [listName]: [] }, (result) => {
            resolve(result[listName] ?? []);
        });
    });
}
