import jwt from 'jsonwebtoken';

export interface JWTPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'default-secret', {
    expiresIn: '15m'
  });
};

export const generateRefreshToken = (payload: JWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret', {
    expiresIn: '7d'
  });
};

export const verifyAccessToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as JWTPayload;
};

export const verifyRefreshToken = (token: string): JWTPayload => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'default-refresh-secret') as JWTPayload;
};
