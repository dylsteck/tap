import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
    test("homepage loads and displays app header", async ({ page }) => {
        await page.goto("/");
        
        // Check if the app header is visible
        await expect(page.getByText("tap")).toBeVisible();
    });

    test("homepage shows bottom navigation", async ({ page }) => {
        await page.goto("/");
        
        // Check bottom nav items
        const homeLink = page.getByRole("link", { name: /home/i });
        const profileLink = page.getByRole("link", { name: /profile/i });
        
        await expect(homeLink).toBeVisible();
        await expect(profileLink).toBeVisible();
    });

    test("create button is visible and styled", async ({ page }) => {
        await page.goto("/");
        
        // The create button should be a link to /create
        const createLink = page.locator('a[href="/create"]');
        await expect(createLink).toBeVisible();
    });
});
