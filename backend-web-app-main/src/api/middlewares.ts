// src/api/middlewares.ts

import {
    defineMiddlewares,
    MedusaNextFunction,
    MedusaRequest,
    MedusaResponse,
} from "@medusajs/framework/http"
export default defineMiddlewares({
    routes: [
        {
            matcher: "/*",
            middlewares: [
                (
                    req: MedusaRequest,
                    res: MedusaResponse,
                    next: MedusaNextFunction
                ) => {

                    // if (!req?.auth_context?.actor_id) {
                    //     return res.redirect('http://localhost:3000/')

                    // }
                    // // console.log("Received a request!", req?.auth_context?.actor_id, req.originalUrl)
                    // // console.log("Received a request", req);
                    // else {
                    //     next()

                    // }
                    return res.redirect('http://localhost:3000/')
                    next()
                },
            ],
        },
    ],
})