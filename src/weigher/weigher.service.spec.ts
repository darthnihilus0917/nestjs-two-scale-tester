import { Test, TestingModule } from '@nestjs/testing';
import { WeigherService } from './weigher.service';

describe('WeigherService', () => {
  let service: WeigherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeigherService],
    }).compile();

    service = module.get<WeigherService>(WeigherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
