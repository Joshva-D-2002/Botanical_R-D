"use client";

import { useState } from 'react';

const MfaVerify = () => {
    const [token, setToken] = useState('');
    const [message, setMessage] = useState('');

    const handleVerify = async () => {
        try {
            const res = await fetch("http://localhost:9000/store/verify", {
                method: "POST",
                credentials: "include",
                headers: {
                    "x-publishable-api-key": "pk_9218f4fc192dd2d776dbaf3193964a045a9ddec476114a6ebb3d4fc3571ee0ce",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.message || "Verification failed")
            }

            setMessage(data.message || "MFA verified successfully!")
        } catch (error: any) {
            setMessage(error.message || "Unexpected error")
        }
    }


    return (
        <div>
            <h1>Verify MFA Token</h1>
            <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter 6-digit code"
            />
            <button onClick={handleVerify}>Verify</button>
            {message && <p>{message}</p>}
        </div>
    );
};

export default MfaVerify;
