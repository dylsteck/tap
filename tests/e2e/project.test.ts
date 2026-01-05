import { expect, test } from "@playwright/test";

test.describe("Project Creation Flow", () => {
    test("create page renders correctly", async ({ page }) => {
        await page.goto("/create");

        // Check for the header
        await expect(page.getByText("Create")).toBeVisible();
        
        // Check for the hero section
        await expect(page.getByText("What do you want to build?")).toBeVisible();
        
        // Check for the textarea placeholder
        await expect(
            page.getByPlaceholder(/A frame that lets users mint/)
        ).toBeVisible();
        
        // Check for quick ideas section
        await expect(page.getByText("Quick Ideas")).toBeVisible();
        
        // Check for suggestion buttons
        await expect(page.getByText("NFT minting page")).toBeVisible();
        await expect(page.getByText("Token tracker")).toBeVisible();
    });

    test("can fill in prompt and see generate button activate", async ({ page }) => {
        await page.goto("/create");

        const textarea = page.getByPlaceholder(/A frame that lets users mint/);
        await textarea.fill("Create a simple token price tracker");

        // Generate button should be enabled
        const generateButton = page.getByRole("button", { name: /Generate/i });
        await expect(generateButton).toBeEnabled();
    });

    test("clicking suggestion fills textarea", async ({ page }) => {
        await page.goto("/create");

        // Click a suggestion
        await page.getByText("NFT minting page").click();

        // Check textarea has the suggestion text
        const textarea = page.getByPlaceholder(/A frame that lets users mint/);
        await expect(textarea).toHaveValue("NFT minting page");
    });

    test("API selector toggle works", async ({ page }) => {
        await page.goto("/create");

        // Click the API toggle button (code/API icon)
        const apiToggle = page.locator('button').filter({ has: page.locator('svg path[d*="M2 15h10"]') });
        await apiToggle.click();

        // Check that integrations section appears
        await expect(page.getByText("Integrations")).toBeVisible();
        
        // Check that API options are visible
        await expect(page.getByRole("button", { name: /Neynar/ })).toBeVisible();
        await expect(page.getByRole("button", { name: /Zora/ })).toBeVisible();
    });

    test("prompts login when submitting without auth", async ({ page }) => {
        await page.goto("/create");

        // Fill in prompt
        const textarea = page.getByPlaceholder(/A frame that lets users mint/);
        await textarea.fill("Create a test app");

        // Click generate
        await page.getByRole("button", { name: /Generate/i }).click();

        // Auth modal should appear (check for sign in form)
        await expect(page.getByText(/Sign In|Sign Up|Log In/i).first()).toBeVisible({ timeout: 5000 });
    });
});

test.describe("Studio Page", () => {
    test("studio page shows project interface", async ({ page }) => {
        // Mock a project ID
        await page.goto("/studio/test-project-id");

        // Should show some loading state or auth prompt
        // The page will either show login prompt or project interface
        await expect(
            page.getByText(/Sign in|Loading|Project|Create/i).first()
        ).toBeVisible({ timeout: 10000 });
    });
});

