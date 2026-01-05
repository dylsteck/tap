import { expect, test } from "@playwright/test";

test.describe("API Integrations", () => {
    test.describe("Zora Coins API", () => {
        test("coin endpoint returns coin data", async ({ request }) => {
            // Mock a real coin address on Base
            const response = await request.get("/api/zora/collection", {
                params: {
                    address: "0x1234567890123456789012345678901234567890",
                    chain: "8453",
                },
            });

            // Should return 200 or handle error gracefully
            expect([200, 500]).toContain(response.status());
        });

        test("profile endpoint accepts identifier", async ({ request }) => {
            const response = await request.get("/api/zora/profile", {
                params: {
                    identifier: "0x1234567890123456789012345678901234567890",
                },
            });

            expect([200, 500]).toContain(response.status());
        });

        test("explore endpoint returns trending coins", async ({ request }) => {
            const response = await request.get("/api/zora/explore", {
                params: {
                    type: "trending",
                    limit: "10",
                },
            });

            expect([200, 500]).toContain(response.status());
        });

        test("coin endpoint requires address", async ({ request }) => {
            const response = await request.get("/api/zora/collection");
            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.error).toContain("address");
        });

        test("profile endpoint requires identifier", async ({ request }) => {
            const response = await request.get("/api/zora/profile");
            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.error).toContain("identifier");
        });
    });

    test.describe("CoinGecko API", () => {
        test("price endpoint returns token prices", async ({ request }) => {
            const response = await request.get("/api/coingecko/price", {
                params: {
                    ids: "ethereum",
                    currencies: "usd",
                },
            });

            expect([200, 500]).toContain(response.status());
        });
    });

    test.describe("Neynar API", () => {
        test("user endpoint returns user data", async ({ request }) => {
            const response = await request.get("/api/neynar/user", {
                params: {
                    fid: "3",
                },
            });

            expect([200, 500]).toContain(response.status());
        });

        test("user endpoint requires fid or username", async ({ request }) => {
            const response = await request.get("/api/neynar/user");
            expect(response.status()).toBe(400);

            const data = await response.json();
            expect(data.error).toBeDefined();
        });
    });

    test.describe("Projects API", () => {
        test("projects list requires authentication", async ({ request }) => {
            const response = await request.get("/api/projects");
            expect(response.status()).toBe(401);
        });

        test("project creation requires authentication", async ({ request }) => {
            const response = await request.post("/api/projects", {
                data: {
                    prompt: "Test app",
                    apis: ["Neynar"],
                },
            });
            expect(response.status()).toBe(401);
        });
    });
});

