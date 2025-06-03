import {
    defineMiddlewares,
    MedusaNextFunction,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"

const UNLOCKED_USERS = new Set<string>()
const USER_SESSIONS = new Map<string, string>()

const USER_ACCESS_RULES = {
    "user_01JVMJ9ZC2Z58A3HRMM5QDS5T8": {
        email: "adminbotanical@gmail.com",
        allowedRoutes: [
            "/app/access",
            "/app/orders"
        ],
        allowedMethods: ["GET", "POST"],
        redirectToCustom: true
    },
}

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
                console.log("🔍 Checking access for:", req.originalUrl);

                const allowedEndpoints = [
                    "/admin/users/me",
                    "/admin/auth",
                    "/admin/invites",
                    "/admin/uploads",
                    "/admin/store",
                    "/admin/regions",
                    "/admin/currencies",
                    "/admin/tax-rates",
                    "/admin/shipping-options",
                    "/admin/payment-providers",
                    "/admin/fulfillment-providers",
                    "/admin/unlock-access",
                ];

                const requestPath = req.originalUrl.split('?')[0];
                const isAllowedEndpoint = allowedEndpoints.some(endpoint =>
                    requestPath.startsWith(endpoint)
                );

                if (isAllowedEndpoint) {
                    console.log("✅ Allowing unrestricted endpoint:", requestPath);
                    return next();
                }

                const userId = (req as any).auth_context?.actor_id;

                if (!userId) {
                    console.log("❌ No user ID found in auth context");
                    return res.status(401).json({
                        error: "Authentication required",
                        message: "Please log in to access admin resources"
                    });
                }

                console.log("👤 User ID:", userId);

                const userRules = USER_ACCESS_RULES[userId];

                if (!userRules) {
                    console.log("✅ User not in access rules - allowing full admin access");
                    return next();
                }

                const currentSessionId = req.headers['x-session-id'] || (req as any).sessionID || 'default-session';
                const lastSessionId = USER_SESSIONS.get(userId);

                if (lastSessionId !== currentSessionId) {
                    UNLOCKED_USERS.delete(userId);
                    USER_SESSIONS.set(userId, currentSessionId);
                    console.log(`🔄 New session detected for ${userRules.email} - clearing unlock status`);
                }

                const isUnlocked = UNLOCKED_USERS.has(userId);
                if (isUnlocked) {
                    console.log(`🔓 User ${userRules.email} has full access (unlocked in current session)`);
                    return next();
                }

                if (!requestPath.startsWith("/app/access")) {
                    console.log(`🔄 Redirecting ${userRules.email} to passcode verification from ${requestPath}`);
                    return res.redirect("/app/access");
                }

                console.log(`🔒 Checking restricted access for user: ${userRules.email}`);
                console.log(`📍 Request: ${req.method} ${req.originalUrl}`);
                console.log(`✅ Allowed routes:`, userRules.allowedRoutes);
                console.log(`🔧 Allowed methods:`, userRules.allowedMethods);

                const requestMethod = req.method;

                const isRouteAllowed = userRules.allowedRoutes.some(allowedRoute =>
                    requestPath.startsWith(allowedRoute)
                );

                const isMethodAllowed = userRules.allowedMethods.includes(requestMethod);

                if (!isRouteAllowed) {
                    console.log(`❌ Route access denied for ${userRules.email} to ${requestPath}`);
                    return res.status(403).json({
                        error: "Access denied",
                        message: `You don't have permission to access ${requestPath}. Your access is limited to: ${userRules.allowedRoutes.join(', ')}`
                    });
                }

                if (!isMethodAllowed) {
                    console.log(`❌ Method access denied for ${userRules.email} to ${requestMethod} ${requestPath}`);
                    return res.status(403).json({
                        error: "Access denied",
                        message: `You don't have permission to use ${requestMethod} method. Allowed methods: ${userRules.allowedMethods.join(', ')}`
                    });
                }

                console.log(`✅ Access granted for ${userRules.email} to ${requestMethod} ${requestPath}`);
                next();
            },
        ],
    },
    {
        matcher: "/admin/unlock-access",
        middlewares: [
            (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                if (req.method === "POST") {
                    const { passcode } = (req as any).body;
                    const userId = (req as any).auth_context?.actor_id;

                    if (passcode === "1234" && userId) {
                        UNLOCKED_USERS.add(userId);
                        console.log(`🔓 User ${userId} unlocked via passcode`);
                        return res.json({ success: true, message: "Access granted" });
                    }

                    return res.status(403).json({ error: "Invalid passcode" });
                }

                next();
            },
        ],
    },
    ],
});














