import { Test, TestingModule } from '@nestjs/testing';
import { InfobipService } from './infobip.service';

describe('InfobipService', () => {
  let service: InfobipService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InfobipService],
    }).compile();

    service = module.get<InfobipService>(InfobipService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
