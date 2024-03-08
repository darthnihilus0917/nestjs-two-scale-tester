import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WeigherModule } from './weigher/weigher.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    WeigherModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
