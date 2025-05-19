import { TapSDK } from "@tap/sdk";

export const CACHE_EX_SECONDS = 3600; // 1 hour
export const CAST_HASH_LENGTH = 42;

export const MODEL_NAME = 'gpt-4.1-mini-2025-04-14';

export const tapSDK = TapSDK.getInstance(); 

export const WEB_BASE_URL = 'https://tap.computer';
export const SERVER_BASE_URL = 'https://api.tap.computer';
export const BANNER_IMG_URL = 'https://i.imgur.com/IufIWER.png';
export const VIDEOS_BANNER_IMG_URL = 'https://i.imgur.com/KMvTZXI.png';
export const ICON_IMG_URL = 'https://i.imgur.com/8Knijje.png';
export const USER_FALLBACK_IMG_URL = 'https://i.imgur.com/sosbyP2.png';

export const createFrame = (title = "watch videos", imageUrl = BANNER_IMG_URL, baseUrl = WEB_BASE_URL, urlSuffix = "/videos") => {
  return {
    version: "next",
    imageUrl: imageUrl,
    button: {
      title: title,
      action: {
        type: "launch_frame",
        name: "tap",
        url: `${baseUrl}${urlSuffix}`,
        splashImageUrl: ICON_IMG_URL,
        splashBackgroundColor: "#000000",
      },
    },
  };
}

export function timeAgo(timestamp: string): string {
  const now = new Date()
  const past = new Date(timestamp)
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
    { label: 's', seconds: 1 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count}${interval.label} ago`
    }
  }

  return 'just now'
}

export function formatAmount(num: number): string {
  if (num < 1000) {
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 5,
    })
  }
  const units = ['K', 'M', 'B', 'T']
  const unitIndex = Math.floor(Math.log10(num) / 3) - 1
  const unitValue = 1000 ** (unitIndex + 1)
  const value = num / unitValue
  const formattedNumber = Number.isInteger(value) ? value.toString() : value.toFixed(1)
  return `${formattedNumber}${units[unitIndex] ?? ''}`
}

export function formatPrice(price: number) {
  // examples: 50k, 52.4m, 1.2b
  // source: https://github.com/NickTikhonov/clankfun/blob/df31e7723478090c5c798e9399516be5e0c2bfc8/src/app/components/ClankerCard.tsx#L529
  if (price < 1000) {
    return price.toFixed(2);
  } else if (price < 1000000) {
    return (price / 1000).toFixed(2) + "k";
  } else if (price < 1000000000) {
    return (price / 1000000).toFixed(2) + "m";
  } else {
    return (price / 1000000000).toFixed(2) + "b";
  }
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export interface ApplicationError extends Error {
  info?: any;
  status?: number;
}
