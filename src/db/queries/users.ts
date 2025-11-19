import {db} from "../index.js";
import {NewUser, users} from "../schema.js";
import {eq} from "drizzle-orm/sql/expressions/conditions";

export async function createUser(user: NewUser) {
    const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
    return result;
}

export async function resetUsers() {
    await db.execute("TRUNCATE TABLE users CASCADE;");
}

export async function getUserbyEmail(email: string) {
    return db.select().from(users).where(eq(users.email, email));
}

export async function updateUser(user: NewUser) {
    const [result] = await db.update(users).set({
        updatedAt: new Date(),
        email: user.email,
        hashedPassword: user.hashedPassword,
    }).where(eq(users.id, user.id as string)).returning();
    return result;
}

export async function isChirpyRed(userId: string) {
    const [result] = await db.select({isChirpyRed: users.isChirpyRed}).from(users).where(eq(users.id, userId));
    return result.isChirpyRed;
}

export async function upgradeChirpyRed(userId: string) {
    const [result] = await db.update(users).set({
        updatedAt: new Date(),
        isChirpyRed: true,
    }).where(eq(users.id, userId)).returning();
    return result.isChirpyRed;
}