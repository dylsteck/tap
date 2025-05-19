export type ClankerTrendingTokensResponse = {
  trending: {
    id: string;
    type: string;
    attributes: {
      base_token_price_usd: string;
      base_token_price_native_currency: string;
      quote_token_price_usd: string;
      quote_token_price_native_currency: string;
      base_token_price_quote_token: string;
      quote_token_price_base_token: string;
      address: string;
      name: string;
      pool_created_at: string;
      fdv_usd: string;
      market_cap_usd: string | null;
      price_change_percentage: {
        m5: string;
        h1: string;
        h6: string;
        h24: string;
      };
      reserve_in_usd: string;
      h24_volume_usd: string;
      h24_tx_count: number;
    };
    relationships: {
      base_token: {
        data: {
          id: string;
          type: string;
        };
      };
      quote_token: {
        data: {
          id: string;
          type: string;
        };
      };
      network: {
        data: {
          id: string;
          type: string;
        };
      };
      dex: {
        data: {
          id: string;
          type: string;
        };
      };
    };
  }[];
  tokens: {
    [key: string]: {
      id: number;
      created_at: string;
      tx_hash: string;
      contract_address: string;
      requestor_fid: number | null;
      name: string;
      symbol: string;
      img_url: string | null;
      pool_address: string;
      cast_hash: string | null;
      type: string | null;
      pair: string | null;
      presale_id: string | null;
    };
  };
};

export type MergedClanker = {
  id: ClankerTrendingTokensResponse['trending'][number]['id'];
  type: ClankerTrendingTokensResponse['trending'][number]['type'];
  attributes: ClankerTrendingTokensResponse['trending'][number]['attributes'];
  relationships: ClankerTrendingTokensResponse['trending'][number]['relationships'];
  token: {
      id: ClankerTrendingTokensResponse['tokens'][string]['id'];
      contract_address: ClankerTrendingTokensResponse['tokens'][string]['contract_address'];
      name: ClankerTrendingTokensResponse['tokens'][string]['name'];
      symbol: ClankerTrendingTokensResponse['tokens'][string]['symbol'];
      img_url: ClankerTrendingTokensResponse['tokens'][string]['img_url'];
  };
}

export type ClankerSearchResult = {
  id: string;
  contract_address: string;
  name: string;
  symbol: string;
  img_url: string | null;
}

export type ClankerSearchResponse = {
  query: string;
  results: ClankerSearchResult[];
}

export type ClankerTrendingResponse = {
  time_window: string;
  results: MergedClanker[];
}

export type ClankerAddressResult = {
  contract_address: string;
  name: string;
  symbol: string;
  balance: string;
  value_usd: string;
}

export type ClankerAddressResponse = {
  address: string;
  results: ClankerAddressResult[];
}