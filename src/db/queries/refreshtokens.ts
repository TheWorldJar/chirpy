import {db} from "../index.js";
import {refreshTokens} from "../schema.js";
import {makeRefreshToken} from "../../auth.js";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {UnauthorizedError} from "../../errortypes.js";


export async function createRefreshToken(userId: string) {
    const refToken = makeRefreshToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 60);
    const [result] = await db.insert(refreshTokens).values({
        token: refToken, userId: userId, expiresAt: expiresAt
    }).returning();
    return result.token;
}

export async function isRefreshToken(token: string) {
    const today = new Date();
    const [refToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    if (refToken) {
        if (!refToken.revokedAt && today < refToken.expiresAt) {
            return refToken;
        }
    }
    throw new UnauthorizedError("Invalid refresh token");
}

export async function revokeRefreshToken(token: string) {
    const [refToken] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    if (refToken) {
        if (!refToken.revokedAt) {
            await db.update(refreshTokens).set({
                updatedAt: new Date(),
                revokedAt: new Date()
            }).where(eq(refreshTokens.token, token));
        }
    }
}