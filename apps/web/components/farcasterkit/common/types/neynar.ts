export type NeynarFeedResponse = {
  result: {
    casts: NeynarCastV2[];
  };
};

export type NeynarCastV2 = {
  object: string;
  hash: string;
  author: {
    object: string;
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
    custody_address: string;
    profile: {
      bio: {
        text: string;
      };
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
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    verified_accounts?: {
      platform: string;
      username: string;
    }[];
    power_badge: boolean;
    viewer_context: {
      following: boolean;
      followed_by: boolean;
      blocking: boolean;
      blocked_by: boolean;
    };
  };
  app: {
    object: string;
    fid: number;
    username: string;
    display_name: string;
    pfp_url: string;
  };
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: {
    fid: number | null;
  };
  text: string;
  timestamp: string;
  embeds: {
    url: string;
    metadata: {
      content_type: string;
      content_length: number | null;
      _status: string;
      video?: {
        streams: {
          height_px: number;
          width_px: number;
          codec_name: string;
        }[];
        duration_s: number;
      };
      html?: {
        ogUrl: string;
        ogType: string;
        favicon: string;
        ogImage: {
          url: string;
        }[];
        ogTitle: string;
        ogVideo?: {
          url: string;
        }[];
        ogLocale: string;
        ogDescription: string;
      };
    };
  }[];
  channel: {
    object: string;
    id: string;
    name: string;
    image_url: string;
    viewer_context: {
      following: boolean;
    };
  } | null;
  reactions: {
    likes_count: number;
    recasts_count: number;
    likes: {
      fid: number;
      fname: string;
    }[];
    recasts: {
      fid: number;
      fname: string;
    }[];
  };
  replies: {
    count: number;
  };
  mentioned_profiles: {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
        mentioned_profiles?: any[];
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    power_badge: boolean;
  }[];
  mentioned_profiles_ranges: {
    start: number;
    end: number;
  }[];
  mentioned_channels: {
    object: string;
    id: string;
    name: string;
  }[];
  mentioned_channels_ranges: {
    start: number;
    end: number;
  }[];
  viewer_context: {
    liked: boolean;
    recasted: boolean;
  };
  author_channel_context?: {
    role: string;
    following: boolean;
  };
  frames?: {
      version: string;
      title: string;
      image: string;
      image_aspect_ratio: string;
      buttons: {
          index: number;
          title: string;
          action_type: string;
          target: string;
      }[];
      input: {};
      state: {};
      frames_url: string;
  }[];
};