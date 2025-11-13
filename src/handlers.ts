import {Request, Response} from "express";
import {config} from "./config.js";

export async function handlerReadiness(_: Request, res: Response) {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.status(200).send("OK");
}

export async function handlerFileServerHits(_: Request, res: Response) {
    res.set("Content-Type", "text/html; charset=utf-8");
    res.send(`<html lang="en">
        <body>
            <h1>Welcome, Chirpy Admin</h1>
    <p>Chirpy has been visited ${config.fileserverHits} times!</p>
    </body>
    </html>`);
}

export async function handlerReset(_: Request, res: Response) {
    config.fileserverHits = 0;
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits reset to ${config.fileserverHits}!`);
}

export async function handlerValidateChirp(req: Request, res: Response) {
    type parameters = {
        body: string;
    }

    try {
        const params: parameters = req.body;
        if (params.body.length > 140) {
            res.status(400).send(JSON.stringify({"error": "Chirp is too long"}));
        } else {
            let body = params.body;
            const profaneWords = ["Kerfuffle", "Sharbert", "Fornax"];
            for (let i = 0; i < profaneWords.length; i++) {
                if (body.includes(profaneWords[i])) {
                    const words = body.split(profaneWords[i]);
                    body = words.join("****");
                }
                if (body.includes(profaneWords[i].toLowerCase())) {
                    const words = body.split(profaneWords[i].toLowerCase());
                    body = words.join("****");
                }
                if (body.includes(profaneWords[i].toUpperCase())) {
                    const words = body.split(profaneWords[i].toUpperCase());
                    body = words.join("****");
                }
            }
            res.status(200).send(JSON.stringify({"cleanedBody": body}));
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(JSON.stringify({"error": "Invalid JSON"}));
    }
}