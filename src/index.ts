import express from "express";
import {
    handlerChirps,
    handlerFileServerHits,
    handlerGetChirpById,
    handlerGetChirps,
    handlerLogin,
    handlerReadiness,
    handlerRefesh,
    handlerReset,
    handlerRevoke,
    handlerUsers,
} from "./handlers.js";
import {errorHandler, middlewareLogResponses, middlewareMetricsInc,} from "./middlewares.js";
import postgres from "postgres";
import {dbConfig} from "./config.js";
import {migrate} from "drizzle-orm/postgres-js/migrator";
import {drizzle} from "drizzle-orm/postgres-js";

const migrationClient = postgres(dbConfig.dbURL, {max: 1});
await migrate(drizzle(migrationClient), dbConfig.migrationConfig);

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use(express.json());
app.use("/app", middlewareMetricsInc);

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerFileServerHits(req, res)).catch(next);
});
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetChirps(req, res)).catch(next);
});
app.get("/api/chirps/:chirpID", (req, res, next) => {
    Promise.resolve(handlerGetChirpById(req, res)).catch(next);
});

app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerChirps(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerUsers(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefesh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevoke(req, res)).catch(next);
});

app.use("/app", express.static("./src/app"));

//This must remain last in the order
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/app`);
});
