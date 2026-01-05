"use workflow";

// Workflow for deploying a miniapp to Cloudflare Pages
// This workflow handles the full deployment pipeline with durability
export async function deployMiniappWorkflow({
  projectId,
  subdomain,
  code,
}: {
  projectId: string;
  subdomain: string;
  code: string;
}) {
  "use step";

  // Step 1: Prepare build files
  const buildFiles = await prepareBuildFiles(code);

  // Step 2: Upload to R2 storage
  const assetUrl = await uploadToR2(projectId, buildFiles);

  // Step 3: Deploy to Cloudflare Pages
  const deploymentUrl = await deployToCloudflarePages({
    projectId,
    subdomain,
    assetUrl,
  });

  // Step 4: Return deployment result
  return {
    projectId,
    deploymentUrl,
    subdomain: `${subdomain}.tap.computer`,
    status: "deployed" as const,
  };
}

// Step: Prepare build files from generated code
async function prepareBuildFiles(code: string) {
  "use step";
  
  // Create a minimal Next.js-like structure for static export
  const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <title>Tap Miniapp</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@3/dist/tailwind.min.css" rel="stylesheet">
  <style>
    :root { --background: #000; --foreground: #fff; }
    body { background: var(--background); color: var(--foreground); font-family: system-ui, sans-serif; }
    .min-h-screen { min-height: 100vh; }
    .bg-black { background: #000; }
    .bg-zinc-900 { background: #18181b; }
    .bg-zinc-800 { background: #27272a; }
    .text-white { color: #fff; }
    .text-zinc-400 { color: #a1a1aa; }
    .text-zinc-500 { color: #71717a; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="module">
    import React from 'https://esm.sh/react@18';
    import ReactDOM from 'https://esm.sh/react-dom@18/client';
    
    ${transformCodeForBrowser(code)}
    
    ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(MiniApp));
  </script>
</body>
</html>`;

  return {
    "index.html": indexHtml,
    "_headers": `/*
  Access-Control-Allow-Origin: *
  X-Frame-Options: ALLOWALL`,
  };
}

// Transform React code for browser execution
function transformCodeForBrowser(code: string): string {
  // Remove 'use client' directive
  let transformed = code.replace(/['"]use client['"];?\n?/g, "");
  
  // Convert export default to const MiniApp assignment
  transformed = transformed.replace(
    /export default function (\w+)/g, 
    "const MiniApp = function"
  );
  
  // Handle named exports
  transformed = transformed.replace(
    /export function (\w+)/g, 
    "const $1 = function"
  );
  
  return transformed;
}

// Step: Upload build files to R2
async function uploadToR2(projectId: string, files: Record<string, string>) {
  "use step";
  
  // TODO: Implement R2 upload using Cloudflare R2 API
  // For now, return a placeholder URL
  const timestamp = Date.now();
  return `https://r2.tap.computer/builds/${projectId}/${timestamp}`;
}

// Step: Deploy to Cloudflare Pages
async function deployToCloudflarePages({
  projectId,
  subdomain,
  assetUrl,
}: {
  projectId: string;
  subdomain: string;
  assetUrl: string;
}) {
  "use step";
  
  // TODO: Implement Cloudflare Pages deployment
  // This would use the Cloudflare API to:
  // 1. Create a new Pages project if it doesn't exist
  // 2. Upload the build assets
  // 3. Create a deployment
  // 4. Set up the custom subdomain
  
  // For now, return the expected URL structure
  return `https://${subdomain}.tap.computer`;
}

