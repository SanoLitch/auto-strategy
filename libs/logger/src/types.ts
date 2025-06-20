import { ConfigService } from "@nestjs/config";

export type EnvType = "production" | "development" | string;

export interface LoggerModuleAsyncOptions {
  useFactory: (configService: ConfigService) => EnvType | Promise<EnvType>;
}