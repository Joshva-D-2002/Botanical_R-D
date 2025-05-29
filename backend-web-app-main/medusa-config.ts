import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      authCors: "http://localhost:3000,http://127.0.0.1:3000",
      storeCors: "http://localhost:3000,http://127.0.0.1:3000",
      adminCors: "http://localhost:3000,http://127.0.0.1:3000",
    }
  },
  modules: [
    {
      resolve: "./src/modules/brand",
    },
  ],

})
