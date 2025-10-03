import {Request, Response} from 'express';
import {config} from "./config.js";

export async function handlerReadiness(_: Request, res: Response) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.status(200).send('OK');
}

export async function handlerFileServerHits(_: Request, res: Response) {
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send(`Hits: ${config.fileserverHits}`)
}

export async function handlerReset(_: Request, res: Response) {
    config.fileserverHits = 0;
    res.set('Content-Type', 'text/plain; charset=utf-8');
    res.send("Hits reset to 0!")
}