import { Test, TestingModule } from '@nestjs/testing';
import { SportsCenterController } from './sports-center.controller';

describe('SportsCenterController', () => {
  let controller: SportsCenterController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportsCenterController],
    }).compile();

    controller = module.get<SportsCenterController>(SportsCenterController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
