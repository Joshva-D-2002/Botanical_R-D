// import {
//     defineMiddlewares,
//     MedusaNextFunction,
//     MedusaRequest,
//     MedusaResponse,
// } from "@medusajs/framework/http"

// const UNLOCKED_USERS = new Set<string>()
// const USER_SESSIONS = new Map<string, string>()

// const DEFAULT_RESTRICTED_ROUTES = ["admin/unlock-access", "admin/generate-qr", "admin/verify-code"]

// export default defineMiddlewares({
//     routes: [
//         {
//             matcher: "/admin/*",
//             middlewares: [
//                 (
//                     req: MedusaRequest,
//                     res: MedusaResponse,
//                     next: MedusaNextFunction
//                 ) => {
//                     console.log("🔍 Checking access for:", req.originalUrl)

//                     const allowedEndpoints = [
//                         "/admin/users/me",
//                         "/admin/auth",
//                         "/admin/invites",
//                         "/admin/uploads",
//                         "/admin/stores",
//                         "/admin/regions",
//                         "/admin/currencies",
//                         "/admin/tax-rates",
//                         "/admin/shipping-options",
//                         "/admin/payment-providers",
//                         "/admin/fulfillment-providers",
//                         "/admin/unlock-access",
//                         "/admin/generate-qr",
//                         "/admin/verify-code"
//                     ]

//                     const requestPath = req.originalUrl.split('?')[0]
//                     const isAllowedEndpoint = allowedEndpoints.some(endpoint =>
//                         requestPath.startsWith(endpoint)
//                     )

//                     if (isAllowedEndpoint) {
//                         console.log("Allowing unrestricted endpoint:", requestPath)
//                         return next()
//                     }

//                     const userId = (req as any).auth_context?.actor_id

//                     if (!userId) {
//                         console.log("No user ID found in auth context")
//                         return res.status(401).json({
//                             error: "Authentication required",
//                             message: "Please log in to access admin resources"
//                         })
//                     }

//                     console.log("User ID:", userId)

//                     const currentSessionId = req.headers['x-session-id'] || (req as any).sessionID || 'default-session'
//                     const lastSessionId = USER_SESSIONS.get(userId)

//                     if (lastSessionId !== currentSessionId) {
//                         UNLOCKED_USERS.delete(userId)
//                         USER_SESSIONS.set(userId, currentSessionId)
//                         console.log(`New session detected for user ${userId} - clearing unlock status`)
//                     }

//                     const isUnlocked = UNLOCKED_USERS.has(userId)
//                     if (isUnlocked) {
//                         console.log(`User ${userId} has full access`)
//                         return next()
//                     }

//                     console.log(`Checking restricted access for user: ${userId}`)
//                     console.log(`Request: ${req.method} ${req.originalUrl}`)
//                     console.log(`Allowed routes:`, DEFAULT_RESTRICTED_ROUTES)

//                     const requestMethod = req.method

//                     const isRouteAllowed = DEFAULT_RESTRICTED_ROUTES.some(allowedRoute =>
//                         requestPath.startsWith(allowedRoute)
//                     )


//                     if (!isRouteAllowed) {
//                         console.log(`Route access denied for ${userId} to ${requestPath}`)
//                         return res.status(403).json({
//                             error: "Access denied",
//                             message: `You don't have permission to access ${requestPath}. Your access is limited to: ${DEFAULT_RESTRICTED_ROUTES.join(', ')}`
//                         })
//                     }

//                     console.log(`Access granted for ${userId} to ${requestMethod} ${requestPath}`)
//                     next()
//                 },
//             ],
//         },
//         {
//             matcher: "/admin/unlock-access",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "POST") {
//                         const { passcode } = (req as any).body
//                         const userId = (req as any).auth_context?.actor_id

//                         req.session.userId = userId

//                         req.session.save((err) => {
//                             if (err) {
//                                 console.error("Session save failed:", err)
//                                 return res.status(500).json({ error: "Failed to save session" })
//                             }

//                             UNLOCKED_USERS.add(userId)
//                             console.log(`User ${userId} unlocked via passcode & session`)
//                             next()

//                             return res.json({ success: true, message: "Access granted" })
//                         })

//                         return
//                     }

