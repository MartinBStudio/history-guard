import React, { useEffect, useState } from "react";
import { getChromeAPI } from "../../shared/chromeApi";
// Bootstrap CSS is assumed imported in main entry point

const PopupPage: React.FC = () => {
    const [blockedVisitsCount, setBlockedVisitsCount] = useState(0);

    useEffect(() => {
        const chromeAPI = getChromeAPI();

        chromeAPI.storage.local.get(
            { blockedDomains: [], blockedKeywords: [], blockedVisitsCount: 0 },
            (result) => {
                setBlockedVisitsCount(result.blockedVisitsCount ?? 0);
            }
        );
    }, []);

    const openOptions = () => {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage(); // Chrome API opens options page
        } else {
            window.open("/src/options/index.html", "_blank");
        }
    };

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center p-3"
            style={{ width: 300, height: 200 }}
        >
            <h5 className="mb-3 text-center">Popup Summary</h5>

            <div className="list-group w-100">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                    Removed records
                    <span className="badge bg-primary rounded-pill">{blockedVisitsCount}</span>
                </div>
            </div>

            <button
                className="btn btn-sm btn-outline-primary mt-2"
                onClick={openOptions}
            >
                Options
            </button>
        </div>
    );
};

export default PopupPage;
