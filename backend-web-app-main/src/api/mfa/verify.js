import { Router } from "express";
import speakeasy from "speakeasy";

export default (rootDirectory, options) => {
    const router = Router();

    router.post("/mfa/verify", async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            const { token } = req.body;

            if (!token) {
                return res.status(400).json({ message: "Token is required" });
            }

            const userService = req.scope.resolve("userService");
            const userSecret = await userService.getMfaSecret(userId);

            if (!userSecret) {
                return res.status(400).json({ message: "MFA not setup for user" });
            }

            const isVerified = speakeasy.totp.verify({
                secret: userSecret,
                encoding: "base32",
                token,
                window: 1, // 30 seconds before or after allowed
            });

            if (!isVerified) {
                return res.status(401).json({ message: "Invalid MFA token" });
            }

            // Mark MFA enabled in your system
            await userService.markMfaEnabled(userId);

            res.json({ message: "Your account is now protected with secure MFA." });
        } catch (error) {
            console.error("Error verifying MFA token:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
};
