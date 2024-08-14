import { Test, TestingModule } from '@nestjs/testing';
import { AmenityController } from './amenity.controller';

describe('AmenityController', () => {
  let controller: AmenityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AmenityController],
    }).compile();

    controller = module.get<AmenityController>(AmenityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
