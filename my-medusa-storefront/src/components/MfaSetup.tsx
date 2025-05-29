"use client";

import { useState } from 'react';

const MfaSetup = () => {
    const [qrCodeImageUrl, setQrCodeImageUrl] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const generateMfaSecret = async () => {
        setLoading(true)
        try {
            const res = await fetch("http://localhost:9000/store/setup", {
                method: "GET",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": "pk_9218f4fc192dd2d776dbaf3193964a045a9ddec476114a6ebb3d4fc3571ee0ce",
                    "Content-Type": "application/json",
                },
            })

            if (!res.ok) {
                throw new Error("Failed to fetch QR code")
            }

            const data = await res.json()
            setQrCodeImageUrl(data.qrCodeImageUrl)
            setSecret(data.secret)
        } catch (err: any) {
            alert(err.message || "Unexpected error")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div>
            <h1>Set Up Multi-Factor Authentication</h1>
            <button onClick={generateMfaSecret}>Generate MFA QR Code</button>
            {qrCodeImageUrl && <img src={qrCodeImageUrl} alt="Scan this QR code with your Authenticator app" />}
        </div>
    );
};
export default MfaSetup;
