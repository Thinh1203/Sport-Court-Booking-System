import { Test, TestingModule } from '@nestjs/testing';
import { SportsCourtsService } from './sports-courts.service';

describe('SportsCourtsService', () => {
  let service: SportsCourtsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SportsCourtsService],
    }).compile();

    service = module.get<SportsCourtsService>(SportsCourtsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
