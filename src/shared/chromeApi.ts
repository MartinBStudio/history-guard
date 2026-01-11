// --------------------
// Mock data for dev
// --------------------
type StorageChange = {
    oldValue?: any;
    newValue?: any;
};

type StorageChangeMap = Record<string, StorageChange>;

export const chromeMock = {
    storage: {
        local: {
            data: {
                historyItems: [],
                blockedDomains: ["example.com", "badsite.com"],
                blockedKeywords: ["ads", "tracker"],
                blockedVisitsCount: 0, // ✅ ADD THIS
            } as Record<string, any>,

            get: (keys: any, callback: (result: any) => void) => {
                const result: Record<string, any> = {};

                if (typeof keys === "string") {
                    result[keys] = chromeMock.storage.local.data[keys];
                } else {
                    Object.keys(keys).forEach((key) => {
                        result[key] =
                            chromeMock.storage.local.data[key] ?? keys[key];
                    });
                }

                callback(result);
            },

            set: (items: Record<string, any>, callback?: () => void) => {
                const changes: StorageChangeMap = {};

                Object.keys(items).forEach((key) => {
                    changes[key] = {
                        oldValue: chromeMock.storage.local.data[key],
                        newValue: items[key],
                    };
                });

                chromeMock.storage.local.data = {
                    ...chromeMock.storage.local.data,
                    ...items,
                };

                // 🔥 Fire change event
                chromeMock.storage.onChanged._listeners.forEach((listener) =>
                    listener(changes, "local")
                );

                callback?.();
            },
        },

        onChanged: {
            _listeners: [] as ((
                changes: StorageChangeMap,
                area: string
            ) => void)[],

            addListener(listener: any) {
                this._listeners.push(listener);
            },

            removeListener(listener: any) {
                this._listeners = this._listeners.filter(
                    (l) => l !== listener
                );
            },
        },
    },
};

// --------------------
// Runtime accessor
// --------------------
export function getChrome() {
    return typeof chrome !== "undefined" && chrome.storage
        ? chrome
        : chromeMock;
}

// --------------------
// Generic getter
// --------------------
export async function getList(
    listName: "historyItems" | "blockedDomains" | "blockedKeywords"
): Promise<string[]> {
    const chromeAPI = getChrome();

    return new Promise((resolve) => {
        chromeAPI.storage.local.get({ [listName]: [] }, (result) => {
            resolve(result[listName] ?? []);
        });
    });
}

// --------------------
// Counter helper
// --------------------
export async function incrementBlockedCount(): Promise<void> {
    const chromeAPI = getChrome();

    chromeAPI.storage.local.get(
        { blockedVisitsCount: 0 },
        (result) => {
            chromeAPI.storage.local.set({
                blockedVisitsCount: (result.blockedVisitsCount ?? 0) + 1,
            });
        }
    );
}

// --------------------
// Add item
// --------------------
export async function addToList(
    listName: "blockedDomains" | "blockedKeywords",
    value: string
): Promise<void> {
    const chromeAPI = getChrome();
    const items = await getList(listName);

    if (items.includes(value)) return;

    return new Promise((resolve) => {
        chromeAPI.storage.local.set(
            { [listName]: [...items, value] },
            resolve
        );
    });
}

// --------------------
// Remove item
// --------------------
export async function removeFromList(
    listName: "blockedDomains" | "blockedKeywords",
    value: string
): Promise<void> {
    const chromeAPI = getChrome();
    const items = await getList(listName);

    return new Promise((resolve) => {
        chromeAPI.storage.local.set(
            { [listName]: items.filter((item) => item !== value) },
            resolve
        );
    });
}
