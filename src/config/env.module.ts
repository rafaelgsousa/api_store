import { ConfigModule } from '@nestjs/config';

export const EnvModule = ConfigModule.forRoot({
  envFilePath: '.env',
  isGlobal: true,
});
