export interface AppConfig {
  JWT_SECRET: string;
  DATABASE_URL: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
}
