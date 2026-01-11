import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getList, addToList, removeFromList } from "../../shared/chromeApi";

const HistorySelector: React.FC = () => {
    const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
    const [blockedKeywords, setBlockedKeywords] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState("");
    const [newKeyword, setNewKeyword] = useState("");

    // --------------------
    // Load & sync storage
    // --------------------
    useEffect(() => {
        let mounted = true;

        const load = async () => {
            if (!mounted) return;
            const [domains, keywords] = await Promise.all([
                getList("blockedDomains"),
                getList("blockedKeywords"),
            ]);
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
        };

        if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
            chrome.storage.onChanged.addListener(onChange);
        }

        return () => {
            mounted = false;
            if (typeof chrome !== "undefined" && chrome.storage?.onChanged) {
                chrome.storage.onChanged.removeListener(onChange);
            }
        };
    }, []);

    // --------------------
    // Add / remove items
    // --------------------
    const handleAdd = async (listName: "blockedDomains" | "blockedKeywords", value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return;

        if (listName === "blockedDomains") setBlockedDomains(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);
        if (listName === "blockedKeywords") setBlockedKeywords(prev => prev.includes(trimmed) ? prev : [...prev, trimmed]);

        await addToList(listName, trimmed);

        if (listName === "blockedDomains") setNewDomain("");
        if (listName === "blockedKeywords") setNewKeyword("");
    };

    const handleRemove = async (listName: "blockedDomains" | "blockedKeywords", value: string) => {
        if (listName === "blockedDomains") setBlockedDomains(prev => prev.filter(item => item !== value));
        if (listName === "blockedKeywords") setBlockedKeywords(prev => prev.filter(item => item !== value));
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
                    onKeyDown={(e) => e.key === "Enter" && handleAdd(listName, newValue)}
                />
                <button className="btn btn-sm btn-primary" onClick={() => handleAdd(listName, newValue)}>
                    Add
                </button>
            </div>

            {items.length === 0 ? (
                <p className="text-muted mb-0">No items</p>
            ) : (
                <ul className="list-group">
                    {items.map((item) => (
                        <li key={item} className="list-group-item d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center flex-grow-1 me-2">
                <span
                    className="me-2 rounded-circle flex-shrink-0"
                    style={{
                        width: 12,
                        height: 12,
                        backgroundColor: dotColor,
                        display: "inline-block",
                    }}
                />
                                <span
                                    className="text-truncate"
                                    style={{ maxWidth: "calc(100% - 50px)" }} // leave space for button
                                    title={item} // show full on hover
                                >
                  {item}
                </span>
                            </div>
                            <button
                                className="btn btn-sm btn-outline-danger"
                                style={{ minWidth: "36px" }}
                                onClick={() => handleRemove(listName, item)}
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
    // Render all
    // --------------------
    return (
        <div
            className="container-fluid p-3"
            style={{ height: "100vh", overflowY: "auto" }}
        >
            <h3 className="mb-2 text-center">History Guard</h3>

            {/* Description */}
            <p className="text-center text-muted mb-4">
                Manage blocked domains and keywords. Any visited sites containing these will be removed from your history automatically.
            </p>

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
        </div>
    );
};

export default HistorySelector;
