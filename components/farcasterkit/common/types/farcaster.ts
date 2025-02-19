// ============================================================================
// Warpcast Types
// ============================================================================

export interface WarpcastCastsResponse {
    result: {
        casts: WarpcastCast[]
    }
}

export interface WarpcastCast {
    hash: string
    threadHash: string
    parentHash?: string
    parentAuthor?: {
        fid: number
        username: string
        displayName: string
        profile: {
            bio: {
                text: string
                mentions: string[]
                channelMentions: string[]
            }
            location: {
                placeId: string
                description: string
            }
        }
        followerCount: number
        followingCount: number
        activeOnFcNetwork: boolean
    }
    parentSource?: {
        type: string
        url: string
    }
    author: {
        fid: number
        username: string
        displayName: string
        pfp?: {
            url: string
            verified: boolean
        }
        profile: {
            bio: {
                text: string
                mentions: string[]
                channelMentions: string[]
            }
            location: {
                placeId: string
                description: string
            }
        }
        followerCount: number
        followingCount: number
        activeOnFcNetwork: boolean
        viewerContext: {
            following: boolean
            blockedBy: boolean
        }
    }
    castType?: string
    text?: string
    timestamp: number
    mentions: {
        fid?: number
        username?: string
        displayName?: string
        profile?: {
            bio: {
                text: string
                mentions: string[]
                channelMentions: string[]
            }
            location: {
                placeId: string
                description: string
            }
        }
        followerCount?: number
        followingCount?: number
    }[]
    ancestors: {
        count: number
        casts?: WarpcastCast[]
    }
    replies: {
        count: number
    }
    reactions: {
        count: number
    }
    recasts: {
        count: number
    }
    watches: {
        count: number
    }
    tags: {
        type: string
        id: string
        name: string
        imageUrl: string
    }[]
    quoteCount?: number
    combinedRecastCount?: number
    warpsTipped?: number
    viewCount?: number
    channel: {
        key: string
        name: string
        imageUrl: string
        authorContext: {
            role: string
            restricted: boolean
            banned: boolean
        }
        authorRole: string
    }
    viewerContext: {
        reacted: boolean
        recast: boolean
        bookmarked: boolean
    }
    channelMentions?: {
        key: string
        name: string
    }[]
    embeds?: {
        images: {
            type: string
            url: string
            sourceUrl?: string
            media?: {
                version: string
                width: number
                height: number
                staticRaster: string
            }
            alt?: string
        }[]
        urls: {
            type: string
            openGraph: {
                url: string
                sourceUrl: string
                title: string
                domain: string
                image: string
                useLargeImage?: boolean
                frame: {
                    version: string
                    frameUrl: string
                    imageUrl: string
                    postUrl: string
                    buttons: {
                        index: number
                        title: string
                        type: string
                    }[]
                    imageAspectRatio: string
                }
            }
        }[]
        videos: any[]
        unknowns: any[]
        processedCastText: string
        groupInvites: any[]
    }
}

export interface WarpcastUserResponse {
    result: {
      user: WarpcastUser
  }
};  

export interface WarpcastUser {
    fid: number;
    username: string;
    displayName: string;
    pfp: {
      url: string;
      verified: boolean;
    };
    profile: {
      bio: {
        text: string;
        mentions: string[];
        channelMentions: string[];
      };
      location: {
        placeId: string;
        description: string;
      };
    };
    followerCount: number;
    followingCount: number;
    referrerUsername: string;
    connectedAccounts: {
      connectedAccountId: string;
      platform: string;
      username: string;
      expired: boolean;
    }[];
    viewerContext: {
      following: boolean;
      followedBy: boolean;
      canSendDirectCasts: boolean;
      enableNotifications: boolean;
      hasUploadedInboxKeys: boolean;
    };
    collectionsOwned: any[];
    extras: {
      fid: number;
      custodyAddress: string;
      ethWallets: string[];
      solanaWallets: string[];
    };
}

// ============================================================================
// Neynar Types
// ============================================================================

export interface NeynarCastV2 {
    object: string;
    hash: string;
    thread_hash: string;
    parent_hash: string | null;
    parent_url: string | null;
    root_parent_url: string | null;
    parent_author: {
      fid: number | null;
    };
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
      };
      follower_count: number;
      following_count: number;
      verifications: string[];
      verified_addresses: {
        eth_addresses: string[];
        sol_addresses: string[];
      };
      verified_accounts: {
        platform: string;
        username: string;
      }[] | null;
      power_badge: boolean;
    };
    text: string;
    timestamp: string;
    embeds: {
      url: string;
      metadata?: {
        content_type: string;
        content_length: number | null;
        _status: string;
        image?: {
          width_px: number;
          height_px: number;
        };
        html?: {
          favicon: string;
          ogImage: { url: string }[];
          ogTitle: string;
          ogLocale: string;
          ogDescription: string;
        };
      };
    }[];
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
    channel: {
      object: string;
      id: string;
      name: string;
      image_url: string;
    } | null;
    mentioned_profiles: any[];
    author_channel_context?: {
      role: string;
      following: boolean;
    };
    tags?: {
      type?: string;
      id?: string;
      name?: string;
      imageUrl?: string;
    }[];
}