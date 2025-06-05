import {
    defineMiddlewares,
    MedusaNextFunction,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"

const UNLOCKED_USERS = new Set<string>()
const USER_SESSIONS = new Map<string, string>()

const DEFAULT_RESTRICTED_ROUTES = ["admin/unlock-access", "admin/generate-qr", "admin/verify-code"]

export default defineMiddlewares({
    routes: [
        {
            matcher: "/admin/*",
            middlewares: [
                (
                    req: MedusaRequest,
                    res: MedusaResponse,
                    next: MedusaNextFunction
                ) => {
                    console.log("🔍 Checking access for:", req.originalUrl)

                    const allowedEndpoints = [
                        "/admin/users/me",
                        "/admin/auth",
                        "/admin/invites",
                        "/admin/uploads",
                        "/admin/stores",
                        "/admin/regions",
                        "/admin/currencies",
                        "/admin/tax-rates",
                        "/admin/shipping-options",
                        "/admin/payment-providers",
                        "/admin/fulfillment-providers",
                        "/admin/unlock-access",
                        "/admin/generate-qr",
                        "/admin/verify-code"
                    ]

                    const requestPath = req.originalUrl.split('?')[0]
                    const isAllowedEndpoint = allowedEndpoints.some(endpoint =>
                        requestPath.startsWith(endpoint)
                    )

                    if (isAllowedEndpoint) {
                        console.log("Allowing unrestricted endpoint:", requestPath)
                        return next()
                    }

                    const userId = (req as any).auth_context?.actor_id

                    if (!userId) {
                        console.log("No user ID found in auth context")
                        return res.status(401).json({
                            error: "Authentication required",
                            message: "Please log in to access admin resources"
                        })
                    }

                    console.log("User ID:", userId)

                    const currentSessionId = req.headers['x-session-id'] || (req as any).sessionID || 'default-session'
                    const lastSessionId = USER_SESSIONS.get(userId)

                    if (lastSessionId !== currentSessionId) {
                        UNLOCKED_USERS.delete(userId)
                        USER_SESSIONS.set(userId, currentSessionId)
                        console.log(`New session detected for user ${userId} - clearing unlock status`)
                    }

                    const isUnlocked = UNLOCKED_USERS.has(userId)
                    if (isUnlocked) {
                        console.log(`User ${userId} has full access`)
                        return next()
                    }

                    console.log(`Checking restricted access for user: ${userId}`)
                    console.log(`Request: ${req.method} ${req.originalUrl}`)
                    console.log(`Allowed routes:`, DEFAULT_RESTRICTED_ROUTES)

                    const requestMethod = req.method

                    const isRouteAllowed = DEFAULT_RESTRICTED_ROUTES.some(allowedRoute =>
                        requestPath.startsWith(allowedRoute)
                    )


                    if (!isRouteAllowed) {
                        console.log(`Route access denied for ${userId} to ${requestPath}`)
                        return res.status(403).json({
                            error: "Access denied",
                            message: `You don't have permission to access ${requestPath}. Your access is limited to: ${DEFAULT_RESTRICTED_ROUTES.join(', ')}`
                        })
                    }

                    console.log(`Access granted for ${userId} to ${requestMethod} ${requestPath}`)
                    next()
                },
            ],
        },
        {
            matcher: "/admin/unlock-access",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "POST") {
                        const { passcode } = (req as any).body
                        const userId = (req as any).auth_context?.actor_id

                        req.session.userId = userId

                        req.session.save((err) => {
                            if (err) {
                                console.error("Session save failed:", err)
                                return res.status(500).json({ error: "Failed to save session" })
                            }

                            UNLOCKED_USERS.add(userId)
                            console.log(`User ${userId} unlocked via passcode & session`)
                            next()

                            return res.json({ success: true, message: "Access granted" })
                        })

                        return
                    }

                    next()
                },
            ]
        },
        {
            matcher: "/admin/unlock-access",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "GET") {
                        console.log("🔍 Checking unlock status for user:", req.session?.userId || "unknown")
                        return res.json({
                            userId: req.session?.userId || null,
                        })
                    }
                    next()
                },
            ]
        },
        {
            matcher: "/auth/session",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "DELETE") {
                        req.session.userId = null
                        console.log("Hiii I am deleting the session")
                        req.session.save((err) => {
                            if (err) {
                                console.error("Session save failed:", err)
                                return res.status(500).json({ error: "Failed to save session" })
                            }

                            UNLOCKED_USERS.clear()
                            USER_SESSIONS.clear()
                            console.log("User session cleared and access locked")
                            return res.json({ success: true, message: "Session cleared" })
                        })
                        return
                    }

                    next()
                },
            ]
        },
        {
            matcher: "/admin/unlock-access",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "POST") {
                        const { passcode } = (req as any).body
                        const userId = (req as any).auth_context?.actor_id

                        req.session.userId = userId

                        req.session.save((err) => {
                            if (err) {
                                console.error("Session save failed:", err)
                                return res.status(500).json({ error: "Failed to save session" })
                            }

                            UNLOCKED_USERS.add(userId)
                            console.log(`🔓 User ${userId} unlocked via passcode & session`)
                            next()

                            return res.json({ success: true, message: "Access granted" })
                        })

                        return
                    }

                    next()
                },
            ]
        },
    ],
})