//                     next()
//                 },
//             ]
//         },
//         {
//             matcher: "/admin/unlock-access",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "GET") {
//                         console.log("🔍 Checking unlock status for user:", req.session?.userId || "unknown")
//                         return res.json({
//                             userId: req.session?.userId || null,
//                         })
//                     }
//                     next()
//                 },
//             ]
//         },
//         {
//             matcher: "/auth/session",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "DELETE") {
//                         req.session.userId = null
//                         console.log("Hiii I am deleting the session")
//                         req.session.save((err) => {
//                             if (err) {
//                                 console.error("Session save failed:", err)
//                                 return res.status(500).json({ error: "Failed to save session" })
//                             }

//                             UNLOCKED_USERS.clear()
//                             USER_SESSIONS.clear()
//                             console.log("User session cleared and access locked")
//                             return res.json({ success: true, message: "Session cleared" })
//                         })
//                         return
//                     }

//                     next()
//                 },
//             ]
//         },
//         {
//             matcher: "/admin/unlock-access",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "POST") {
//                         const { passcode } = (req as any).body
//                         const userId = (req as any).auth_context?.actor_id

//                         req.session.userId = userId

//                         req.session.save((err) => {
//                             if (err) {
//                                 console.error("Session save failed:", err)
//                                 return res.status(500).json({ error: "Failed to save session" })
//                             }

//                             UNLOCKED_USERS.add(userId)
//                             console.log(`🔓 User ${userId} unlocked via passcode & session`)
//                             next()

//                             return res.json({ success: true, message: "Access granted" })
//                         })

//                         return
//                     }

//                     next()
//                 },
//             ]
//         },
//     ],
// })




// import {
//     defineMiddlewares,
//     MedusaNextFunction,
//     MedusaRequest,
//     MedusaResponse,
// } from "@medusajs/framework/http"

// // Define user access rules - map user IDs to their permissions
// const USER_ACCESS_RULES = {
//     // You can map by user ID directly since we have that from auth_context
//     "user_01JWFSMFM8FD3F720VC62BKS9T": {
//         email: "usera@example.com", // For logging purposes
//         allowedRoutes: [
//             "/admin/products",
//             "/admin/collections",
//             "/admin/categories",
//         ],
//         // All product-related endpoints
//         allowedMethods: ["GET", "POST", "PUT", "DELETE"], // Allow all methods for these routes
//         cssClass: "user-usera" // CSS class to add to body
//     },
//     // Add more users by their ID
//     "user_01JWFSN6PP7CNPA58SB6Z1SQ2X": {
//         email: "userb@example.com",
//         allowedRoutes: ["/admin/orders"], 
//         allowedMethods: ["GET"],
//         cssClass: "user-userb" // CSS class to add to body
//     },
// }

// // Unlock system variables
// const UNLOCKED_USERS = new Set<string>()
// const USER_SESSIONS = new Map<string, string>()

// const DEFAULT_RESTRICTED_ROUTES = ["/admin/unlock-access", "/admin/generate-qr", "/admin/verify-code"]

// export default defineMiddlewares({
//     routes: [
//         {
//             matcher: "/admin/*",
//             middlewares: [
//                 (
//                     req: MedusaRequest,
//                     res: MedusaResponse,
//                     next: MedusaNextFunction
//                 ) => {
//                     console.log("🔍 Checking access for:", req.originalUrl);
                    
//                     // Allow certain endpoints without restriction (authentication, user info, etc.)
//                     const allowedEndpoints = [
//                         "/admin/users/me",
//                         "/admin/auth",
//                         "/admin/invites",
//                         "/admin/uploads",
//                         "/admin/store", // Store configuration
//                         "/admin/stores", // Store configuration (alternative)
//                         "/admin/regions", // Basic store data
//                         "/admin/currencies", // Basic store data
//                         "/admin/tax-rates", // Basic store data
//                         "/admin/shipping-options", // Basic store data
//                         "/admin/payment-providers", // Basic store data
//                         "/admin/fulfillment-providers", // Basic store data
//                         "/admin/stock-locations", // Basic store data (fixed typo)
//                         "/admin/price-preferences",
//                         "/admin/unlock-access", // Unlock system endpoints
//                         "/admin/generate-qr",
//                         "/admin/verify-code"
//                     ];
                    
//                     const requestPath = req.originalUrl.split('?')[0];
//                     const isAllowedEndpoint = allowedEndpoints.some(endpoint => 
//                         requestPath.startsWith(endpoint)
//                     );
                    
//                     if (isAllowedEndpoint) {
//                         console.log("✅ Allowing unrestricted endpoint:", requestPath);
//                         return next();
//                     }
                    
