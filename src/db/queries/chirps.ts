import {db} from "../index.js";
import {chirps} from "../schema.js";
import {eq} from "drizzle-orm/sql/expressions/conditions";
import {asc, desc} from "drizzle-orm";

export async function createChirp(body: string, userID: string) {
    const [result] = await db.insert(chirps).values({body: body, userId: userID}).onConflictDoNothing().returning();
    return result;
}

export async function getAllChirps(sort: "asc" | "desc" = "asc") {
    if (sort === "desc") {
        return db.select().from(chirps).orderBy(desc(chirps.createdAt));
    }
    return db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function getAllChirpsByUserId(userId: string, sort: "asc" | "desc" = "asc") {
    if (sort === "desc") {
        return db.select().from(chirps).where(eq(chirps.userId, userId)).orderBy(desc(chirps.createdAt));
    }
    return db.select().from(chirps).where(eq(chirps.userId, userId)).orderBy(asc(chirps.createdAt));
}

export async function getChirpById(chirpId: string) {
    return db.select().from(chirps).where(eq(chirps.id, chirpId));
}

export async function deleteChirp(chirpId: string) {
    await db.delete(chirps).where(eq(chirps.id, chirpId));
}