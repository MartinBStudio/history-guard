import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

import {
    getList,
    addToList,
    removeFromList,
    getChrome,
    lockApp,
} from "../../shared/chromeApi";

import SetPinModal from "./SetPinModal.tsx";

const HistorySelector: React.FC = () => {
    const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
    const [blockedKeywords, setBlockedKeywords] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState("");
    const [newKeyword, setNewKeyword] = useState("");

    const [hasPin, setHasPin] = useState<boolean>(false);
    const [isLocked, setIsLocked] = useState<boolean>(false);

    // --------------------
    // Load & sync storage
    // --------------------
    useEffect(() => {
        let mounted = true;
        const chromeAPI = getChrome();

        const load = async () => {
            if (!mounted) return;

            const [domains, keywords] = await Promise.all([
                getList("blockedDomains"),
                getList("blockedKeywords"),
            ]);

            chromeAPI.storage.local.get(
                {
                    appPinHash: null,
                    appLocked: false,
                },
                (result: any) => {
                    setHasPin(!!result.appPinHash);
                    setIsLocked(!!result.appLocked);
                }
            );

            setBlockedDomains(domains);
            setBlockedKeywords(keywords);
        };

        load();

        const onChange = (
            changes: Record<string, chrome.storage.StorageChange>,
            area: string
        ) => {
            if (area !== "local") return;

            if (Array.isArray(changes.blockedDomains?.newValue)) {
                setBlockedDomains(changes.blockedDomains.newValue);
            }

            if (Array.isArray(changes.blockedKeywords?.newValue)) {
                setBlockedKeywords(changes.blockedKeywords.newValue);
            }

            if (changes.appPinHash) {
                setHasPin(!!changes.appPinHash.newValue);
            }

            if (changes.appLocked) {
                setIsLocked(!!changes.appLocked.newValue);
            }
        };

        chromeAPI.storage.onChanged.addListener(onChange);

        return () => {
            mounted = false;
            chromeAPI.storage.onChanged.removeListener(onChange);
        };
    }, []);

    // --------------------
    // Add / remove items
    // --------------------
    const handleAdd = async (
        listName: "blockedDomains" | "blockedKeywords",
        value: string
    ) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        if (listName === "blockedDomains") {
            setBlockedDomains((prev) =>
                prev.includes(trimmed) ? prev : [...prev, trimmed]
            );
            setNewDomain("");
        }

        if (listName === "blockedKeywords") {
            setBlockedKeywords((prev) =>
                prev.includes(trimmed) ? prev : [...prev, trimmed]
            );
            setNewKeyword("");
        }

        await addToList(listName, trimmed);
    };

    const handleRemove = async (
        listName: "blockedDomains" | "blockedKeywords",
        value: string
    ) => {
        if (listName === "blockedDomains") {
            setBlockedDomains((prev) => prev.filter((i) => i !== value));
        }

        if (listName === "blockedKeywords") {
            setBlockedKeywords((prev) => prev.filter((i) => i !== value));
        }

        await removeFromList(listName, value);
    };

    // --------------------
    // List renderer
    // --------------------
    const renderList = (
        title: string,
        items: string[],
        dotColor: string,
        listName: "blockedDomains" | "blockedKeywords",
        newValue: string,
        setNewValue: React.Dispatch<React.SetStateAction<string>>
    ) => (
        <div className="col-12 col-md-6 mb-4">
            <h5 className="mb-2">{title}</h5>

            <div className="input-group mb-2">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={`Add ${title}`}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    onKeyDown={(e) =>
                        e.key === "Enter" && handleAdd(listName, newValue)
                    }
                />
                <button
                    className="btn btn-sm btn-primary"
                    onClick={() => handleAdd(listName, newValue)}
                >
                    Add
                </button>
            </div>

            {items.length === 0 ? (
                <p className="text-muted mb-0">No items</p>
            ) : (
                <ul className="list-group">
                    {items.map((item) => (
                        <li
                            key={item}
                            className="list-group-item d-flex align-items-center justify-content-between"
                        >
                            <div className="d-flex align-items-center flex-grow-1 me-2">
                                <span
                                    className="me-2 rounded-circle flex-shrink-0"
                                    style={{
                                        width: 12,
                                        height: 12,
                                        backgroundColor: dotColor,
                                    }}
                                />
                                <span
                                    className="text-truncate"
                                    style={{ maxWidth: "calc(100% - 50px)" }}
                                    title={item}
                                >
                                    {item}
                                </span>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() =>
                                    handleRemove(listName, item)
                                }
                            >
                                &times;
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    // --------------------
    // Render
    // --------------------
    return (
        <div
            className="container-fluid p-3"
            style={{ height: "100vh", overflowY: "auto" }}
        >
            <h3 className="mb-2 text-center">History Guard</h3>

            <p className="text-center text-muted mb-3">
                Manage blocked domains and keywords.
            </p>

            {/* 🔐 Set PIN */}
            {!hasPin && (
                <div className="text-center mb-3">
                    <button
                        className="btn btn-warning btn-sm"
                        data-bs-toggle="modal"
                        data-bs-target="#setPinModal"
                    >
                        🔐 Set password
                    </button>
                </div>
            )}

            {/* 🔒 Lock app */}
            {hasPin && !isLocked && (
                <div className="text-center mb-3">
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={lockApp}
                    >
                        🔒 Lock app
                    </button>
                </div>
            )}

            {/* 🔒 Locked state */}
            {hasPin && isLocked && (
                <p className="text-center text-muted mb-3">
                    🔒 App is locked
                </p>
            )}

            <div className="row">
                {renderList(
                    "Domains",
                    blockedDomains,
                    "#dc3545",
                    "blockedDomains",
                    newDomain,
                    setNewDomain
                )}
                {renderList(
                    "Keywords",
                    blockedKeywords,
                    "#ffc107",
                    "blockedKeywords",
                    newKeyword,
                    setNewKeyword
                )}
            </div>

            {/* PIN modal */}
            {!hasPin && <SetPinModal onSuccess={() => setHasPin(true)} />}
        </div>
    );
};

export default HistorySelector;