//                     // Get user ID from auth_context
//                     const userId = (req as any).auth_context?.actor_id;
                    
//                     if (!userId) {
//                         console.log("❌ No user ID found in auth context");
//                         return res.status(401).json({
//                             error: "Authentication required",
//                             message: "Please log in to access admin resources"
//                         });
//                     }
                    
//                     console.log("👤 User ID:", userId);
                    
//                     // Check session for unlock system
//                     const currentSessionId = req.headers['x-session-id'] || (req as any).sessionID || 'default-session';
//                     const lastSessionId = USER_SESSIONS.get(userId);
                    
//                     if (lastSessionId !== currentSessionId) {
//                         UNLOCKED_USERS.delete(userId);
//                         USER_SESSIONS.set(userId, currentSessionId);
//                         console.log(`🔄 New session detected for user ${userId} - clearing unlock status`);
//                     }
                    
//                     // Check if user is unlocked (bypass all restrictions)
//                     const isUnlocked = UNLOCKED_USERS.has(userId);
//                     if (isUnlocked) {
//                         console.log(`🔓 User ${userId} has full access (unlocked)`);
//                         return next();
//                     }
                    
//                     // Check if user has specific access restrictions
//                     const userRules = USER_ACCESS_RULES[userId];
                    
//                     // For HTML requests (admin panel pages), inject user CSS class
//                     if (req.headers.accept?.includes('text/html') || req.originalUrl === '/admin' || req.originalUrl.startsWith('/admin/app')) {
//                         if (userRules && userRules.cssClass) {
//                             // Set custom headers that can be read by frontend JavaScript
//                             res.setHeader('X-User-Class', userRules.cssClass);
//                             res.setHeader('X-User-Email', userRules.email);
//                             res.setHeader('X-User-ID', userId);
//                             console.log(`🎨 Setting user CSS class: ${userRules.cssClass}`);
//                         }
//                     }
//                     if (!userRules) {
//                         // User not in rules - restrict to default routes (unlock system)
//                         console.log("🔒 User not in access rules - restricting to unlock routes");
                        
//                         const isRouteAllowed = DEFAULT_RESTRICTED_ROUTES.some(allowedRoute =>
//                             requestPath.startsWith(allowedRoute)
//                         );
                        
//                         if (!isRouteAllowed) {
//                             console.log(`❌ Route access denied for ${userId} to ${requestPath}`);
//                             return res.status(403).json({
//                                 error: "Access denied",
//                                 message: `You don't have permission to access ${requestPath}. Your access is limited to: ${DEFAULT_RESTRICTED_ROUTES.join(', ')}`
//                             });
//                         }
                        
//                         console.log(`✅ Access granted for ${userId} to ${req.method} ${requestPath}`);
//                         return next();
//                     }
                    
//                     // User has specific rules - apply them
//                     console.log(`🔒 Checking restricted access for user: ${userRules.email}`);
//                     console.log(`📍 Request: ${req.method} ${req.originalUrl}`);
//                     console.log(`✅ Allowed routes:`, userRules.allowedRoutes);
//                     console.log(`🔧 Allowed methods:`, userRules.allowedMethods);
                    
//                     const requestMethod = req.method;
                    
//                     // Check if the route is allowed
//                     const isRouteAllowed = userRules.allowedRoutes.some(allowedRoute => 
//                         requestPath.startsWith(allowedRoute)
//                     );
                    
//                     // Check if the method is allowed
//                     const isMethodAllowed = userRules.allowedMethods.includes(requestMethod);
                    
//                     if (!isRouteAllowed) {
//                         console.log(`❌ Route access denied for ${userRules.email} to ${requestPath}`);
//                         return res.status(403).json({
//                             error: "Access Denied",
//                             message: `You do not have access to this section. Contact your administrator for permission.`,
//                             details: `Access denied to: ${requestPath}`
//                         });
//                     }
                    
//                     if (!isMethodAllowed) {
//                         console.log(`❌ Method access denied for ${userRules.email} to ${requestMethod} ${requestPath}`);
//                         return res.status(403).json({
//                             error: "Access Denied", 
//                             message: `You do not have permission to perform this action. Contact your administrator.`,
//                             details: `${requestMethod} method not allowed on ${requestPath}`
//                         });
//                     }
                    
//                     console.log(`✅ Access granted for ${userRules.email} to ${requestMethod} ${requestPath}`);
//                     next();
//                 },
//             ],
//         },
//         // Unlock access endpoint (POST)
//         {
//             matcher: "/admin/unlock-access",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "POST") {
//                         const { passcode } = (req as any).body;
//                         const userId = (req as any).auth_context?.actor_id;
                        
