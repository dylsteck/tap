import {
  Action,
  Credential,
  CredentialRequirements,
  CredentialType,
  CredentialWithId,
  ERC20CredentialRequirement,
  ERC721CredentialRequirement,
  FarcasterFidCredentialRequirement,
  NativeCredentialRequirement,
} from './types'

export const CREDENTIAL_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 7 // 7 days

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

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getUsableCredential(credentials: Credential[], action: Action) {
  const credentialType = action.credential_id?.split(':')[0] as CredentialType | undefined

  if (
    !action.credential_id ||
    credentials.length === 0 ||
    !action.credential_requirement ||
    !credentialType
  ) {
    return
  }

  const potentialCredentials = credentials
    .filter((credential) => {
      const isExpired =
        new Date(credential.verified_at).getTime() + CREDENTIAL_EXPIRATION_TIME <=
        Date.now()
      if (isExpired) return false

      const actionCredentialType = action.credential_id?.split(':')[0] as
        | CredentialType
        | undefined
      if (
        !actionCredentialType ||
        credential.type !== actionCredentialType ||
        !action.credential_requirement
      )
        return false

      if (
        credential.type === CredentialType.ERC20_BALANCE ||
        credential.type === CredentialType.ERC721_BALANCE
      ) {
        const req = action.credential_requirement as
          | ERC20CredentialRequirement
          | ERC721CredentialRequirement
        return (
          credential.metadata.tokenAddress === req.tokenAddress &&
          credential.metadata.chainId === req.chainId &&
          BigInt(credential.metadata.balance) >= BigInt(req.minimumBalance)
        )
      }

      if (credential.type === CredentialType.FARCASTER_FID) {
        const req = action.credential_requirement as FarcasterFidCredentialRequirement
        return credential.metadata.fid >= req.fid
      }

      if (credential.type === CredentialType.NATIVE_BALANCE) {
        const req = action.credential_requirement as NativeCredentialRequirement
        const isChainValid =
          req.chainId === 0 || req.chainId === credential.metadata.chainId
        return (
          isChainValid &&
          BigInt(credential.metadata.balance) >= BigInt(req.minimumBalance)
        )
      }

      return false
    })
    .sort((a, b) => {
      const aBalance = BigInt('balance' in a.metadata ? a.metadata.balance : 0)
      const bBalance = BigInt('balance' in b.metadata ? b.metadata.balance : 0)
      if (aBalance === bBalance) {
        return 0
      }
      return aBalance < bBalance ? -1 : 1
    })

  return potentialCredentials[0]
}

export function validateCredentialRequirements(
  credentials: Credential[],
  credentialRequirement: CredentialRequirements
) {
  if (credentials.length === 0) {
    return
  }

  const potentialCredentials = credentials
    .filter((credential) => {
      const isExpired =
        new Date(credential.verified_at).getTime() + CREDENTIAL_EXPIRATION_TIME <=
        Date.now()
      if (isExpired || credential.type !== credentialRequirement.type) return false

      if (
        credential.type === CredentialType.ERC20_BALANCE ||
        credential.type === CredentialType.ERC721_BALANCE
      ) {
        const req = credentialRequirement.data as
          | ERC20CredentialRequirement
          | ERC721CredentialRequirement
        return (
          credential.metadata.tokenAddress === req.tokenAddress &&
          credential.metadata.chainId === req.chainId &&
          BigInt(credential.metadata.balance) >= BigInt(req.minimumBalance)
        )
      }

      if (credential.type === CredentialType.FARCASTER_FID) {
        const req = credentialRequirement.data as FarcasterFidCredentialRequirement
        return credential.metadata.fid >= req.fid
      }

      if (credential.type === CredentialType.NATIVE_BALANCE) {
        const req = credentialRequirement.data as NativeCredentialRequirement
        const isChainValid =
          req.chainId === 0 || req.chainId === credential.metadata.chainId
        return (
          isChainValid &&
          BigInt(credential.metadata.balance) >= BigInt(req.minimumBalance)
        )
      }

      return false
    })
    .sort((a, b) => {
      const aBalance = BigInt('balance' in a.metadata ? a.metadata.balance : 0)
      const bBalance = BigInt('balance' in b.metadata ? b.metadata.balance : 0)
      if (aBalance === bBalance) {
        return 0
      }
      return aBalance < bBalance ? -1 : 1
    })

  return potentialCredentials[0]
}

export function formatHexId(hex: string) {
  let str = ''
  for (let i = 2; i < hex.length - 1; i += 2) {
    const num = Number.parseInt(hex.slice(i, i + 2), 16)
    if (!Number.isNaN(num)) {
      // Ensure we only get values 0-61
      const code = Math.abs(num) % 62
      // 0-9: 48-57 in ASCII
      // A-Z: 65-90 in ASCII
      // a-z: 97-122 in ASCII
      if (code < 10) {
        str += String.fromCharCode(48 + code) // 0-9
      } else if (code < 36) {
        str += String.fromCharCode(65 + (code - 10)) // A-Z
      } else {
        str += String.fromCharCode(97 + (code - 36)) // a-z
      }
    }
  }
  return str.slice(0, 8)
}

export function toHslColors(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return {
    background: `hsl(${hue}, 70%, 85%)`,
    secondary: `hsl(${hue}, 70%, 50%)`,
    color: `hsl(${hue}, 70%, 15%)`,
  }
}

function hslToHex(h: number, s: number, l: number): string {
  l /= 100
  const a = (s * Math.min(l, 1 - l)) / 100

  const f = (n: number) => {
    const k = (n + h / 30) % 12
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0')
  }

  return `#${f(0)}${f(8)}${f(4)}`
}

export function toHexColors(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash % 360)
  return {
    background: hslToHex(hue, 70, 85),
    secondary: hslToHex(hue, 70, 50),
    color: hslToHex(hue, 70, 15),
  }
}

export function encodeJson(obj: any): string {
  if (Array.isArray(obj)) {
    return '[' + obj.map(encodeJson).join(',') + ']'
  }

  if (typeof obj === 'object' && obj !== null) {
    return (
      '{' +
      Object.keys(obj)
        .sort()
        .map((key) => `"${key}":${encodeJson(obj[key])}`)
        .join(',') +
      '}'
    )
  }

  return JSON.stringify(obj)
}

export function isAndroid(): boolean {
  return typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent)
}

export function isSmallIOS(): boolean {
  return typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent)
}

export function isLargeIOS(): boolean {
  return (
    typeof navigator !== 'undefined' &&
    (/iPad/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  )
}

export function isIOS(): boolean {
  return isSmallIOS() || isLargeIOS()
}

export function isMobile(): boolean {
  return isAndroid() || isIOS()
}

export function generateIdempotencyKey(): string {
  return crypto.randomUUID().replace(/-/g, '')
}
