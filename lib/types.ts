// ============================================================================
// Auth Types
// ============================================================================

export interface SIWNUser {
    fid: number;
    username: string;
    displayName: string;
    pfp: string;
}

export interface SIWNResponseData {
    success: boolean;
    data?: {
        user: SIWNUser;
    };
    error?: string;
}

export type AuthData = {
  fid: string;
  username: string;
  name: string;
  bio: string;
  verified_address?: string;
  signer_uuid: string;
  pfp_url: string;
  message?: string;
  signature?: string;
};

export type SessionData = {
  fid: string;
  username: string;
  name: string;
  bio: string;
  verified_address?: string;
  pfp_url: string;
  createdAt: string;
};

export type FarcasterApp = {
  slug: string;
  name: string;
  tag: string;
  description: string;
  imageUrl: string;
  screenshots: string[];
  url: string;
  authorFid?: number;
};

// ============================================================================
// Chat Types
// ============================================================================

export type ChatProfileId = 'farcaster' | 'clanker' | 'bountycaster' | 'base';

// ============================================================================
// ENS Data Types
// ============================================================================

export type ENSData = {
  address: string;
  avatar: string;
  avatar_small: string;
  avatar_url: string;
  contentHash: string;
  ens: string;
  ens_primary: string;
  expiry_date: string;
  farcaster: {
    custody_address: string;
    display_name: string;
    fid: number;
    follower_count: number;
    following_count: number;
    object: string;
    pfp_url: string;
    power_badge: boolean;
    profile: {
      bio: {
        text: string;
      };
      location: {
        address: {
          city: string;
          country: string;
          country_code: string;
          state: string;
          state_code: string;
        };
        latitude: number;
        longitude: number;
      };
    };
    username: string;
    verifications: string[];
    verified_accounts: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
  };
  github: string;
  header: string;
  header_url: string;
  resolverAddress: string;
  twitter: string;
  url: string;
  wallets: {
    eth: string;
  };
}