//                         if (!userId) {
//                             return res.status(401).json({ error: "Authentication required" });
//                         }
                        
//                         // Here you would typically validate the passcode
//                         // For now, we'll assume any passcode unlocks (you should add validation)
                        
//                         req.session.userId = userId;
                        
//                         req.session.save((err) => {
//                             if (err) {
//                                 console.error("Session save failed:", err);
//                                 return res.status(500).json({ error: "Failed to save session" });
//                             }
                            
//                             UNLOCKED_USERS.add(userId);
//                             console.log(`🔓 User ${userId} unlocked via passcode & session`);
                            
//                             return res.json({ success: true, message: "Access granted" });
//                         });
                        
//                         return;
//                     }
                    
//                     next();
//                 },
//             ]
//         },
//         // Unlock access endpoint (GET) - check unlock status
//         {
//             matcher: "/admin/unlock-access",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "GET") {
//                         const userId = (req as any).auth_context?.actor_id;
//                         console.log("🔍 Checking unlock status for user:", userId || "unknown");
                        
//                         return res.json({
//                             userId: userId || null,
//                             isUnlocked: userId ? UNLOCKED_USERS.has(userId) : false
//                         });
//                     }
//                     next();
//                 },
//             ]
//         },
//         // Session management endpoint
//         {
//             matcher: "/auth/session",
//             middlewares: [
//                 (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
//                     if (req.method === "DELETE") {
//                         const userId = (req as any).auth_context?.actor_id;
                        
//                         req.session.userId = null;
//                         console.log("🗑️ Deleting session for user:", userId);
                        
//                         req.session.save((err) => {
//                             if (err) {
//                                 console.error("Session save failed:", err);
//                                 return res.status(500).json({ error: "Failed to save session" });
//                             }
                            
//                             // Clear unlock status for this specific user
//                             if (userId) {
//                                 UNLOCKED_USERS.delete(userId);
//                                 USER_SESSIONS.delete(userId);
//                             }
                            
//                             console.log("🔒 User session cleared and access locked");
//                             return res.json({ success: true, message: "Session cleared" });
//                         });
//                         return;
//                     }
                    
//                     next();
//                 },
//             ]
//         },
//         // Add a specific route to serve user info for CSS class application
//         {
//             matcher: "/admin/user-info",
//             middlewares: [
//                 (
//                     req: MedusaRequest,
//                     res: MedusaResponse,
//                     next: MedusaNextFunction
//                 ) => {
//                     const userId = (req as any).auth_context?.actor_id;
                    
//                     if (!userId) {
//                         return res.status(401).json({ error: "Not authenticated" });
//                     }
                    
//                     const userRules = USER_ACCESS_RULES[userId];
//                     const isUnlocked = UNLOCKED_USERS.has(userId);
                    
//                     if (userRules) {
//                         return res.json({
//                             cssClass: userRules.cssClass,
//                             email: userRules.email,
//                             userId: userId,
//                             isUnlocked: isUnlocked
//                         });
//                     } else {
//                         return res.json({
//                             cssClass: "user-admin",
//                             email: "admin",
//                             userId: userId,
//                             isUnlocked: isUnlocked
//                         });
//                     }
//                 },
//             ],
//         },
//     ],
// });


