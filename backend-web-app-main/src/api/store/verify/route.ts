import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import speakeasy from "speakeasy"

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  try {
    const { token } = req.body as { token: string }
    const secret = req.session.mfa_secret

    if (!token || !secret) {
      return res.status(400).json({ message: "Token or session secret missing" })
    }

    const isVerified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    })

    if (!isVerified) {
      return res.status(401).json({ message: "Invalid MFA token" })
    }

    delete req.session.mfa_secret
    await req.session.save()

    return res.status(200).json({
      message: "Your account is now protected with secure MFA.",
    })
  } catch (error) {
    console.error("Error verifying MFA token:", error)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}
