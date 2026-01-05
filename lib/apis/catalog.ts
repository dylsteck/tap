// API Catalog - Pre-configured integrations for miniapp generation
// Each API has documentation, usage examples, and type definitions

export interface APICatalogEntry {
  id: string;
  name: string;
  emoji: string;
  description: string;
  category: 'social' | 'nft' | 'defi' | 'data' | 'blockchain';
  docsUrl: string;
  envVars: string[];
  codeExamples: {
    title: string;
    code: string;
  }[];
  types?: string;
}

export const API_CATALOG: Record<string, APICatalogEntry> = {
  neynar: {
    id: 'neynar',
    name: 'Neynar',
    emoji: '🟣',
    description: 'Farcaster API for users, casts, channels, and more',
    category: 'social',
    docsUrl: 'https://docs.neynar.com',
    envVars: ['NEYNAR_API_KEY'],
    codeExamples: [
      {
        title: 'Fetch user by FID',
        code: `// Fetch a Farcaster user by their FID
const response = await fetch('/api/neynar/user?fid=3', {
  headers: { 'Content-Type': 'application/json' }
});
const { user } = await response.json();
// user.username, user.pfp_url, user.follower_count, etc.`
      },
      {
        title: 'Fetch user casts',
        code: `// Get recent casts from a user
const response = await fetch('/api/neynar/casts?fid=3&limit=25');
const { casts } = await response.json();
// casts[].text, casts[].timestamp, casts[].reactions, etc.`
      },
      {
        title: 'Search channels',
        code: `// Search Farcaster channels
const response = await fetch('/api/neynar/channels?query=ethereum');
const { channels } = await response.json();
// channels[].id, channels[].name, channels[].follower_count`
      }
    ],
    types: `interface FarcasterUser {
  fid: number;
  username: string;
  display_name: string;
  pfp_url: string;
  follower_count: number;
  following_count: number;
  custody_address: string;
  verified_addresses: { eth_addresses: string[] };
}`
  },

  zora: {
    id: 'zora',
    name: 'Zora Coins',
    emoji: '🪙',
    description: 'Zora Coins protocol - trade creator coins and content coins',
    category: 'social',
    docsUrl: 'https://docs.zora.co/coins',
    envVars: ['ZORA_API_KEY'],
    codeExamples: [
      {
        title: 'Get coin info',
        code: `// Get coin details by address
const response = await fetch('/api/zora/collection?address=0x...&chain=8453');
const { coin } = await response.json();
// coin.name, coin.symbol, coin.totalSupply, coin.marketCap`
      },
      {
        title: 'Get user profile & holdings',
        code: `// Fetch user's coin holdings
const response = await fetch('/api/zora/profile?identifier=0x...');
const { profile } = await response.json();
// profile.holdings[], profile.createdCoins[], profile.totalValueUsd`
      },
      {
        title: 'Explore trending coins',
        code: `// Discover trending coins on Base
const response = await fetch('/api/zora/explore?type=trending&limit=20');
const { coins } = await response.json();
// coins[].address, coins[].name, coins[].priceChange24h`
      },
      {
        title: 'Trade coin transaction',
        code: `// Buy or sell a Zora Coin
import { useWriteContract } from 'wagmi';
import { zoraCoinABI } from '@/lib/abis/zora-coin';

const { writeContract } = useWriteContract();
// Buy coins
await writeContract({
  address: coinAddress,
  abi: zoraCoinABI,
  functionName: 'buy',
  args: [minAmountOut, recipient, referrer],
  value: ethAmount,
});`
      }
    ],
    types: `interface ZoraCoin {
  address: string;
  name: string;
  symbol: string;
  totalSupply: string;
  marketCap: string;
  priceUsd: number;
  priceChange24h: number;
  volume24h: string;
  creator: string;
  backingCurrency: string;
}

interface CoinHolding {
  coin: ZoraCoin;
  balance: string;
  balanceUsd: number;
}`
  },

  zapper: {
    id: 'zapper',
    name: 'Zapper',
    emoji: '⚡',
    description: 'DeFi portfolio tracking and token balances',
    category: 'defi',
    docsUrl: 'https://studio.zapper.xyz',
    envVars: ['ZAPPER_API_KEY'],
    codeExamples: [
      {
        title: 'Get portfolio value',
        code: `// Fetch user's total portfolio value
const response = await fetch('/api/zapper/portfolio?address=0x...');
const { totalUsd, tokens } = await response.json();
// totalUsd: total portfolio value in USD
// tokens[]: list of tokens with balances`
      },
      {
        title: 'Get token balances',
        code: `// Get all token balances for an address
const response = await fetch('/api/zapper/balances?address=0x...');
const { balances } = await response.json();
// balances[].symbol, balances[].balance, balances[].balanceUsd`
      },
      {
        title: 'Get NFT holdings',
        code: `// Fetch user's NFT collection
const response = await fetch('/api/zapper/nfts?address=0x...');
const { nfts } = await response.json();
// nfts[].name, nfts[].image, nfts[].collection`
      }
    ],
    types: `interface PortfolioBalance {
  symbol: string;
  name: string;
  balance: string;
  balanceUsd: number;
  price: number;
  network: string;
}`
  },

  coingecko: {
    id: 'coingecko',
    name: 'CoinGecko',
    emoji: '🦎',
    description: 'Cryptocurrency prices, charts, and market data',
    category: 'data',
    docsUrl: 'https://www.coingecko.com/api/documentation',
    envVars: ['COINGECKO_API_KEY'],
    codeExamples: [
      {
        title: 'Get token price',
        code: `// Fetch current token price
const response = await fetch('/api/coingecko/price?ids=ethereum,bitcoin');
const prices = await response.json();
// prices.ethereum.usd, prices.bitcoin.usd`
      },
      {
        title: 'Get price history',
        code: `// Fetch 7-day price history
const response = await fetch('/api/coingecko/history?id=ethereum&days=7');
const { prices } = await response.json();
// prices[]: array of [timestamp, price] tuples`
      },
      {
        title: 'Search tokens',
        code: `// Search for tokens by name
const response = await fetch('/api/coingecko/search?query=pepe');
const { coins } = await response.json();
// coins[].id, coins[].name, coins[].symbol, coins[].market_cap_rank`
      }
    ],
    types: `interface TokenPrice {
  usd: number;
  usd_24h_change: number;
  usd_market_cap: number;
  last_updated_at: number;
}`
  },

  alchemy: {
    id: 'alchemy',
    name: 'Alchemy',
    emoji: '🔮',
    description: 'Blockchain data, NFT metadata, and transaction history',
    category: 'blockchain',
    docsUrl: 'https://docs.alchemy.com',
    envVars: ['ALCHEMY_API_KEY'],
    codeExamples: [
      {
        title: 'Get NFTs for address',
        code: `// Fetch all NFTs owned by an address
const response = await fetch('/api/alchemy/nfts?address=0x...');
const { ownedNfts } = await response.json();
// ownedNfts[].title, ownedNfts[].media, ownedNfts[].contract`
      },
      {
        title: 'Get token balances',
        code: `// Fetch ERC-20 token balances
const response = await fetch('/api/alchemy/tokens?address=0x...');
const { tokenBalances } = await response.json();
// tokenBalances[].contractAddress, tokenBalances[].tokenBalance`
      },
      {
        title: 'Get transaction history',
        code: `// Fetch recent transactions
const response = await fetch('/api/alchemy/transfers?address=0x...');
const { transfers } = await response.json();
// transfers[].from, transfers[].to, transfers[].value, transfers[].asset`
      }
    ],
    types: `interface AlchemyNFT {
  contract: { address: string };
  id: { tokenId: string };
  title: string;
  description: string;
  media: { gateway: string }[];
  metadata: Record<string, any>;
}`
  },
};

// Get API context for AI generation
export function getAPIContext(apiIds: string[]): string {
  const apis = apiIds.map(id => API_CATALOG[id]).filter(Boolean);
  
  if (apis.length === 0) return '';
  
  let context = '\n\n## Available API Integrations\n';
  
  for (const api of apis) {
    context += `\n### ${api.name} (${api.description})\n`;
    context += `Use these patterns when integrating ${api.name}:\n`;
    
    for (const example of api.codeExamples) {
      context += `\n**${example.title}:**\n\`\`\`typescript\n${example.code}\n\`\`\`\n`;
    }
    
    if (api.types) {
      context += `\n**Types:**\n\`\`\`typescript\n${api.types}\n\`\`\`\n`;
    }
  }
  
  return context;
}

// Available APIs list for UI
export const AVAILABLE_APIS = Object.values(API_CATALOG).map(api => ({
  id: api.id,
  name: api.name,
  emoji: api.emoji,
  description: api.description,
  category: api.category,
}));