import {
    defineMiddlewares,
    MedusaNextFunction,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"

// Define user access rules - map user IDs to their permissions
const USER_ACCESS_RULES = {
    // You can map by user ID directly since we have that from auth_context
    "user_01JWFSMFM8FD3F720VC62BKS9T": {
        email: "usera@example.com", // For logging purposes
        allowedRoutes: [
            "/admin/products",
            "/admin/collections",
        ],
        // All product-related endpoints
        allowedMethods: ["GET", "POST", "PUT", "DELETE"], // Allow all methods for these routes
        cssClass: "user-usera" // CSS class to add to body
    },
    // Add more users by their ID
    "user_01JWFSN6PP7CNPA58SB6Z1SQ2X": {
        email: "userb@example.com",
        allowedRoutes: ["/admin/orders"], 
        allowedMethods: ["GET"],
        cssClass: "user-userb" // CSS class to add to body
    },
}

// Unlock system variables
const UNLOCKED_USERS = new Set<string>()
const USER_SESSIONS = new Map<string, string>()

const DEFAULT_RESTRICTED_ROUTES = ["/admin/unlock-access", "/admin/generate-qr", "/admin/verify-code"]

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
                    
                    // Allow certain endpoints without restriction (authentication, user info, etc.)
                    const allowedEndpoints = [
                        "/admin/users/me",
                        "/admin/auth",
                        "/admin/invites",
                        "/admin/uploads",
                        "/admin/store", // Store configuration
                        "/admin/stores", // Store configuration (alternative)
                        "/admin/regions", // Basic store data
                        "/admin/currencies", // Basic store data
                        "/admin/tax-rates", // Basic store data
                        "/admin/shipping-options", // Basic store data
                        "/admin/payment-providers", // Basic store data
                        "/admin/fulfillment-providers", // Basic store data
                        "/admin/stock-locations", // Basic store data (fixed typo)
                        "/admin/price-preferences",
                        "/admin/unlock-access", // Unlock system endpoints
                        "/admin/generate-qr",
                        "/admin/verify-code",
                        "/admin/users"
                    ];
                    
                    const requestPath = req.originalUrl.split('?')[0];
                    const isAllowedEndpoint = allowedEndpoints.some(endpoint => 
                        requestPath.startsWith(endpoint)
                    );
                    
                    if (isAllowedEndpoint) {
                        console.log("✅ Allowing unrestricted endpoint:", requestPath);
                        return next();
                    }
                    
                    // Get user ID from auth_context
                    const userId = (req as any).auth_context?.actor_id;
                    
                    if (!userId) {
                        console.log("❌ No user ID found in auth context");
                        return res.status(401).json({
                            error: "Authentication required",
                            message: "Please log in to access admin resources"
                        });
                    }
                    
                    console.log("👤 User ID:", userId);
                    
                    // Check if user has specific access restrictions FIRST
                    const userRules = USER_ACCESS_RULES[userId];
                    
                    // For HTML requests (admin panel pages), inject user CSS class
                    if (req.headers.accept?.includes('text/html') || req.originalUrl === '/admin' || req.originalUrl.startsWith('/admin/app')) {
                        if (userRules && userRules.cssClass) {
                            // Set custom headers that can be read by frontend JavaScript
                            res.setHeader('X-User-Class', userRules.cssClass);
                            res.setHeader('X-User-Email', userRules.email);
                            res.setHeader('X-User-ID', userId);
                            console.log(`🎨 Setting user CSS class: ${userRules.cssClass}`);
                        }
                    }
                    
                    // Check session for unlock system (only for users WITHOUT specific rules)
                    const currentSessionId = req.headers['x-session-id'] || (req as any).sessionID || 'default-session';
                    const lastSessionId = USER_SESSIONS.get(userId);
                    
                    if (lastSessionId !== currentSessionId) {
                        UNLOCKED_USERS.delete(userId);
                        USER_SESSIONS.set(userId, currentSessionId);
                        console.log(`🔄 New session detected for user ${userId} - clearing unlock status`);
                    }
                    
                    // Check if user is unlocked (only bypass restrictions for users WITHOUT specific access rules)
                    const isUnlocked = UNLOCKED_USERS.has(userId);
                    if (isUnlocked && !userRules) {
                        console.log(`🔓 User ${userId} has full access (unlocked and no specific rules)`);
                        return next();
                    }
                    
                    if (userRules) {
                        // User has specific rules - apply them FIRST
                        console.log(`🔒 Checking restricted access for user: ${userRules.email}`);
                        console.log(`📍 Request: ${req.method} ${req.originalUrl}`);
                        console.log(`✅ Allowed routes:`, userRules.allowedRoutes);
                        console.log(`🔧 Allowed methods:`, userRules.allowedMethods);
                        
                        const requestMethod = req.method;
                        
                        // Check if the route is allowed
                        const isRouteAllowed = userRules.allowedRoutes.some(allowedRoute => 
                            requestPath.startsWith(allowedRoute)
                        );
                        
                        // Check if the method is allowed
                        const isMethodAllowed = userRules.allowedMethods.includes(requestMethod);
                        
                        if (!isRouteAllowed) {
                            console.log(`❌ Route access denied for ${userRules.email} to ${requestPath}`);
                            return res.status(403).json({
                                error: "Access Denied",
                                message: `You do not have access to this section. Contact your administrator for permission.`,
                                details: `Access denied to: ${requestPath}`
                            });
                        }
                         if (!isMethodAllowed) {
                            console.log(`❌ Method access denied for ${userRules.email} to ${requestMethod} ${requestPath}`);
                            return res.status(403).json({
                                error: "Access Denied", 
                                message: `You do not have permission to perform this action. Contact your administrator.`,
                                details: `${requestMethod} method not allowed on ${requestPath}`
                            });
                        }
                        
                        console.log(`✅ Access granted for ${userRules.email} to ${requestMethod} ${requestPath}`);
                        return next();
                    }
                    
                    // User not in rules - restrict to default routes (unlock system)
                    console.log("🔒 User not in access rules - restricting to unlock routes");
                    
                    const isRouteAllowed = DEFAULT_RESTRICTED_ROUTES.some(allowedRoute =>
                        requestPath.startsWith(allowedRoute)
                    );
                    
                    if (!isRouteAllowed) {
                        console.log(`❌ Route access denied for ${userId} to ${requestPath}`);
                        return res.status(403).json({
                            error: "Access denied",
                            message: `You don't have permission to access ${requestPath}. Your access is limited to: ${DEFAULT_RESTRICTED_ROUTES.join(', ')}`
                        });
                    }
                    
                    console.log(`✅ Access granted for ${userId} to ${req.method} ${requestPath}`);
                    next();
                },
            ],
        },
        // Unlock access endpoint (POST)
        {
            matcher: "/admin/unlock-access",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "POST") {
                        const { passcode } = (req as any).body;
                        const userId = (req as any).auth_context?.actor_id;
                        
                        if (!userId) {
                            return res.status(401).json({ error: "Authentication required" });
                        }
                        
                        // Here you would typically validate the passcode
                        // For now, we'll assume any passcode unlocks (you should add validation)
                        
                        req.session.userId = userId;
                        
                        req.session.save((err) => {
                            if (err) {
                                console.error("Session save failed:", err);
                                return res.status(500).json({ error: "Failed to save session" });
                            }
                            
                            UNLOCKED_USERS.add(userId);
                            console.log(`🔓 User ${userId} unlocked via passcode & session`);
                            
                            return res.json({ success: true, message: "Access granted" });
                        });
                        
                        return;
                    }
                    
                    next();
                },
            ]
        },
        // Unlock access endpoint (GET) - check unlock status
        {
            matcher: "/admin/unlock-access",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "GET") {
                        const userId = req.session.userId;
                        console.log("🔍 Checking unlock status for user:", userId || "unknown");
                        
                        return res.json({
                            userId: userId || null,
                            isUnlocked: userId ? UNLOCKED_USERS.has(userId) : false
                        });
                    }
                    next();
                },
            ]
        },
        // Session management endpoint
        {
            matcher: "/auth/session",
            middlewares: [
                (req: MedusaRequest, res: MedusaResponse, next: MedusaNextFunction) => {
                    if (req.method === "DELETE") {
                        const userId = (req as any).auth_context?.actor_id;
                        
                        req.session.userId = null;
                        console.log("🗑️ Deleting session for user:", userId);
                        
                        req.session.save((err) => {
                            if (err) {
                                console.error("Session save failed:", err);
                                return res.status(500).json({ error: "Failed to save session" });
                            }
                            
                            // Clear unlock status for this specific user
                            if (userId) {
                                UNLOCKED_USERS.delete(userId);
                                USER_SESSIONS.delete(userId);
                            }
                            
                            console.log("🔒 User session cleared and access locked");
                            return res.json({ success: true, message: "Session cleared" });
                        });
                        return;
                    }
                    
                    next();
                },
            ]
        },
        // Add a specific route to serve user info for CSS class application
        {
            matcher: "/admin/user-info",
            middlewares: [
                (
                    req: MedusaRequest,
                    res: MedusaResponse,
                    next: MedusaNextFunction
                ) => {
                    const userId = (req as any).auth_context?.actor_id;
                    
                    if (!userId) {
                        return res.status(401).json({ error: "Not authenticated" });
                    }
                    
                    const userRules = USER_ACCESS_RULES[userId];
                    const isUnlocked = UNLOCKED_USERS.has(userId);
                    
                    if (userRules) {
                        return res.json({
                            cssClass: userRules.cssClass,
                            email: userRules.email,
                            userId: userId,
                            isUnlocked: isUnlocked
                        });
                    } else {
                        return res.json({
                            cssClass: "user-admin",
                            email: "admin",
                            userId: userId,
                            isUnlocked: isUnlocked
                        });
                    }
                },
            ],
        },
    ],
});
 
