import {
  Injectable, OnModuleInit,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DbService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(DbService.name);

  public async onModuleInit(): Promise<void> {
    this.logger.log('Connecting to database...');

    try {
      await this.$connect();

      this.logger.log('Database connection established');
    } catch (error) {
      this.logger.error('Database connection error', error);

      throw error;
    }
  }
}
