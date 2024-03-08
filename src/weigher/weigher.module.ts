import { Module } from '@nestjs/common';
import { WeigherService } from './weigher.service';
import { WeigherGateway } from './weigher.gateway';

@Module({
  providers: [WeigherService, WeigherGateway]
})
export class WeigherModule {}