// import {
//   defineMiddlewares,
//   MedusaNextFunction,
//   MedusaRequest,
//   MedusaResponse,
// } from "@medusajs/framework/http"

// // All users must unlock to access restricted admin routes
// const UNLOCKED_USERS = new Set<string>()
// const USER_SESSIONS = new Map<string, string>()

// // Global rule applied to ALL users (could be expanded to be dynamic)
// const ACCESS_CONTROL = {
//   allowedRoutes: ["/app/access"],
//   allowedMethods: ["GET", "POST"],
//   redirectToCustom: true,
// }

// export default defineMiddlewares({
//   routes: [
//     {
//       matcher: "/admin/*",
//       middlewares: [
//         async (
//           req: MedusaRequest,
//           res: MedusaResponse,
//           next: MedusaNextFunction
//         ) => {
//           console.log("🔍 Checking access for:", req.originalUrl)

//           const allowedEndpoints = [
//             "/admin/users/me",
//             "/admin/auth",
//             "/admin/invites",
//             "/admin/uploads",
//             "/admin/store",
//             "/admin/regions",
//             "/admin/currencies",
//             "/admin/tax-rates",
//             "/admin/shipping-options",
//             "/admin/payment-providers",
//             "/admin/fulfillment-providers",
//             "/admin/unlock-access",
//           ]

//           const requestPath = req.originalUrl.split("?")[0]
//           const isAllowedEndpoint = allowedEndpoints.some((endpoint) =>
//             requestPath.startsWith(endpoint)
//           )

//           if (isAllowedEndpoint) {
//             console.log("✅ Allowing unrestricted endpoint:", requestPath)
//             return next()
//           }

//           const userEmail = (req as any).auth_context?.actor_idF

//           if (!userEmail) {
//             console.log("❌ No email found in auth context")
//             return res.status(401).json({
//               error: "Authentication required",
//               message: "Please log in to access admin resources",
//             })
//           }

//           console.log("👤 Authenticated user:", userEmail)

//           // Track session
//           const currentSessionId =
//             req.headers["x-session-id"] || req.sessionID || "default-session"
//           const lastSessionId = USER_SESSIONS.get(userEmail)

//           if (lastSessionId !== currentSessionId) {
//             UNLOCKED_USERS.delete(userEmail)
//             USER_SESSIONS.set(userEmail, currentSessionId)
//             console.log(`🔄 New session detected for ${userEmail} - resetting unlock status`)
//           }

//           const isUnlocked = UNLOCKED_USERS.has(userEmail)

//           if (isUnlocked) {
//             console.log(`🔓 User ${userEmail} has unlocked access`)
//             return next()
//           }

//           // Force passcode check if not yet unlocked
//           if (!requestPath.startsWith("/app/access")) {
//             console.log(`🔄 Redirecting ${userEmail} to /app/access for passcode verification`)
//             return res.redirect("/app/access")
//           }

//           // Check if allowed while still locked
//           const requestMethod = req.method
//           const isRouteAllowed = ACCESS_CONTROL.allowedRoutes.some((allowedRoute) =>
//             requestPath.startsWith(allowedRoute)
//           )
//           const isMethodAllowed = ACCESS_CONTROL.allowedMethods.includes(requestMethod)

//           if (!isRouteAllowed || !isMethodAllowed) {
//             return res.status(403).json({
//               error: "Access denied",
//               message: `Access is restricted until you unlock with the correct passcode.`,
//             })
//           }

//           console.log(`✅ Temporarily allowing access to ${requestPath} (${requestMethod})`)
//           next()
//         },
//       ],
//     },
//     {
//       matcher: "/admin/unlock-access",
//       middlewares: [
//         (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//           if (req.method === "POST") {
//             const { passcode } = req.body
//             const userEmail = (req as any).auth_context?.auth_id

//             if (passcode === "1234" && userEmail) {
//               UNLOCKED_USERS.add(userEmail)
//               console.log(`🔓 User ${userEmail} unlocked via passcode`)
//               return res.json({ success: true, message: "Access granted" })
//             }

//             return res.status(403).json({ error: "Invalid passcode" })
//           }

//           next()
//         },
//       ],
//     },
//   ],
// })



