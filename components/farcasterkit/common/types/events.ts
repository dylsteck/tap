export type EventcasterEvent = {
  id: string;
  title: string;
  start_date: number;
  end_date: number;
  display_tz: string;
  frame_display_time?: string;
  hosts: {
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    custody_address?: string;
    follower_count?: number;
    following_count?: number;
    verified_addresses?: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    verified_accounts?: {
      platform: string;
      username: string;
    }[];
    power_badge?: boolean;
    location?: {
      latitude: number;
      longitude: number;
      address: {
        city: string;
        state: string;
        state_code: string;
        country: string;
        country_code: string;
      };
    };
    profile?: {
      bio: {
        text: string;
      };
    };
  }[];
  image_url?: string;
  description?: string;
  time_zone?: string;
  time_zone_full?: string;
  city?: boolean;
  going_count?: number;
  capacity?: number;
  palette?: {
    color?: string;
    fill?: string;
    accent_border?: string;
    border_color?: string;
    background?: string;
    accent?: string;
    accent_font?: {
      style?: {
        fontFamily?: string;
        fontStyle?: string;
      };
      className?: string;
    };
    text_font?: {
      style?: {
        fontFamily?: string;
        fontStyle?: string;
      };
      className?: string;
    };
  };
  channel?: {
    id?: string;
    url?: string;
    name?: string;
    image_url?: string;
    header_image_url?: string;
    external_link?: {
      title?: string;
      url?: string;
    };
    description?: string;
    public_casting?: boolean;
    follower_count?: number;
    member_count?: number;
    pinned_cast_hash?: string;
    created_at?: number;
    parent_url?: string;
    moderator_fids?: number[];
    lead?: {
      fid: number;
      username: string;
      display_name: string;
      pfp_url: string;
      custody_address?: string;
      follower_count?: number;
      following_count?: number;
      verified_addresses?: {
        eth_addresses: string[];
        sol_addresses: string[];
      };
      verified_accounts?: {
        platform: string;
        username: string;
      }[];
      power_badge?: boolean;
      location?: {
        latitude: number;
        longitude: number;
        address: {
          city: string;
          state: string;
          state_code: string;
          country: string;
          country_code: string;
        };
      };
      profile?: {
        bio: {
          text: string;
        };
      };
    };
  };
  context?: {
    is_online?: boolean;
    is_pinned?: boolean;
    is_shared?: boolean;
    is_ended?: boolean;
    is_started?: boolean;
    is_today?: boolean;
    is_going?: boolean;
    is_applied?: boolean;
    is_attended?: boolean;
  };
  cover_url?: string;
  location?: {
    address: {
      city: string;
      state: string;
    };
  };
  tags?: string[];
}