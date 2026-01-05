"use workflow";

import { anthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { MINIAPP_SYSTEM_PROMPT, MINIAPP_TEMPLATES } from "@/lib/ai/miniapp-system-prompt";

// Workflow for generating a complete miniapp from a user prompt
// This workflow is durable - it can suspend and resume across deployments
export async function generateMiniappWorkflow({
  projectId,
  prompt,
  apis,
}: {
  projectId: string;
  prompt: string;
  apis: string[];
}) {
  "use step";

  // Step 1: Analyze the prompt and determine template match
  const templateMatch = await analyzePrompt(prompt);

  // Step 2: Generate or use template code
  const code = templateMatch
    ? templateMatch.code
    : await generateCodeWithAI(prompt, apis);

  // Step 3: Return the result
  return {
    projectId,
    code,
    message: templateMatch
      ? `Created a ${templateMatch.name} for you!`
      : "Generated your custom miniapp!",
  };
}

// Step: Analyze prompt for template matching
async function analyzePrompt(prompt: string) {
  "use step";
  
  const lower = prompt.toLowerCase();
  
  if (lower.includes("nft") && (lower.includes("mint") || lower.includes("minting"))) {
    return MINIAPP_TEMPLATES["nft-mint"];
  }
  
  if (lower.includes("leaderboard") || lower.includes("ranking") || lower.includes("top users")) {
    return MINIAPP_TEMPLATES["leaderboard"];
  }
  
  if (lower.includes("poll") || lower.includes("voting") || lower.includes("vote")) {
    return MINIAPP_TEMPLATES["poll"];
  }
  
  return null;
}

// Step: Generate code with AI
async function generateCodeWithAI(prompt: string, apis: string[]) {
  "use step";
  
  const apiContext = apis.length > 0 
    ? `\n\nAvailable APIs to use: ${apis.join(", ")}` 
    : "";

  const result = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: MINIAPP_SYSTEM_PROMPT + apiContext,
    prompt: `Create a Farcaster miniapp based on this description: ${prompt}

Return ONLY the complete React component code without any markdown code fences or explanations. The code should be production-ready.`,
    maxOutputTokens: 4000,
  });

  return extractCodeFromResponse(result.text);
}

// Helper: Extract code from AI response
function extractCodeFromResponse(response: string): string {
  let code = response;
  
  const codeBlockMatch = response.match(/```(?:tsx|jsx|typescript|javascript)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    code = codeBlockMatch[1].trim();
  }
  
  if (!code.includes("export default") && !code.includes("function")) {
    return `'use client'

export default function MiniApp() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <p className="text-zinc-500">Unable to generate component. Please try again.</p>
    </div>
  )
}`;
  }
  
  return code;
}

