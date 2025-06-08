// import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
// import speakeasy from "speakeasy"
// import QRCode from "qrcode"

// export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
//     try {
//         const secret = speakeasy.generateSecret({
//             name: `Botanical-Backend`,
//         })

//         const qrCodeImageUrl = await QRCode.toDataURL(secret.otpauth_url)

//         req.session.mfa_admin_secret = secret.base32
//         await req.session.save()

//         return res.status(200).json({
//             qrCodeImageUrl,
//         })
//     } catch (error) {
//         console.error("Failed to generate MFA QR code:", error)
//         return res.status(500).json({ message: "Internal Server Error" })
//     }
// }


import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import speakeasy from "speakeasy"
import QRCode from "qrcode"

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    try {
        // Ensure session exists
        if (!req.session) {
            return res.status(500).json({ 
                message: "Session not available",
                error: "NO_SESSION" 
            })
        }

        const secret = speakeasy.generateSecret({
            name: `Botanical-Backend`,
            length: 32, // Specify length for consistency
        })

        const qrCodeImageUrl = await QRCode.toDataURL(secret.otpauth_url)

        // Store the secret in session
        req.session.mfa_admin_secret = secret.base32
        
        // Explicitly save the session and wait for it
        await new Promise((resolve, reject) => {
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err)
                    reject(err)
                } else {
                    resolve(true)
                }
            })
        })

        console.log("Secret stored in session:", !!req.session.mfa_admin_secret)

        return res.status(200).json({
            qrCodeImageUrl,
        })
    } catch (error) {
        console.error("Failed to generate MFA QR code:", error)
        return res.status(500).json({ 
            message: "Internal Server Error",
            error: "GENERATION_FAILED"
        })
    }
}