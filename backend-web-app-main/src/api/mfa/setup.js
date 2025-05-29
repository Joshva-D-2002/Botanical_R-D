import { Router } from "express";
import speakeasy from "speakeasy";
import QRCode from "qrcode";

export default (rootDirectory, options) => {
    const router = Router();

    // GET /mfa/setup - Generate MFA secret & QR code
    router.get("/mfa/setup", async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }

            // Generate TOTP secret for user
            const secret = speakeasy.generateSecret({
                name: `YourAppName (${userId})`,
            });

            // Store secret in your user service / database
            const userService = req.scope.resolve("userService");
            await userService.setMfaSecret(userId, secret.base32);

            // Generate QR code image URL
            const qrCodeImageUrl = await QRCode.toDataURL(secret.otpauth_url);

            res.json({ qrCodeImageUrl });
        } catch (error) {
            console.error("Error generating MFA QR code:", error);
            res.status(500).json({ message: "Internal Server Error" });
        }
    });

    return router;
};
