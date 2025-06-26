import { Request } from 'express';

export interface TokenModuleConfig {
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
}

export interface TokenWithExpiry {
  token: string;
  expiresIn: number; // миллисекунды
}

export interface RequestWithUser extends Request {
  user: {
    sub: string;
  };
}
