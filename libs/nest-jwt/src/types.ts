export interface TokenModuleConfig {
  JWT_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
}

export interface TokenWithExpiry {
  token: string;
  expiresIn: number; // миллисекунды
}
