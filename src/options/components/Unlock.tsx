import { useState } from "react";
import { unlockApp } from "../../shared/chromeApi";

type Props = {
    onUnlocked: () => void;
};

export default function Unlock({ onUnlocked }: Props) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");

    const handleUnlock = async () => {
        if (!pin) return;

        const success = await unlockApp(pin);

        if (success) {
            setError("");
            onUnlocked();
        } else {
            setError("Invalid PIN");
            setPin("");
        }
    };

    return (
        <div className="unlock-page">
            <div className="unlock-card">
                <h4 className="text-center mb-3">🔒 App Locked</h4>

                <input
                    type="password"
                    inputMode="numeric"
                    className="form-control text-center mb-2"
                    placeholder="Enter PIN"
                    value={pin}
                    autoFocus
                    onChange={(e) => setPin(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                />

                {error && (
                    <div className="text-danger text-center mb-2">{error}</div>
                )}

                <button
                    className="btn btn-primary w-100"
                    onClick={handleUnlock}
                    disabled={!pin}
                >
                    Unlock
                </button>
            </div>
        </div>
    );
}
