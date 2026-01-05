import { expect, test } from "@playwright/test";

test.describe("Projects Feed (Home Page)", () => {
    test("shows sign in prompt when not logged in", async ({ page }) => {
        await page.goto("/");
        
        // Should show sign in prompt
        await expect(page.getByText("Build miniapps with AI")).toBeVisible();
        await expect(page.getByText("Sign in to get started")).toBeVisible();
    });

    test("shows empty state when logged in with no projects", async ({ page }) => {
        // Mock authenticated session with no projects
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

        await page.route("**/api/projects", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({ projects: [] }),
            });
        });

        await page.goto("/");

        // Should show empty state
        await expect(page.getByText("No miniapps yet")).toBeVisible();
        await expect(page.getByText("Create your first miniapp")).toBeVisible();
    });

    test("shows projects list when logged in with projects", async ({ page }) => {
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

        await page.route("**/api/projects", async (route) => {
            await route.fulfill({
                status: 200,
                contentType: "application/json",
                body: JSON.stringify({
                    projects: [
                        {
                            id: "project-1",
                            name: "Test Miniapp",
                            description: "A test miniapp description",
                            subdomain: "test-miniapp",
                            status: "deployed",
                            createdAt: new Date().toISOString(),
                            deployedUrl: "https://test-miniapp.tap.computer",
                        },
                    ],
                }),
            });
        });

        await page.goto("/");

        // Should show project card
        await expect(page.getByText("Your Miniapps")).toBeVisible();
        await expect(page.getByText("Test Miniapp")).toBeVisible();
        await expect(page.getByText("deployed")).toBeVisible();
    });
});

test.describe("Create Page", () => {
    test("create page renders with input field", async ({ page }) => {
        await page.goto("/create");
        
        // Should have prompt input
        await expect(page.getByPlaceholder(/describe/i)).toBeVisible();
    });

    test("shows sign in prompt when not logged in", async ({ page }) => {
        await page.goto("/create");
        
        // Should prompt sign in
        await expect(page.getByText(/sign in/i)).toBeVisible({ timeout: 5000 });
    });
});

test.describe("Bottom Navigation", () => {
    test("bottom nav shows on home page", async ({ page }) => {
        await page.goto("/");
        
        await expect(page.getByRole("link", { name: /home/i })).toBeVisible();
        await expect(page.getByRole("link", { name: /profile/i })).toBeVisible();
    });

    test("create button navigates to create page", async ({ page }) => {
        await page.goto("/");
        
        // Click the center create button (the link that goes to /create)
        await page.locator('a[href="/create"]').click();
        
        await expect(page).toHaveURL("/create");
    });
});

test.describe("Projects API", () => {
    test("GET /api/projects returns 401 when not authenticated", async ({ request }) => {
        const response = await request.get("/api/projects");
        expect(response.status()).toBe(401);
    });

    test("POST /api/projects returns 401 when not authenticated", async ({ request }) => {
        const response = await request.post("/api/projects", {
            data: { name: "Test Project", prompt: "Test prompt" },
        });
        expect(response.status()).toBe(401);
    });
});

