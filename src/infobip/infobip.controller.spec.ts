import { Test, TestingModule } from '@nestjs/testing';
import { InfobipController } from './infobip.controller';

describe('InfobipController', () => {
  let controller: InfobipController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InfobipController],
    }).compile();

    controller = module.get<InfobipController>(InfobipController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
