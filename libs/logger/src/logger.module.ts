import {
  Module, DynamicModule,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoggerModule as NestjsPinoLoggerModule } from 'nestjs-pino';
import { safeSerialize } from './safe-serialize';
import { LoggerModuleAsyncOptions } from './types';

@Module({})
export class LoggerModule {
  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    return {
      module: LoggerModule,
      imports: [
        NestjsPinoLoggerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (configService: ConfigService) => {
            const env = await options.useFactory(configService);

            return {
              pinoHttp: {
                level: env === 'production' ? 'info' : 'debug',
                transport: env !== 'production'
                  ? {
                    target: 'pino-pretty',
                    options: {
                      colorize: true,
                      translateTime: 'SYS:standard',
                      ignore: 'pid,hostname',
                    },
                  }
                  : undefined,
                serializers: {
                  req: (req: any) => safeSerialize(req),
                  res: (res: any) => safeSerialize(res),
                  err: (err: any) => safeSerialize(err),
                  default: (obj: any) => safeSerialize(obj),
                },
              },
            };
          },
        }),
      ],
      exports: [NestjsPinoLoggerModule],
    };
  }
}
