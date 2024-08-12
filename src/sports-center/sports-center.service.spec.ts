import { Test, TestingModule } from '@nestjs/testing';
import { SportsCenterService } from './sports-center.service';

describe('SportsCenterService', () => {
  let service: SportsCenterService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportsCenterService],
    }).compile();

    service = module.get<SportsCenterService>(SportsCenterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
