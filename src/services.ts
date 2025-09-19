import { logger } from './logger/AffordLogger';

/**
 * A single visit/click on a short link.
 */
export type ClickRecord = {
  timestamp: string;
  referrer: string;
  geo?: string | null;
};

/**
 * Persisted representation for a shortened link.
 */
export type ShortLink = {
  shortcode: string;
  longUrl: string;
  createdAt: string;
  expiryAt: string;
  clicks: ClickRecord[];
};

export type StorageSchema = {
  links: Record<string, ShortLink>;
};

const STORAGE_KEY = 'urlShortenerData';

// Validation helpers (humanized names)
export const isHttpOrHttpsUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

export const isValidShortcode = (shortcode: string): boolean => {
  const alphanumericRegex = /^[a-zA-Z0-9]+$/;
  return alphanumericRegex.test(shortcode) && shortcode.length >= 4 && shortcode.length <= 12;
};

export const isValidMinuteInteger = (minutes: string): boolean => {
  const num = parseInt(minutes, 10);
  return !isNaN(num) && num > 0 && Number.isInteger(num);
};

// Shortcode generator
export const createRandomShortcode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Storage primitives
export const readStore = (): StorageSchema => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : { links: {} };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('StorageService', 'Failed to get stored data', { error: errorMessage });
    return { links: {} };
  }
};

export const writeStore = (data: StorageSchema): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('StorageService', 'Failed to save data', { error: errorMessage });
  }
};

export const upsertShortLink = (shortLink: ShortLink): void => {
  const data = readStore();
  data.links[shortLink.shortcode] = shortLink;
  writeStore(data);
  logger.info('StorageService', 'Short link added', { shortcode: shortLink.shortcode });
};

export const findShortLink = (shortcode: string): ShortLink | null => {
  const data = readStore();
  return data.links[shortcode] || null;
};

export const listShortLinks = (): ShortLink[] => {
  const data = readStore();
  return Object.values(data.links);
};

export const isShortcodeAvailable = (shortcode: string): boolean => {
  const data = readStore();
  return !data.links[shortcode];
};

export const appendClick = (shortcode: string, referrer: string = 'direct'): void => {
  const shortLink = findShortLink(shortcode);
  if (!shortLink) {
    logger.warn('StorageService', 'Attempted to record click for non-existent shortcode', { shortcode });
    return;
  }

  const clickRecord: ClickRecord = {
    timestamp: new Date().toISOString(),
    referrer,
    geo: null // Will be populated by geolocation if available
  };

  shortLink.clicks.push(clickRecord);
  upsertShortLink(shortLink);
  
  logger.info('StorageService', 'Click recorded', { 
    shortcode, 
    totalClicks: shortLink.clicks.length 
  });
};

// Geolocation helper
export const fetchCoarseLocation = (): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        resolve(`${latitude.toFixed(2)},${longitude.toFixed(2)}`);
      },
      () => {
        resolve(null);
      },
      { timeout: 5000 }
    );
  });
};

// Copy to clipboard helper
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('ClipboardService', 'Failed to copy to clipboard', { error: errorMessage });
    return false;
  }
};

// Backward-compatible exports (if any usage remains)
export const validateUrl = isHttpOrHttpsUrl;
export const validateShortcode = isValidShortcode;
export const validateValidityMinutes = isValidMinuteInteger;
export const generateShortcode = createRandomShortcode;
export const getStoredData = readStore;
export const saveStoredData = writeStore;
export const addShortLink = upsertShortLink;
export const getShortLink = findShortLink;
export const getAllShortLinks = listShortLinks;
export const isShortcodeUnique = isShortcodeAvailable;
export const recordClick = appendClick;
export const getCurrentLocation = fetchCoarseLocation;
export const copyToClipboard = copyTextToClipboard;
