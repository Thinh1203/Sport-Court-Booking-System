import { Test, TestingModule } from '@nestjs/testing';
import { AppotapayController } from './appotapay.controller';

describe('AppotapayController', () => {
  let controller: AppotapayController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppotapayController],
    }).compile();

    controller = module.get<AppotapayController>(AppotapayController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
