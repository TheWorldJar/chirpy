import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import {UnauthorizedError} from "./errortypes.js";
import {Request} from "express";
import {randomBytes} from "node:crypto";

export async function hashPassword(password: string) {
    return argon2.hash(password);
}

export async function checkPasswordHash(password: string, hash: string) {
    return argon2.verify(hash, password);
}

export type Payload = Pick<jwt.JwtPayload, "iss" | "sub" | "iat" | "exp">;

export function makeJWT(userID: string, expiresIn: number, secret: string) {
    const time = Math.floor(Date.now() / 1000);
    const payload: Payload = {
        iss: "chirpy",
        sub: userID,
        iat: time,
        exp: time + expiresIn,
    };

    return jwt.sign(payload, secret);
}

export function validateJWT(tokenString: string, secret: string) {
    try {
        const decoded = jwt.verify(tokenString, secret);
        return decoded.sub;
    } catch (error) {
        throw new UnauthorizedError("Unauthorized: Invalid token");
    }
}

export function getBearerToken(req: Request) {
    try {
        const auth = req.get("authorization") as string;
        const tokenString = auth.split('Bearer')[1].trim();
        if (!tokenString) {
            throw new Error();
        }
        return tokenString;
    } catch (error) {
        throw new UnauthorizedError("No access token");
    }
}

export function makeRefreshToken() {
    return randomBytes(32).toString("hex");
}