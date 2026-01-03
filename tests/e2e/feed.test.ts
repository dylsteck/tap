import { expect, test } from "@playwright/test";

test.describe("Frame Catalog Feed", () => {
    test("homepage loads and displays frame catalog items", async ({ page }) => {
        // Mock the API response to ensure deterministic tests
        await page.route("**/api/feed/trending**", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    apps: [
                        {
                            id: "https://example.com/frame1",
                            name: "Test Frame 1",
                            description: "A test frame description",
                            url: "https://example.com/frame1",
                            author: "testuser1",
                            authorAvatar: "https://example.com/avatar1.png",
                            likes: 0,
                            comments: 0,
                            shares: 0,
                        }
                    ],
                    nextCursor: "test-cursor"
                }),
            });
        });

        await page.goto("/");

        // Check if the app name is visible
        await expect(page.getByText("Test Frame 1")).toBeVisible();

        // Check if the author handle is visible
        await expect(page.getByText("@testuser1")).toBeVisible();

        // Check if the iframe is present with correct src
        const iframe = page.locator('iframe[title="Test Frame 1"]');
        await expect(iframe).toBeVisible();
        await expect(iframe).toHaveAttribute("src", "https://example.com/frame1");

        // Check if the "Launch" button is present
        await expect(page.getByRole("button", { name: /launch/i })).toBeVisible();
    });

    test("refresh button triggers a new fetch", async ({ page }) => {
        let fetchCount = 0;
        await page.route("**/api/feed/trending**", async (route) => {
            fetchCount++;
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ apps: [], nextCursor: null }),
            });
        });

        await page.goto("/");
        expect(fetchCount).toBe(1);

        await page.getByTitle("Refresh").click();
        expect(fetchCount).toBe(2);
    });
});
