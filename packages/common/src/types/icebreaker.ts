export type IcebreakerBaseResult = {
  id: string;
  type: string;
  timestamp: string;
}

export type IcebreakerEnsResult = IcebreakerBaseResult & {
  name: string;
  address: string;
  expiration_date: string | null;
}

export type IcebreakerEnsResponse = {
  profiles: IcebreakerProfile[];
}

export type IcebreakerEthResult = IcebreakerBaseResult & {
  token_address: string;
  token_name: string;
  token_symbol: string;
  balance: string;
  value_usd: string | null;
  token_type: 'ERC20' | 'ERC721' | 'ERC1155' | 'NATIVE';
}

export type IcebreakerEthResponse = {
  profiles: IcebreakerProfile[];
}

export type IcebreakerChannelMetadata = {
  name: string;
  value: string;
}

export type IcebreakerChannel = {
  type: string;
  value: string;
  isVerified: boolean;
  isLocked: boolean;
  url: string;
  metadata?: IcebreakerChannelMetadata[];
}

export type IcebreakerCredential = {
  name: string;
  chain: string;
  source: string;
  reference: string;
}

export type IcebreakerGuild = {
  guildId: number;
  joinedAt: string;
  roleIds: number[];
  isAdmin: boolean;
  isOwner: boolean;
}

export type IcebreakerEvent = {
  id: string;
  source: string;
  city: string;
  country: string;
  description: string;
  endDate: string;
  eventUrl: string;
  expiryDate: string;
  imageUrl: string;
  name: string;
  startDate: string;
  year: string;
}

export type IcebreakerProfile = {
  profileID: string;
  walletAddress: string;
  avatarUrl: string;
  displayName: string;
  bio: string;
  jobTitle: string;
  primarySkill: string;
  networkingStatus: string;
  location: string;
  channels: IcebreakerChannel[];
  credentials: IcebreakerCredential[];
  highlights: any[]; // Could be typed more specifically if structure is known
  workExperience: any[]; // Could be typed more specifically if structure is known
  guilds: IcebreakerGuild[];
  events: IcebreakerEvent[];
}

export type IcebreakerFidResponse = {
  profiles: IcebreakerProfile[];
}

export type IcebreakerFnameResult = IcebreakerBaseResult & {
  name: string;
  owner: string;
  expiration_date: string | null;
}

export type IcebreakerFnameResponse = {
  profiles: IcebreakerProfile[];
}

export type IcebreakerCredentialResult = IcebreakerBaseResult & {
  credential_type: string;
  issuer: string;
  issued_at: string;
  expires_at: string | null;
  metadata: Record<string, any>;
}

export type IcebreakerCredentialsResponse = {
  profiles: IcebreakerProfile[];
}

export type IcebreakerSocialResponse = {
  profiles: IcebreakerProfile[];
} 