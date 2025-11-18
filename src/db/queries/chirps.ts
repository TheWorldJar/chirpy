import {db} from "../index.js";
import {chirps} from "../schema.js";
import {eq} from "drizzle-orm/sql/expressions/conditions";

export async function createChirp(body: string, userID: string) {
    const [result] = await db.insert(chirps).values({body: body, userId: userID}).onConflictDoNothing().returning();
    return result;
}

export async function getAllChirps() {
    return db.select().from(chirps).orderBy(chirps.createdAt);
}

export async function getChirpById(chirpId: string) {
    return db.select().from(chirps).where(eq(chirps.id, chirpId));
}

export async function deleteChirp(chirpId: string) {
    await db.delete(chirps).where(eq(chirps.id, chirpId));
}