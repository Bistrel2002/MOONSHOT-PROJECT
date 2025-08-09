import { ENV } from "./src/config/env.js";

export default {
    schema: "./src/db/schema.js",
    out: "./src/db/migrations",
    dialect: "postgresql",
    driver: "neon-http",
    dbCredentials: { 
        connectionString: ENV.DATABASE_URL 
    }
}