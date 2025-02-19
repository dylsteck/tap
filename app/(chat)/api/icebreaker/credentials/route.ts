import { auth } from "@/app/(auth)/auth";
import { redis } from "@/lib/redis";
import { authMiddleware, ICEBREAKER_API_URL } from "@/lib/utils";

interface IcebreakerCredentialProfile {
  profileID: string;
  avatarUrl: string;
  displayName: string;
  bio: string;
  primaryWalletAddress: string;
}

interface IcebreakerCredentialResponse {
  profiles: IcebreakerCredentialProfile[];
}

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const credentialName = url.searchParams.get("credentialName");
  const limit = url.searchParams.get("limit") || "100";
  const offset = url.searchParams.get("offset") || "3";

  if (!credentialName || typeof credentialName !== "string") {
    return new Response(
      JSON.stringify({ message: "Credential name is required and must be a string" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const cacheKey = `icebreaker:credential:${credentialName}:limit:${limit}:offset:${offset}`;
    const cachedData = await redis.get(cacheKey);

    let profileData: IcebreakerCredentialResponse;
    if (cachedData) {
        profileData = cachedData as IcebreakerCredentialResponse;
    } else {
      const response = await fetch(
        `${ICEBREAKER_API_URL}/credentials?credentialName=${encodeURIComponent(
          credentialName
        )}&limit=${encodeURIComponent(limit)}&offset=${encodeURIComponent(offset)}`,
        {
          method: "GET",
          headers: {
            Accept: "*/*",
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) {
        throw new Error(`Error fetching profiles: ${response.statusText}`);
      }
      profileData = await response.json();
      await redis.set(cacheKey, JSON.stringify(profileData), { ex: 1800 });
    }

    return new Response(JSON.stringify(profileData), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}