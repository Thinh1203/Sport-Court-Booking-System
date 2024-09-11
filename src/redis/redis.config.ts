import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-redis-store';

export const RedisOptions: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  useFactory: async (configService: ConfigService) => {
    const redisUrl = configService.get<string>('REDIS_URL');
    const store = await redisStore({
      ttl: 300,
      // socket: {
      //   host: configService.get<string>('REDIS_HOST'),
      //   port: parseInt(configService.get<string>('REDIS_PORT') !)
      // }
      url: redisUrl,
    });

    return {
      store: () => store,
    };
  },
  inject: [ConfigService],
};
