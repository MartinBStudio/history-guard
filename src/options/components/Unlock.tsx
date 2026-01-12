import { useState } from "react";
import {unlockApp} from "../../shared/chromeApi.ts";

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
        <div className="unlock-container">
            <h2>🔒 App Locked</h2>

            <input
                type="password"
                inputMode="numeric"
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
            />

            {error && <p className="error">{error}</p>}

            <button onClick={handleUnlock}>Unlock</button>
        </div>
    );
}
