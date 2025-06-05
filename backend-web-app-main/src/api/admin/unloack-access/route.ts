import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

const UNLOCKED_USERS = new Set<string>()

export async function POST(req: MedusaRequest, res: MedusaResponse) {
    try {
        const { passcode } = (req as any).body
        const userId = (req as any).auth_context?.actor_id

        if (!userId) {
            return res.status(401).json({
                error: "Authentication required",
                message: "User not authenticated"
            })
        }

        if (!passcode) {
            return res.status(400).json({
                error: "Passcode required",
                message: "Please provide a passcode"
            })
        }

        UNLOCKED_USERS.add(userId)

        console.log(`🔓 User ${userId} has been granted full access`)

        return res.status(200).json({
            success: true,
            message: "Access granted successfully",
            userId: userId
        })

    } catch (error) {
        console.error("Error unlocking access:", error)
        return res.status(500).json({
            error: "Internal server error",
            message: "Failed to process unlock request"
        })
    }
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
    try {
        const userId = (req as any).auth_context?.actor_id

        if (!userId) {
            return res.status(401).json({
                error: "Authentication required"
            })
        }

        const isUnlocked = req.session?.isUnlocked === true

        return res.status(200).json({
            isUnlocked,
            userId
        })
    } catch (error) {
        console.error("Error checking unlock status:", error)
        return res.status(500).json({
            error: "Internal server error"
        })
    }
}

export { UNLOCKED_USERS }