import React, { useEffect, useState } from "react";

const HistorySelector: React.FC = () => {
    const [historyItems, setHistoryItems] = useState<string[]>([]);

    useEffect(() => {
        chrome.storage.local.get({ historyItems: [] }, (result) => {
            const items = result.historyItems as string[];
            setHistoryItems(items);
        });
    }, []);

    return (
        <div style={{ width: 300, height: 200, padding: 20, overflowY: "auto" }}>
            <h1>Selective History</h1>
            {historyItems.length === 0 ? (
                <p>No history yet</p>
            ) : (
                <ul style={{ paddingLeft: 20 }}>
                    {historyItems.map((url, index) => (
                        <li key={index}>
                            <a href={url} target="_blank" rel="noreferrer">{url}</a>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default HistorySelector;

