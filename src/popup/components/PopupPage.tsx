import React, { useEffect, useState } from "react";
import { getChrome } from "../../shared/chromeApi";

// Bootstrap CSS is assumed to be imported in the main entry point

const PopupPage: React.FC = () => {
    const [blockedVisitsCount, setBlockedVisitsCount] = useState<number>(0);

    useEffect(() => {
        const chromeAPI = getChrome();

        // Initial load
        chromeAPI.storage.local.get(
            { blockedVisitsCount: 0 },
            (result) => {
                setBlockedVisitsCount(
                    typeof result.blockedVisitsCount === "number"
                        ? result.blockedVisitsCount
                        : 0
                );
            }
        );

        // Live updates
        const handleStorageChange = (
            changes: Record<string, chrome.storage.StorageChange>,
            areaName: string
        ) => {
            if (areaName !== "local") return;

            if (changes.blockedVisitsCount) {
                setBlockedVisitsCount(
                    Number(changes.blockedVisitsCount.newValue ?? 0)
                );
            }
        };

        chromeAPI.storage.onChanged.addListener(handleStorageChange);

        return () => {
            chromeAPI.storage.onChanged.removeListener(handleStorageChange);
        };
    }, []);

    const openOptions = () => {
        if (chrome.runtime?.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open("/src/options/index.html", "_blank");
        }
    };

    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center p-3"
            style={{ width: 300, height: 200 }}
        >
            <h6 className="mb-3 text-center">History Guard</h6>

            <div className="list-group w-100">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                    Removed records
                    <span className="badge bg-primary rounded-pill">
                        {blockedVisitsCount}
                    </span>
                </div>
            </div>

            <button
                className="btn btn-sm btn-outline-primary mt-3"
                onClick={openOptions}
            >
                Options
            </button>
        </div>
    );
};

export default PopupPage;
