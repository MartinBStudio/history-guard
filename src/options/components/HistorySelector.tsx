import React, { useEffect, useState } from "react";

import {
    getList,
    addToList,
    removeFromList,
    getChrome,
    lockApp,
} from "../../shared/chromeApi";

import SetPinModal from "./SetPinModal";
import Footer from "./Footer.tsx";

const HistorySelector: React.FC = () => {
    const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
    const [blockedKeywords, setBlockedKeywords] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState("");
    const [newKeyword, setNewKeyword] = useState("");

    const [hasPin, setHasPin] = useState(false);
    const [isLocked, setIsLocked] = useState(false);

    const [pinJustSet, setPinJustSet] = useState(false);
    const [showSetPin, setShowSetPin] = useState(false);

    // --------------------
    // Load & sync storage
    // --------------------
    useEffect(() => {
        const chromeAPI = getChrome();

        const load = async () => {
            const [domains, keywords] = await Promise.all([
                getList("blockedDomains"),
                getList("blockedKeywords"),
            ]);

            chromeAPI.storage.local.get(
                { appPinHash: null, appLocked: false },
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
        return () => chromeAPI.storage.onChanged.removeListener(onChange);
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
            setBlockedDomains((p) => (p.includes(trimmed) ? p : [...p, trimmed]));
            setNewDomain("");
        } else {
            setBlockedKeywords((p) => (p.includes(trimmed) ? p : [...p, trimmed]));
            setNewKeyword("");
        }

        await addToList(listName, trimmed);
    };

    const handleRemove = async (
        listName: "blockedDomains" | "blockedKeywords",
        value: string
    ) => {
        if (listName === "blockedDomains") {
            setBlockedDomains((p) => p.filter((i) => i !== value));
        } else {
            setBlockedKeywords((p) => p.filter((i) => i !== value));
        }

        await removeFromList(listName, value);
    };

    const handleLockApp = async () => {
        await lockApp();
        window.location.reload();
    };
    // --------------------
    // Render
    // --------------------
    return (
        <div className="container p-3">
            <h3 className="text-center mb-2">History Guard</h3>
            <p className="text-center text-muted mb-3">
                Block selected domains and keywords from being saved in your browser history.
            </p>

            {pinJustSet && (
                <p className="text-center text-success mb-3">
                    ✅ PIN set successfully
                </p>
            )}

            {!hasPin && (
                <div className="text-center mb-3">
                    <button
                        className="btn btn-warning btn-sm"
                        onClick={() => setShowSetPin(true)}
                    >
                        🔐 Set PIN
                    </button>
                </div>
            )}

            {hasPin && !isLocked && (
                <div className="text-center mb-3">
                    <button className="btn btn-danger btn-sm" onClick={handleLockApp}>
                        🔒 Lock app
                    </button>
                </div>
            )}

            <div className="row">
                {/* -------- Domains -------- */}
                <div className="col-12 col-md-6 mb-4">
                    <h5 className="mb-2">Domains</h5>

                    <div className="input-group mb-2">
                        <input
                            className="form-control form-control-sm"
                            value={newDomain}
                            placeholder="Add Domain"
                            onChange={(e) => setNewDomain(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" && handleAdd("blockedDomains", newDomain)
                            }
                        />
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleAdd("blockedDomains", newDomain)}
                        >
                            Add
                        </button>
                    </div>

                    {blockedDomains.length === 0 ? (
                        <p className="text-muted mb-0">No items</p>
                    ) : (
                        <ul className="list-group">
                            {blockedDomains.map((domain) => (
                                <li
                                    key={domain}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-center">
                            <span
                                className="rounded-circle me-2"
                                style={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: "#dc3545",
                                }}
                            />
                                        <span className="text-truncate" title={domain}>
                                {domain}
                            </span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                            handleRemove("blockedDomains", domain)
                                        }
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* -------- Keywords -------- */}
                <div className="col-12 col-md-6 mb-4">
                    <h5 className="mb-2">Keywords</h5>

                    <div className="input-group mb-2">
                        <input
                            className="form-control form-control-sm"
                            value={newKeyword}
                            placeholder="Add Keyword"
                            onChange={(e) => setNewKeyword(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === "Enter" &&
                                handleAdd("blockedKeywords", newKeyword)
                            }
                        />
                        <button
                            className="btn btn-sm btn-primary"
                            onClick={() =>
                                handleAdd("blockedKeywords", newKeyword)
                            }
                        >
                            Add
                        </button>
                    </div>

                    {blockedKeywords.length === 0 ? (
                        <p className="text-muted mb-0">No items</p>
                    ) : (
                        <ul className="list-group">
                            {blockedKeywords.map((keyword) => (
                                <li
                                    key={keyword}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                >
                                    <div className="d-flex align-items-center">
                            <span
                                className="rounded-circle me-2"
                                style={{
                                    width: 12,
                                    height: 12,
                                    backgroundColor: "#ffc107",
                                }}
                            />
                                        <span className="text-truncate" title={keyword}>
                                {keyword}
                            </span>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() =>
                                            handleRemove("blockedKeywords", keyword)
                                        }
                                    >
                                        &times;
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>


            <SetPinModal
                show={showSetPin}
                onClose={() => setShowSetPin(false)}
                onSuccess={() => {
                    setHasPin(true);
                    setPinJustSet(true);
                    setShowSetPin(false);
                    setTimeout(() => setPinJustSet(false), 3000);
                }}
            />
            <Footer />
        </div>
    );
};

export default HistorySelector;
