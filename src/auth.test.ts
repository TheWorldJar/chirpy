import {beforeAll, describe, expect, it} from "vitest";
import {getBearerToken, makeJWT, validateJWT} from "./auth";
import express from "express";

describe("Token Validation", () => {
    const testUserID = "testUser";
    const expiredUserID = "expiredUser";
    const blankUserID = "";
    const expiresShort = 10;
    const expiresLong = 1200;
    const secretKey = "secretKey";
    const wrongSecretKey = "wrongSecretKey";
    let testToken: string;
    let expiredToken: string;
    let blankToken: string;

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    beforeAll(() => {
        testToken = makeJWT(testUserID, expiresLong, secretKey);
        expiredToken = makeJWT(expiredUserID, expiresShort, secretKey);
        blankToken = makeJWT(blankUserID, expiresShort, secretKey);
        express.request.method = "POST";
    });

    //Valid Test Token
    it("Should return 'testUser'", () => {
        const result = validateJWT(testToken, secretKey);
        expect(result).toBe(testUserID);
    });

    //Expired Token
    it("Should throw an 'UnauthorizedError' = \"Unauthorized: Invalid token\"", async () => {
        await sleep(15000);
        expect(() => validateJWT(expiredToken, secretKey)).toThrowError("Unauthorized: Invalid token");
    }, 20000);

    //Wrong Secret
    it("Should throw an 'UnauthorizedError' = \"Unauthorized: Invalid token\"", () => {
        expect(() => validateJWT(testToken, wrongSecretKey)).toThrowError("Unauthorized: Invalid token");
    });

    //Blank User ID
    it("Should throw any Error", () => {
        expect(() => validateJWT(blankToken, secretKey)).toThrowError();
    });

    //Authorized Request
    it("Should return testToken's string", () => {
        express.request.headers.authorization = `Bearer ${testToken}`;
        const result = getBearerToken(express.request);
        expect(result).toBe(testToken);
    });

    //No Token
    it("Should throw any error", () => {
        express.request.headers.authorization = "Bearer ";
        expect(() => getBearerToken(express.request)).toThrowError();
    });

    it("Should throw any error", () => {
        express.request.headers.authorization = "";
        expect(() => getBearerToken(express.request)).toThrowError();
    });
});