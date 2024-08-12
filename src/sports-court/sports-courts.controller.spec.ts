import { Test, TestingModule } from '@nestjs/testing';
import { SportsCourtsController } from './sports-courts.controller';

describe('SportsCourtsController', () => {
  let controller: SportsCourtsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SportsCourtsController],
    }).compile();

    controller = module.get<SportsCourtsController>(SportsCourtsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
