// Cloudflare Pages deployment service
// Handles deploying miniapps to unique subdomains

interface DeploymentConfig {
  projectId: string;
  subdomain: string;
  files: Record<string, string>;
}

interface DeploymentResult {
  url: string;
  subdomain: string;
  deploymentId: string;
  status: 'success' | 'failed';
  error?: string;
}

// Environment variables needed:
// CLOUDFLARE_API_TOKEN - API token with Pages write permissions
// CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

export async function deployToCloudflarePages({
  projectId,
  subdomain,
  files,
}: DeploymentConfig): Promise<DeploymentResult> {
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

  if (!apiToken || !accountId) {
    throw new Error('Cloudflare credentials not configured');
  }

  try {
    // 1. Create or get the Pages project
    const projectName = `tap-${subdomain}`;
    await ensurePagesProject(accountId, apiToken, projectName);

    // 2. Create a new deployment
    const deployment = await createDeployment(
      accountId,
      apiToken,
      projectName,
      files
    );

    return {
      url: `https://${subdomain}.tap.computer`,
      subdomain: `${subdomain}.tap.computer`,
      deploymentId: deployment.id,
      status: 'success',
    };
  } catch (error) {
    console.error('Cloudflare deployment failed:', error);
    return {
      url: '',
      subdomain: `${subdomain}.tap.computer`,
      deploymentId: '',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function ensurePagesProject(
  accountId: string,
  apiToken: string,
  projectName: string
): Promise<void> {
  // Check if project exists
  const checkResponse = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/pages/projects/${projectName}`,
    {
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
    }
  );

  if (checkResponse.ok) {
    // Project exists
    return;
  }

  if (checkResponse.status !== 404) {
    throw new Error(`Failed to check project: ${checkResponse.statusText}`);
  }

  // Create new project
  const createResponse = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/pages/projects`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: projectName,
        production_branch: 'main',
      }),
    }
  );

  if (!createResponse.ok) {
    const error = await createResponse.text();
    throw new Error(`Failed to create project: ${error}`);
  }
}

async function createDeployment(
  accountId: string,
  apiToken: string,
  projectName: string,
  files: Record<string, string>
): Promise<{ id: string; url: string }> {
  // Create form data for file upload
  const formData = new FormData();

  // Add manifest
  const manifest: Record<string, string> = {};
  
  for (const [path, content] of Object.entries(files)) {
    const hash = await hashContent(content);
    manifest[`/${path}`] = hash;
    
    // Add file blob
    formData.append(hash, new Blob([content], { type: getContentType(path) }), path);
  }

  formData.append('manifest', JSON.stringify(manifest));

  // Create deployment
  const response = await fetch(
    `${CF_API_BASE}/accounts/${accountId}/pages/projects/${projectName}/deployments`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create deployment: ${error}`);
  }

  const data = await response.json();
  return {
    id: data.result.id,
    url: data.result.url,
  };
}

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getContentType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: 'text/html',
    css: 'text/css',
    js: 'application/javascript',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    svg: 'image/svg+xml',
  };
  return types[ext || ''] || 'text/plain';
}

// Generate static HTML for the miniapp
export function generateStaticHTML(code: string, appName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <meta name="theme-color" content="#000000" />
  <title>${appName} | Tap</title>
  
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            zinc: {
              900: '#18181b',
              800: '#27272a',
              700: '#3f3f46',
              600: '#52525b',
              500: '#71717a',
              400: '#a1a1aa',
            }
          }
        }
      }
    }
  </script>
  
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html { background: #000; }
    body { 
      background: #000; 
      color: #fff; 
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
  </style>
</head>
<body class="dark">
  <div id="root"></div>
  
  <!-- React CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <script type="text/babel">
    ${transformCodeForBrowser(code)}
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(<MiniApp />);
  </script>
</body>
</html>`;
}

function transformCodeForBrowser(code: string): string {
  // Remove 'use client' directive
  let transformed = code.replace(/['"]use client['"];?\n?/g, '');
  
  // Remove imports (we're using UMD builds)
  transformed = transformed.replace(/import\s+.*?from\s+['"].*?['"];?\n?/g, '');
  
  // Convert hooks to React.useState, React.useEffect, etc.
  transformed = transformed.replace(/\buseState\b/g, 'React.useState');
  transformed = transformed.replace(/\buseEffect\b/g, 'React.useEffect');
  transformed = transformed.replace(/\buseCallback\b/g, 'React.useCallback');
  transformed = transformed.replace(/\buseMemo\b/g, 'React.useMemo');
  transformed = transformed.replace(/\buseRef\b/g, 'React.useRef');
  
  // Convert export default to const MiniApp
  transformed = transformed.replace(
    /export default function (\w+)/g,
    'function MiniApp'
  );
  
  // Handle arrow function exports
  transformed = transformed.replace(
    /export default \(/g,
    'const MiniApp = ('
  );
  
  return transformed;
}

// Deploy API route handler
export async function handleDeployRequest(
  projectId: string,
  subdomain: string,
  code: string,
  appName: string
): Promise<DeploymentResult> {
  const html = generateStaticHTML(code, appName);
  
  const files: Record<string, string> = {
    'index.html': html,
    '_headers': `/*
  Access-Control-Allow-Origin: *
  X-Frame-Options: ALLOWALL
  Content-Security-Policy: frame-ancestors *`,
  };
  
  return deployToCloudflarePages({ projectId, subdomain, files });
}

