import Medusa from "@medusajs/js-sdk"

export let MEDUSA_BACKEND_URL = "http://localhost:9000"

if (process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL) {
    MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL
}

export const sdk = new Medusa({
    baseUrl: MEDUSA_BACKEND_URL,
    debug: process.env.NODE_ENV === "development",
    publishableKey: "pk_9218f4fc192dd2d776dbaf3193964a045a9ddec476114a6ebb3d4fc3571ee0ce",
    auth: {
        type: "jwt",
    },
})