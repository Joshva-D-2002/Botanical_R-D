import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import speakeasy from "speakeasy"
import QRCode from "qrcode"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        const secret = speakeasy.generateSecret({
            name: `Botanical`,
        })

        const qrCodeImageUrl = await QRCode.toDataURL(secret.otpauth_url)

        req.session.mfa_secret = secret.base32
        await req.session.save() // important to persist

        return res.status(200).json({
            qrCodeImageUrl,
        })
    } catch (error) {
        console.error("Failed to generate MFA QR code:", error)
        return res.status(500).json({ message: "Internal Server Error" })
    }
}
