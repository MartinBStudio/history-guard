

import { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import { setAppPin } from "../../shared/chromeApi";

type Props = {
    show: boolean;
    onClose: () => void;
    onSuccess?: () => void;
};

export default function SetPinModal({ show, onClose, onSuccess }: Props) {
    const modalRef = useRef<HTMLDivElement>(null);
    const modalInstance = useRef<Modal | null>(null);

    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (!modalRef.current) return;

        modalInstance.current ??= new Modal(modalRef.current, {
            backdrop: "static",
            keyboard: false,
        });

        show ? modalInstance.current.show() : modalInstance.current.hide();
    }, [show]);

    const handleSave = async () => {
        if (pin.length < 4) {
            setError("PIN must be at least 4 digits");
            return;
        }

        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        await setAppPin(pin);
        setPin("");
        setConfirmPin("");
        setError("");

        onSuccess?.();
        onClose();
    };

    return (
        <div
            ref={modalRef}
            className="modal fade"
            tabIndex={-1}
            aria-hidden="true"
        >
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Set PIN</h5>
                        <button className="btn-close" onClick={onClose} />
                    </div>

                    <div className="modal-body">
                        <input
                            type="password"
                            className="form-control mb-2"
                            placeholder="Enter PIN"
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                        />
                        <input
                            type="password"
                            className="form-control"
                            placeholder="Confirm PIN"
                            value={confirmPin}
                            onChange={(e) => setConfirmPin(e.target.value)}
                        />

                        {error && <p className="text-danger mt-2">{error}</p>}
                    </div>

                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button className="btn btn-primary" onClick={handleSave}>
                            Save PIN
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

