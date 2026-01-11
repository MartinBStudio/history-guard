import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getList, addToList, removeFromList } from "../../shared/chromeApi";

const HistorySelector: React.FC = () => {
    const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
    const [blockedKeywords, setBlockedKeywords] = useState<string[]>([]);

    const [newDomain, setNewDomain] = useState("");
    const [newKeyword, setNewKeyword] = useState("");

    // Load all lists
    const loadAll = async () => {
        setBlockedDomains(await getList("blockedDomains"));
        setBlockedKeywords(await getList("blockedKeywords"));
    };

    useEffect(() => {
        loadAll();
    }, []);

    // Add handlers
    const handleAdd = async (listName: "blockedDomains" | "blockedKeywords", value: string) => {
        if (!value) return;
        await addToList(listName, value);
        await loadAll();

        if (listName === "blockedDomains") setNewDomain("");
        if (listName === "blockedKeywords") setNewKeyword("");
    };

    const handleRemove = async (listName: "blockedDomains" | "blockedKeywords", value: string) => {
        await removeFromList(listName, value);
        await loadAll();
    };



    const renderList = (
        title: string,
        items: string[],
        dotColor: string,
        listName: "blockedDomains" | "blockedKeywords",
        newValue: string,
        setNewValue: React.Dispatch<React.SetStateAction<string>>,
        showAddInput = true,
        showRemove = true,
        showBlockButton = false
    ) => (
        <div className={showAddInput ? "col-md-4 mb-3" : "col-12 mb-3"}>
            <h5>{title}</h5>

            {showAddInput && (
                <div className="input-group mb-2">
                    <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder={`Add ${title}`}
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAdd(listName, newValue)}
                    />
                    <button className="btn btn-sm btn-primary" onClick={() => handleAdd(listName, newValue)}>Add</button>
                </div>
            )}

            {items.length === 0 ? (
                <p className="text-muted">No items</p>
            ) : (
                <ul className="list-group">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="list-group-item d-flex align-items-center justify-content-between"
                        >
                            <div className="d-flex align-items-center">
                                <span
                                    className="me-2 rounded-circle"
                                    style={{ width: "10px", height: "10px", backgroundColor: dotColor, display: "inline-block" }}
                                />
                                <span className="text-truncate" style={{ maxWidth: "300px" }}>{item}</span>
                            </div>
                            {showRemove && !showBlockButton && (
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={() => handleRemove(listName, item)}
                                >
                                    &times;
                                </button>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="container-fluid p-3" style={{ height: "100vh", overflowY: "auto" }}>
            <h3 className="mb-4 text-center">Selective History</h3>
            {/* Two blocked lists below */}
            <div className="row mt-4">
                {renderList("Blocked Domains", blockedDomains, "#dc3545", "blockedDomains", newDomain, setNewDomain)}
                {renderList("Blocked Keywords", blockedKeywords, "#ffc107", "blockedKeywords", newKeyword, setNewKeyword)}
            </div>
        </div>
    );
};

export default HistorySelector;
