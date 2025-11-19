import {boolean, pgTable, text, timestamp, uuid, varchar} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", {mode: 'date'}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {mode: 'date'}).notNull().defaultNow().$onUpdate(() => new Date()),
    email: varchar("email", {length: 256}).unique().notNull(),
    hashedPassword: varchar("hashed_password", {length: 256}).notNull().default("unset"),
    isChirpyRed: boolean("is_chirpy_red").notNull().default(false),
});

export const chirps = pgTable("chirps", {
    id: uuid("id").primaryKey().defaultRandom(),
    createdAt: timestamp("created_at", {mode: 'date'}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {mode: 'date'}).notNull().defaultNow().$onUpdate(() => new Date()),
    body: text("body").notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),
});

export const refreshTokens = pgTable("refresh_tokens", {
    token: text("token").primaryKey(),
    createdAt: timestamp("created_at", {mode: 'date'}).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", {mode: 'date'}).notNull().defaultNow().$onUpdate(() => new Date()),
    userId: uuid("user_id").references(() => users.id).notNull(),
    expiresAt: timestamp("expires_at", {mode: 'date'}).notNull(),
    revokedAt: timestamp("revokedAt", {mode: 'date'}),
});

export type NewUser = typeof users.$inferInsert;