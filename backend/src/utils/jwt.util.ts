import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWTPayload } from '../types/auth.types';

dotenv.config();

const JWT_SECRET = process.env['JWT_SECRET'] || 'bwbgwgb89wbg9wbg9wbg99w';

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

type JWTPayloadInput = {
  userId: string;
  email: string;
};

export const generateToken = async (payload: JWTPayloadInput): Promise<string> => {
  try {
    const options: SignOptions = {
      expiresIn: '24h',
      issuer: 'student-management-api',
      audience: 'student-management-frontend'
    };

    const token = jwt.sign(payload, JWT_SECRET!, options);

    return token;
  } catch (error) {
    throw new Error('Failed to generate JWT token');
  }
};

export const verifyToken = async (token: string): Promise<JWTPayload> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET!, {
      issuer: 'student-management-api',
      audience: 'student-management-frontend'
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  return token.length > 0 ? token : null;
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};