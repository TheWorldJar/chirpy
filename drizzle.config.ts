import {defineConfig} from "drizzle-kit";

export default defineConfig({
    schema: "src/db/schema.ts",
    out: "src/db/output",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgres://postgres:boot.dev@localhost:5432/chirpy?sslmode=disable"
    }
});