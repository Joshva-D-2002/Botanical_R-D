import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import speakeasy from "speakeasy"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                message: "Request body is required",
                error: "MISSING_BODY"
            })
        }

        const { passcode } = req.body as { passcode: string }
        console.log("Request body:", req.body)
        console.log("Received passcode:", passcode)

        if (!passcode) {
            return res.status(400).json({
                message: "Passcode is required",
                error: "MISSING_PASSCODE"
            })
        }

        if (passcode.length !== 6 || !/^\d{6}$/.test(passcode)) {
            return res.status(400).json({
                message: "Passcode must be exactly 6 digits",
                error: "INVALID_PASSCODE_FORMAT"
            })
        }

        if (!req.session) {
            return res.status(401).json({
                message: "Session not found. Please refresh and try again.",
                error: "NO_SESSION"
            })
        }

        const secret = req.session.mfa_admin_secret
        console.log("Session secret exists:", !!secret)

        if (!secret) {
            return res.status(401).json({
                message: "MFA secret not found in session. Please refresh and try again.",
                error: "NO_MFA_SECRET"
            })
        }

        const isVerified = speakeasy.totp.verify({
            secret,
            encoding: "base32",
            token: passcode,
            window: 1,
        })

        console.log("MFA verification result:", isVerified)

        if (!isVerified) {
            return res.status(400).json({
                message: "Invalid or expired MFA code. Please try again.",
                error: "INVALID_MFA_CODE"
            })
        }

        delete req.session.mfa_admin_secret
        await req.session.save()

        return res.status(200).json({
            message: "MFA verification successful",
            success: true
        })

    } catch (error) {
        console.error("Error verifying MFA token:", error)
        return res.status(500).json({
            message: "Internal Server Error",
            error: "INTERNAL_ERROR"
        })
    }
}