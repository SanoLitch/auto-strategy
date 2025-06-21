import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import {
  DocumentBuilder, SwaggerModule,
} from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/http-exception.filter';
import { DomainExceptionFilter } from './core/domain-exception.filter';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.use(cookieParser());
  app.useLogger(app.get(Logger));
  app.useGlobalFilters(
    new DomainExceptionFilter(),
    new HttpExceptionFilter(),
  );
  app.enableCors();
  app.setGlobalPrefix('/api', { exclude: ['/', '/docs'] });

  const config = new DocumentBuilder()
    .setTitle('Auto-Strategy API')
    .setDescription('The Auto-Strategy API description')
    .setVersion('1.0')
    .addTag('api')
    .addCookieAuth('accessToken')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('/docs', app, document);

  await app.listen(3000);
}
bootstrap();
