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

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log(err);
    switch (err.constructor.name) {
        case "BadRequestError":
            res.status(400).send({error: err.message});
            break;
        case "UnauthorizedError":
            res.status(401).send({error: err.message});
            break;
        case "ForbiddenError":
            res.status(403).send({error: err.message});
            break;
        case "NotFoundError":
            res.status(404).send({error: err.message});
            break;
        default:
            console.error("500 - Internal Server Error", err.message);
    }
}