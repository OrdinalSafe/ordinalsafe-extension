export const isDevelopment = process.env.NODE_ENV === 'development';

export const API_URL = 'https://api.ordinalsafe.xyz/v2';
export const TESTNET_API_URL = 'https://testnet-api.ordinalsafe.xyz/v2';
export const BRC20_BIS_URL = 'https://brc20api.bestinslot.xyz/v1';
export const BIS_CDN_URL =
  'https://bis-ord-content.fra1.cdn.digitaloceanspaces.com/ordinals';

export const ALLOWED_MIME_TYPES_TO_SIMPLE_TYPES = {
  'image/jpeg': 'image',
  'image/png': 'image',
  'image/gif': 'image',
  'image/webp': 'image',
  'image/svg+xml': 'image',
  'application/json': 'json',
  'text/html;charset=utf-8': 'html',
  'text/plain;charset=utf-8': 'text',
};
