import {Request, Response} from "express";
import {config} from "./config.js";
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from "./errortypes.js";
import {createUser, getUserbyEmail, resetUsers} from "./db/queries/users.js";
import {createChirp, getAllChirps, getChirpById} from "./db/queries/chirps.js";
import {checkPasswordHash, getBearerToken, hashPassword, makeJWT, validateJWT} from "./auth.js";
import {createRefreshToken, isRefreshToken, revokeRefreshToken} from "./db/queries/refreshtokens.js";

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
        email?: string;
    }

    const userId = validateJWT(getBearerToken(req), config.secret) as string;

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
        const chirp = await createChirp(body, userId);
        res.status(201).send(chirp);
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
        expiresInSeconds?: number;
    }

    const params: parameters = req.body;
    try {
        const [user] = await getUserbyEmail(params.email);
        const validPass = await checkPasswordHash(params.password, user.hashedPassword);
        if (validPass) {
            const {hashedPassword, ...response} = user;
            let token: string;
            if (params.expiresInSeconds && params.expiresInSeconds > 360) {
                token = makeJWT(user.id, 360, config.secret);
            } else if (params.expiresInSeconds && params.expiresInSeconds > 0) {
                token = makeJWT(user.id, params.expiresInSeconds, config.secret);
            } else {
                token = makeJWT(user.id, 360, config.secret);
            }
            const refresh = await createRefreshToken(user.id);

            res.status(200).send({...response, "token": token, "refreshToken": refresh});
        } else {
            throw new Error();
        }
    } catch (error) {
        console.error(error);
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

export async function handlerRefesh(req: Request, res: Response) {
    if (!req.body) {
        const refToken = await isRefreshToken(getBearerToken(req));
        if (refToken) {
            const newToken = makeJWT(refToken.userId, 360, config.secret);
            res.status(200).send({"token": newToken});
        } else {
            throw new UnauthorizedError("Invalid refresh token");
        }
    } else {
        throw new BadRequestError("Bad Request");
    }

}

export async function handlerRevoke(req: Request, res: Response) {
    if (!req.body) {
        const refToken = getBearerToken(req);
        if (refToken) {
            await revokeRefreshToken(refToken);
            res.status(204).send();
        } else {
            throw new UnauthorizedError("Invalid refresh token");
        }
    } else {
        throw new BadRequestError("Bad Request");
    }
}