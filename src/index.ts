import express from "express";
import {handlerFileServerHits, handlerReadiness, handlerReset} from "./handlers.js";
import {middlewareLogResponses, middlewareMetricsInc} from "./middlewares.js";

const app = express();
const PORT = 8080;


app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc);

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerFileServerHits);
app.get("/admin/reset", handlerReset);

app.use("/app", express.static("./src/app"));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/app`);
});