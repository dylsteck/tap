'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

// Icons
const RefreshIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
)

const ExternalLinkIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" x2="21" y1="14" y2="3" />
  </svg>
)

const FullscreenIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3" />
    <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
    <path d="M3 16v3a2 2 0 0 0 2 2h3" />
    <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
  </svg>
)

interface PreviewFrameProps {
  code: string
  className?: string
  onRefresh?: () => void
}

// CSS reset and base styles for the preview
const PREVIEW_BASE_STYLES = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  html, body {
    min-height: 100%;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #000;
    color: #fff;
    -webkit-font-smoothing: antialiased;
  }
  
  /* Tailwind-like utilities */
  .min-h-screen { min-height: 100vh; }
  .bg-black { background: #000; }
  .bg-zinc-900 { background: #18181b; }
  .bg-zinc-800 { background: #27272a; }
  .text-white { color: #fff; }
  .text-zinc-400 { color: #a1a1aa; }
  .text-zinc-500 { color: #71717a; }
  .text-zinc-600 { color: #52525b; }
  .text-sm { font-size: 0.875rem; }
  .text-xs { font-size: 0.75rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .font-bold { font-weight: 700; }
  .font-semibold { font-weight: 600; }
  .font-medium { font-weight: 500; }
  .p-4 { padding: 1rem; }
  .p-3 { padding: 0.75rem; }
  .px-4 { padding-left: 1rem; padding-right: 1rem; }
  .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
  .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
  .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
  .py-6 { padding-top: 1.5rem; padding-bottom: 1.5rem; }
  .mb-4 { margin-bottom: 1rem; }
  .mb-6 { margin-bottom: 1.5rem; }
  .mt-1 { margin-top: 0.25rem; }
  .mt-2 { margin-top: 0.5rem; }
  .mt-6 { margin-top: 1.5rem; }
  .gap-2 { gap: 0.5rem; }
  .gap-3 { gap: 0.75rem; }
  .gap-4 { gap: 1rem; }
  .flex { display: flex; }
  .flex-col { flex-direction: column; }
  .flex-1 { flex: 1; }
  .items-center { align-items: center; }
  .justify-center { justify-content: center; }
  .justify-between { justify-content: space-between; }
  .space-y-2 > * + * { margin-top: 0.5rem; }
  .space-y-3 > * + * { margin-top: 0.75rem; }
  .space-y-4 > * + * { margin-top: 1rem; }
  .rounded-xl { border-radius: 0.75rem; }
  .rounded-2xl { border-radius: 1rem; }
  .rounded-full { border-radius: 9999px; }
  .border { border-width: 1px; }
  .border-zinc-800 { border-color: #27272a; }
  .border-zinc-700 { border-color: #3f3f46; }
  .overflow-hidden { overflow: hidden; }
  .w-full { width: 100%; }
  .h-full { height: 100%; }
  .w-8 { width: 2rem; }
  .h-8 { height: 2rem; }
  .w-10 { width: 2.5rem; }
  .h-10 { height: 2.5rem; }
  .mx-auto { margin-left: auto; margin-right: auto; }
  .max-w-\\[430px\\] { max-width: 430px; }
  .aspect-square { aspect-ratio: 1 / 1; }
  .relative { position: relative; }
  .absolute { position: absolute; }
  .inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
  .bottom-4 { bottom: 1rem; }
  .left-4 { left: 1rem; }
  .right-4 { right: 1rem; }
  .object-cover { object-fit: cover; }
  .truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .transition-all { transition: all 0.2s ease; }
  .cursor-pointer { cursor: pointer; }
  .disabled\\:opacity-50:disabled { opacity: 0.5; }
  .hover\\:bg-zinc-700:hover { background: #3f3f46; }
  .hover\\:bg-zinc-800:hover { background: #27272a; }
  .hover\\:bg-zinc-200:hover { background: #e4e4e7; }
  .hover\\:border-zinc-700:hover { border-color: #3f3f46; }
  
  /* Button base */
  button {
    cursor: pointer;
    border: none;
    background: none;
    font: inherit;
    color: inherit;
  }
  
  /* Safe area padding */
  .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
`

export function PreviewFrame({ code, className, onRefresh }: PreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const generatePreviewHTML = useCallback((jsxCode: string): string => {
    // Transform JSX-like code to plain HTML for preview
    // This is a simplified transform - for production, use a proper bundler
    const htmlContent = transformJSXToHTML(jsxCode)
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <style>${PREVIEW_BASE_STYLES}</style>
</head>
<body>
  <div id="root">${htmlContent}</div>
  <script>
    // Simple interactivity layer
    document.addEventListener('click', (e) => {
      if (e.target.tagName === 'BUTTON') {
        // Provide visual feedback
        e.target.style.opacity = '0.7'
        setTimeout(() => {
          e.target.style.opacity = '1'
        }, 150)
      }
    })
    
    // Send ready message to parent
    window.parent.postMessage({ type: 'preview-ready' }, '*')
  </script>
</body>
</html>`
  }, [])

  useEffect(() => {
    if (!code) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      
      const html = generatePreviewHTML(code)
      
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render preview')
      setIsLoading(false)
    }
  }, [code, key, generatePreviewHTML])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-ready') {
        setIsLoading(false)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  const handleRefresh = () => {
    setKey(k => k + 1)
    onRefresh?.()
  }

  return (
    <div className={cn("relative flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1">
        <button
          onClick={handleRefresh}
          className="p-2 rounded-lg bg-black/50 backdrop-blur text-zinc-400 hover:text-white transition-colors"
          title="Refresh preview"
        >
          <RefreshIcon size={14} />
        </button>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
            <div className="w-6 h-6 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
          </div>
        )}

        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
              <span className="text-red-500 text-xl">!</span>
            </div>
            <p className="text-zinc-400 text-sm">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 rounded-lg bg-zinc-800 text-white text-sm hover:bg-zinc-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key={key}
            className="w-full h-full border-none"
            sandbox="allow-scripts"
            title="Preview"
            onLoad={() => {
              // Fallback if message doesn't fire
              setTimeout(() => setIsLoading(false), 500)
            }}
          />
        )}
      </div>
    </div>
  )
}

// Simple JSX to HTML transformer for preview
// In production, this would use a proper bundler like esbuild
function transformJSXToHTML(jsxCode: string): string {
  try {
    // Extract the return statement content
    const returnMatch = jsxCode.match(/return\s*\(\s*([\s\S]*?)\s*\)\s*[;\n}]/m) 
      || jsxCode.match(/return\s*(<[\s\S]*?>)/m)
    
    if (!returnMatch) {
      // Try to find any JSX content
      const jsxMatch = jsxCode.match(/<[A-Za-z][^>]*>[\s\S]*<\/[A-Za-z]+>/m)
      if (jsxMatch) {
        return cleanJSX(jsxMatch[0])
      }
      return '<div class="min-h-screen bg-black text-white flex items-center justify-center"><p class="text-zinc-500">Preview unavailable</p></div>'
    }

    const jsx = returnMatch[1]
    return cleanJSX(jsx)
  } catch {
    return '<div class="min-h-screen bg-black text-white flex items-center justify-center"><p class="text-zinc-500">Preview unavailable</p></div>'
  }
}

function cleanJSX(jsx: string): string {
  return jsx
    // Convert className to class
    .replace(/className=/g, 'class=')
    // Remove JS expressions in attributes (simplified)
    .replace(/\{`([^`]*)`\}/g, '"$1"')
    // Convert self-closing components to divs for preview
    .replace(/<([A-Z][a-zA-Z]*)\s*\/>/g, '<div></div>')
    // Remove event handlers
    .replace(/\s+on[A-Z][a-zA-Z]*=\{[^}]*\}/g, '')
    // Remove disabled attribute expressions
    .replace(/\s+disabled=\{[^}]*\}/g, '')
    // Convert simple expressions to text
    .replace(/\{([^{}]+)\}/g, (_, expr) => {
      // Try to evaluate simple expressions
      if (expr.includes('?')) return '' // Skip ternaries
      if (expr.includes('&&')) return '' // Skip conditionals
      if (expr.includes('map')) return '' // Skip maps
      if (expr.includes('.')) return `\${${expr}}` // Show as placeholder
      return expr.trim()
    })
    // Clean up any remaining curly braces
    .replace(/[{}]/g, '')
}

