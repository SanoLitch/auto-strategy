import { Module, DynamicModule } from '@nestjs/common';
import { LoggerModule as NestjsPinoLoggerModule } from 'nestjs-pino';
import { safeSerialize } from './safe-serialize';

export const ENVIRONMENT = 'ENVIRONMENT';

export interface LoggerModuleAsyncOptions {
  useFactory: (...args: any[]) => string | Promise<string>;
  inject?: Array<any>;
}

@Module({})
export class LoggerModule {
  static forRootAsync(options: LoggerModuleAsyncOptions): DynamicModule {
    const envProvider = {
      provide: ENVIRONMENT,
      useFactory: options.useFactory,
      inject: options.inject || [],
    };

    return {
      module: LoggerModule,
      providers: [envProvider],
      imports: [
        NestjsPinoLoggerModule.forRootAsync({
          inject: [ENVIRONMENT],
          useFactory: (env: string) => ({
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
          }),
        }),
      ],
      exports: [NestjsPinoLoggerModule],
    };
  }
}