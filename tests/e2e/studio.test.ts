import { expect, test } from "@playwright/test";

test.describe("Studio Page", () => {
    test("redirects to login when not authenticated", async ({ page }) => {
        await page.goto("/studio/test-project-id");
        
        // Should redirect or show login modal
        // The page might show a sign in prompt
        await expect(page.getByText(/sign in/i)).toBeVisible({ timeout: 5000 });
    });

    test("studio page loads with project when authenticated", async ({ page }) => {
        // Mock authenticated session
        await page.route("**/api/auth/session", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    user: {
                        id: "test-user-id",
                        email: "test@example.com",
                    },
                    expires: new Date(Date.now() + 86400000).toISOString(),
                }),
            });
        });

        // Mock project data
        await page.route("**/api/projects/test-project-id", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    project: {
                        id: "test-project-id",
                        name: "Test Project",
                        description: "Test description",
                        status: "generated",
                        createdAt: new Date().toISOString(),
                    },
                }),
            });
        });

        // Mock messages
        await page.route("**/api/projects/test-project-id/messages", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ messages: [] }),
            });
        });

        await page.goto("/studio/test-project-id");
        
        // Should show project name or studio UI
        await expect(page.getByText("Test Project")).toBeVisible({ timeout: 10000 });
    });

    test("studio page hides bottom nav", async ({ page }) => {
        // Mock authenticated session
        await page.route("**/api/auth/session", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    user: {
                        id: "test-user-id",
                        email: "test@example.com",
                    },
                    expires: new Date(Date.now() + 86400000).toISOString(),
                }),
            });
        });

        // Mock project data
        await page.route("**/api/projects/test-project-id", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    project: {
                        id: "test-project-id",
                        name: "Test Project",
                        description: "Test description",
                        status: "draft",
                        createdAt: new Date().toISOString(),
                    },
                }),
            });
        });

        await page.route("**/api/projects/test-project-id/messages", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ messages: [] }),
            });
        });

        await page.goto("/studio/test-project-id");
        
        // Bottom nav should NOT be visible on studio pages
        await expect(page.getByRole("link", { name: /home/i })).not.toBeVisible();
    });
});

