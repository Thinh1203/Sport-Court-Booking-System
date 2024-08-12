import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
    async onModuleInit() {
        await this.$connect()
          .then(() => console.log('Connected to DB', new Date().toISOString()))
          .catch((err) => console.log(err));
      }
}
