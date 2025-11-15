import {Request, Response} from "express";
import {config} from "./config.js";
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from "./errortypes.js";
import {createUser, getUserbyEmail, resetUsers} from "./db/queries/users.js";
import {createChirp, getAllChirps, getChirpById} from "./db/queries/chirps.js";
import {checkPasswordHash, hashPassword} from "./auth.js";
import {UserResponse} from "./db/schema.js";

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
    if (config.platform !== "dev") {
        throw new ForbiddenError("Platform not in dev mode");
    }
    config.fileserverHits = 0;
    await resetUsers();
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send(`Hits reset to ${config.fileserverHits}!\nUsers reset!`);
}

export async function handlerChirps(req: Request, res: Response) {
    type parameters = {
        body: string;
        userId?: string;
        email?: string;
    }

    const params: parameters = req.body;
    if (params.body.length > 140) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
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
        if (params.userId) {
            const chirp = await createChirp(body, params.userId);
            res.status(201).send(chirp);
        } else if (params.email) {
            const [user] = await getUserbyEmail(params.email);
            const chirp = await createChirp(body, user.id);
            res.status(201).send(chirp);
        } else {
            throw new BadRequestError("User/Email not found");
        }
    }
}

export async function handlerUsers(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    }
    const params: parameters = req.body;
    if (params.email && params.password) {
        const result = await createUser({email: params.email, hashedPassword: await hashPassword(params.password)});
        const {hashedPassword, ...response} = result;
        res.status(201).send(response);
    } else {
        throw new BadRequestError("No Email Found");
    }
}

export async function handlerLogin(req: Request, res: Response) {
    type parameters = {
        email: string;
        password: string;
    }
    const params: parameters = req.body;
    try {
        const [user] = await getUserbyEmail(params.email);
        const validPass = await checkPasswordHash(params.password, user.hashedPassword);
        if (validPass) {
            const {hashedPassword, ...response} = user;
            res.status(200).send(response as UserResponse);
        } else {
            throw new Error();
        }
    } catch (error) {
        throw new UnauthorizedError("Incorrect email or password");
    }
}

export async function handlerGetChirps(req: Request, res: Response) {
    const chirps = await getAllChirps();
    res.status(200).send(chirps);
}

export async function handlerGetChirpById(req: Request, res: Response) {
    if (req.params.chirpID) {
        const [chirp] = await getChirpById(req.params.chirpID);
        if (!chirp.body) {
            throw new NotFoundError("Chirp not found");
        }
        res.status(200).send(chirp);
    } else {
        throw new BadRequestError("Invalid chirp id");
    }
}