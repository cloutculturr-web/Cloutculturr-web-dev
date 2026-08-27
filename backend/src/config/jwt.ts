import jwt, { type SignOptions } from 'jsonwebtoken';
import { logger } from '@/utils/logger.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'creator' | 'client';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends TokenPayload {
  type: 'refresh';
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret_key';
const JWT_EXPIRY = (process.env.JWT_EXPIRY || '15m') as SignOptions['expiresIn'];
const JWT_REFRESH_EXPIRY = (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'];

export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw error;
  }
};

export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  try {
    const refreshPayload: RefreshTokenPayload = {
      ...payload,
      type: 'refresh',
    };
    return jwt.sign(refreshPayload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRY });
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw error;
  }
};

export const verifyAccessToken = (token: string): TokenPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    logger.error('Access token verification failed:', error);
    throw error;
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
  } catch (error) {
    logger.error('Refresh token verification failed:', error);
    throw error;
  }
};

export const generateTokenPair = (payload: Omit<TokenPayload, 'iat' | 'exp'>) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload;
};
