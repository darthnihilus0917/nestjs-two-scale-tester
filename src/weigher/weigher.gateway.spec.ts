import { Test, TestingModule } from '@nestjs/testing';
import { WeigherGateway } from './weigher.gateway';

describe('WeigherGateway', () => {
  let gateway: WeigherGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeigherGateway],
    }).compile();

    gateway = module.get<WeigherGateway>(WeigherGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
