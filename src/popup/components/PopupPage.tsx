import React, { useEffect, useState } from "react";
import { getChromeAPI } from "../../shared/chromeApi";
// Make sure Bootstrap CSS is imported in main entry point
// import "bootstrap/dist/css/bootstrap.min.css";

const PopupPage: React.FC = () => {
    const [historyCount, setHistoryCount] = useState(0);
    const [blockedDomainsCount, setBlockedDomainsCount] = useState(0);
    const [blockedKeywordsCount, setBlockedKeywordsCount] = useState(0);

    useEffect(() => {
        const chromeAPI = getChromeAPI();

        chromeAPI.storage.local.get(
            { historyItems: [], blockedDomains: [], blockedKeywords: [] },
            (result) => {
                setHistoryCount(result.historyItems?.length ?? 0);
                setBlockedDomainsCount(result.blockedDomains?.length ?? 0);
                setBlockedKeywordsCount(result.blockedKeywords?.length ?? 0);
            }
        );
    }, []);

    return (
        <div className="d-flex flex-column justify-content-center align-items-center p-3" style={{ width: 300, height: 200 }}>
            <h5 className="mb-3 text-center">Popup Summary</h5>

            <div className="list-group w-100">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                    History
                    <span className="badge bg-primary rounded-pill">{historyCount}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                    Blocked Domains
                    <span className="badge bg-danger rounded-pill">{blockedDomainsCount}</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                    Blocked Keywords
                    <span className="badge bg-warning rounded-pill">{blockedKeywordsCount}</span>
                </div>
            </div>
        </div>
    );
};

export default PopupPage;
