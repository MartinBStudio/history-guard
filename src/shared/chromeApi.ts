// --------------------
// Types
// --------------------
type StorageChange = {
    oldValue?: any;
    newValue?: any;
};

type StorageChangeMap = Record<string, StorageChange>;

// --------------------
// Simple PIN hash helper
// --------------------
function hashPin(pin: string): string {
    let hash = 0;
    for (let i = 0; i < pin.length; i++) {
        hash = (hash << 5) - hash + pin.charCodeAt(i);
        hash |= 0;
    }
    return hash.toString();
}

// --------------------
// Mock Chrome API (dev)
// --------------------
export const chromeMock = {
    storage: {
        local: {
            data: {
                historyItems: [],
                blockedDomains: ["example.com", "badsite.com"],
                blockedKeywords: ["ads", "tracker"],
                blockedVisitsCount: 0,

                // 🔐 Lock data
                appLocked: false,
                appPinHash: null,
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
// Generic list getter
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

// ====================
// 🔐 APP LOCK METHODS
// ====================

// Set PIN and lock app
export async function setAppPin(pin: string): Promise<void> {
    const chromeAPI = getChrome();

    return new Promise((resolve) => {
        chromeAPI.storage.local.set(
            {
                appPinHash: hashPin(pin),
                appLocked: false,
            },
            resolve
        );
    });
}
export async function lockApp(): Promise<void> {
    const chromeAPI = getChrome();

    return new Promise((resolve) => {
        chromeAPI.storage.local.set(
            { appLocked: true },
            resolve
        );
    });
}
// Unlock app with PIN
export async function unlockApp(pin: string): Promise<boolean> {
    const chromeAPI = getChrome();

    return new Promise((resolve) => {
        chromeAPI.storage.local.get(
            { appPinHash: null },
            (result) => {
                const isValid =
                    result.appPinHash === hashPin(pin);

                if (isValid) {
                    chromeAPI.storage.local.set(
                        { appLocked: false },
                        () => resolve(true)
                    );
                } else {
                    resolve(false);
                }
            }
        );
    });
}

// Check if app is locked
export async function isAppLocked(): Promise<boolean> {
    const chromeAPI = getChrome();

    return new Promise((resolve) => {
        chromeAPI.storage.local.get(
            { appLocked: false },
            (result) => resolve(!!result.appLocked)
        );
    });
}

// Remove PIN & unlock permanently
export async function clearAppPin(): Promise<void> {
    const chromeAPI = getChrome();

    return new Promise((resolve) => {
        chromeAPI.storage.local.set(
            {
                appLocked: false,
                appPinHash: null,
            },
            resolve
        );
    });
}
