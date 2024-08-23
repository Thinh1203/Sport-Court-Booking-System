import { Test, TestingModule } from '@nestjs/testing';
import { AppotapayService } from './appotapay.service';

describe('AppotapayService', () => {
  let service: AppotapayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppotapayService],
    }).compile();

    service = module.get<AppotapayService>(AppotapayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
