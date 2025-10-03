import {NextFunction, Request, Response} from 'express';
import {config} from "./config.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const status = res.statusCode;
        if (status !== 200) {
            console.log(`[NON-OK] ${req.method} ${req.originalUrl} - Status: ${status}`);
        }
    });
    next();
}

export function middlewareMetricsInc(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        config.fileserverHits++;
        console.log(`Hits: ${config.fileserverHits}`);
    });
    next();
}