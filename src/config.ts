process.loadEnvFile();
import type {MigrationConfig} from "drizzle-orm/xata-http/migrator";

type APIConfig = {
    fileserverHits: number;
    platform: string;
    secret: string;
};

type DBConfig = {
    dbURL: string;
    migrationConfig: MigrationConfig;
}

function envOrThrow(key: string) {
    if (process.env[key]) {
        return process.env[key];
    } else {
        throw new Error(`Unknown environment key: ${key}`);
    }
}

export const config: APIConfig = {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
    secret: envOrThrow("SECRET"),
};

export const dbConfig: DBConfig = {
    dbURL: envOrThrow("DB_URL"),
    migrationConfig: {migrationsFolder: envOrThrow("OUT_FOLDER")},
};