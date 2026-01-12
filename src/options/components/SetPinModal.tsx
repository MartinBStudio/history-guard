import { useState } from "react";
import {setAppPin} from "../../shared/chromeApi.ts";

type Props = {
    onSuccess?: () => void;
};

export default function SetPinModal({ onSuccess }: Props) {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const reset = () => {
        setPin("");
        setConfirmPin("");
        setError("");
        setLoading(false);
    };

    const handleSubmit = async () => {
        if (!pin || !confirmPin) {
            setError("Please enter PIN in both fields");
            return;
        }

        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        setLoading(true);
        await setAppPin(pin);
        setLoading(false);

        reset();
        onSuccess?.();

        // Close bootstrap modal manually
        const modalEl = document.getElementById("setPinModal");
        if (modalEl) {
            const modal =
                (window as any).bootstrap.Modal.getInstance(modalEl);
            modal?.hide();
        }
    };

    return (
        <div
            className="modal fade"
            id="setPinModal"
            tabIndex={-1}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Set PIN</h5>
                        <button
                            type="button"
                            className="btn-close"
                            data-bs-dismiss="modal"
                        />
                    </div>

                    <div className="modal-body">
                        <input
                            type="password"
                            inputMode="numeric"
                            className="form-control mb-2"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />

                        <input
                            type="password"
                            inputMode="numeric"
                            className="form-control"
                            placeholder="Confirm PIN"
                            value={confirmPin}
                            onChange={(e) =>
                                setConfirmPin(e.target.value)
                            }
                        />

                        {error && (
                            <div className="text-danger mt-2">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Set PIN"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
