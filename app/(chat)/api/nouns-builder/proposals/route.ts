import { auth } from "@/app/(auth)/auth";
import { redis } from "@/lib/redis";
import { authMiddleware, NOUNS_BUILDER_GOLDSKY_SUBGRAPH_URL } from "@/lib/utils";

interface Proposal {
  abstainVotes: number;
  againstVotes: number;
  calldatas: string[];
  description: string;
  descriptionHash: string;
  executableFrom: string;
  expiresAt: string;
  forVotes: number;
  proposalId: string;
  proposalNumber: number;
  proposalThreshold: number;
  proposer: string;
  quorumVotes: number;
  targets: string[];
  timeCreated: string;
  title: string;
  values: string[];
  voteEnd: string;
  voteStart: string;
  snapshotBlockNumber: number;
  transactionHash: string;
  dao: {
    governorAddress: string;
    tokenAddress: string;
  };
}

interface GoldskyResponse {
  data: {
    proposals: Proposal[];
  };
}

export async function GET(request: Request) {
  const session = await auth();
  const authResponse = authMiddleware(session, request.url, request.headers);
  if (authResponse) {
    return authResponse;
  }

  const url = new URL(request.url);
  const contractAddress = url.searchParams.get("contractAddress");
  const first = url.searchParams.get("first") ? parseInt(url.searchParams.get("first")!) : 100;
  const skip = url.searchParams.get("skip") ? parseInt(url.searchParams.get("skip")!) : 0;

  if (!contractAddress) {
    return new Response(JSON.stringify({ message: "Contract address is required" }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const proposalsCacheKey = `nouns-builder:proposals:${contractAddress}&first=${first}&skip=${skip}`;
    let proposalsData: GoldskyResponse | null = null;
    const cachedData = await redis.get(proposalsCacheKey);
    
    if (cachedData && typeof cachedData === 'string') {
      try {
        proposalsData = JSON.parse(cachedData);
      } catch (e) {
        console.error('Error parsing cached data:', e);
      }
    }

    if (!proposalsData) {
      const query = `
        query proposals($where: Proposal_filter, $first: Int!, $skip: Int) {
          proposals(
            where: $where
            first: $first
            skip: $skip
            orderBy: timeCreated
            orderDirection: desc
          ) {
            ...Proposal
            votes {
              ...ProposalVote
            }
          }
        }
        fragment Proposal on Proposal {
          abstainVotes
          againstVotes
          calldatas
          description
          descriptionHash
          executableFrom
          expiresAt
          forVotes
          proposalId
          proposalNumber
          proposalThreshold
          proposer
          quorumVotes
          targets
          timeCreated
          title
          values
          voteEnd
          voteStart
          snapshotBlockNumber
          transactionHash
          dao {
            governorAddress
            tokenAddress
          }
        }
        fragment ProposalVote on ProposalVote {
          voter
          support
          weight
          reason
        }
      `;

      const response = await fetch(NOUNS_BUILDER_GOLDSKY_SUBGRAPH_URL, {
        method: 'POST',
        headers: {
          'Accept': '*/*',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables: {
            where: { dao: contractAddress },
            first,
            skip,
          },
          operationName: "proposals",
        }),
      });

      if (!response.ok) {
        throw new Error(`Error fetching proposals: ${response.statusText}`);
      }

      const jsonData: GoldskyResponse = await response.json();
      proposalsData = jsonData;
      await redis.set(proposalsCacheKey, JSON.stringify(proposalsData), { ex: 30 * 60 });
    }

    if (!proposalsData) {
      throw new Error("Proposals data is null or undefined.");
    }

    return new Response(JSON.stringify({ proposals: proposalsData.data.proposals }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ message: (error as Error).message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}