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
  results: IcebreakerEnsResult[];
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
  address: string;
  results: IcebreakerEthResult[];
}

export type IcebreakerFidResult = IcebreakerBaseResult & {
  fid: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export type IcebreakerFidResponse = {
  fid: string;
  results: IcebreakerFidResult[];
}

export type IcebreakerFnameResult = IcebreakerBaseResult & {
  name: string;
  owner: string;
  expiration_date: string | null;
}

export type IcebreakerFnameResponse = {
  name: string;
  results: IcebreakerFnameResult[];
}

export type IcebreakerCredentialResult = IcebreakerBaseResult & {
  credential_type: string;
  issuer: string;
  issued_at: string;
  expires_at: string | null;
  metadata: Record<string, any>;
}

export type IcebreakerCredentialsResponse = {
  address: string;
  type?: string;
  results: IcebreakerCredentialResult[];
} 