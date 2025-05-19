export interface Bounty {
  current_state: string;
  uid: string;
  links: {
      external: string;
      resource: string;
  };
  poster: {
      uid: string;
      links: {
          external: string;
      };
      short_name: string;
      display_name: string;
      profile_picture: string;
      bio: string;
      channels: any[];
      platform: {
          type: string;
          username: string;
          id: string;
      };
  };
  last_updated: string;
  created_at: string;
  timestamp: string;
  is_pinned: boolean;
  attestations: any[];
  summary_text: string;
  tag_slugs: string[];
  token_symbol_display: string;
  swap_link: string | null;
  expiration_date: string;
  completion_date: string | null;
  is_boosted: boolean;
  rating: number;
  platform: {
      type: string;
      tweet_id: string;
  };
  title: string;
  channel: string | null;
  stats: {
      replies: number;
      reactions: number;
      recasts: number;
  };
  quota: {
      total: number;
      remaining: number;
  };
  reward_summary: {
      num_contributions: number;
      token: {
          symbol: string;
          image_url: string;
          metadata: {
              chain: number;
              decimals: number;
              type: string;
              address: string;
          };
      };
      unit_amount: string;
      usd_value: string;
  };
  embeds: any[];
  feed: any[];
  is_payable_via_widget: boolean;
  max_payable_on_site: string;
  contributions: Array<{
      amount: string;
      is_op: boolean;
      profile: {
          uid: string;
          links: {
              external: string;
          };
          short_name: string;
          display_name: string;
          profile_picture: string;
          bio: string;
          channels: any[];
          platform: {
              type: string;
              username: string;
              id: string;
          };
      };
  }>;
  prize_distribution: any | null;
  mode: string;
  num_completed_bounties_posted_by_profile: number;
}