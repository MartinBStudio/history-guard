import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getChromeAPI } from "../../shared/chromeApi";

const HistorySelector: React.FC = () => {
    const [historyItems, setHistoryItems] = useState<string[]>([]);
    const [blockedDomains, setBlockedDomains] = useState<string[]>([]);
    const [blockedKeywords, setBlockedKeywords] = useState<string[]>([]);

    useEffect(() => {
        const chromeAPI = getChromeAPI();

        chromeAPI.storage.local.get(
            { historyItems: [], blockedDomains: [], blockedKeywords: [] },
            (result) => {
                setHistoryItems(result.historyItems ?? []);
                setBlockedDomains(result.blockedDomains ?? []);
                setBlockedKeywords(result.blockedKeywords ?? []);
            }
        );
    }, []);

    const renderList = (title: string, items: string[], dotColor: string) => (
        <div className="col-md-4 mb-3">
            <h5>{title}</h5>
            {items.length === 0 ? (
                <p className="text-muted">No items</p>
            ) : (
                <ul className="list-group">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="list-group-item d-flex align-items-center"
                        >
                            {/* Colored dot */}
                            <span
                                className={`me-2 rounded-circle`}
                                style={{
                                    width: "10px",
                                    height: "10px",
                                    backgroundColor: dotColor,
                                    display: "inline-block",
                                }}
                            ></span>

                            <a
                                href={item}
                                target="_blank"
                                rel="noreferrer"
                                className="text-truncate"
                                style={{ maxWidth: "100%" }}
                            >
                                {item}
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    return (
        <div className="container-fluid p-3" style={{ height: "100vh", overflowY: "auto" }}>
            <h3 className="mb-4 text-center">Selective History</h3>
            <div className="row">
                {renderList("History", historyItems, "#0d6efd")} {/* Bootstrap primary */}
                {renderList("Blocked Domains", blockedDomains, "#dc3545")} {/* Bootstrap danger */}
                {renderList("Blocked Keywords", blockedKeywords, "#ffc107")} {/* Bootstrap warning */}
            </div>
        </div>
    );
};

export default HistorySelector;
