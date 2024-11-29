import { Test, TestingModule } from '@nestjs/testing';
import { TempImagesController } from './temp-images.controller';
import { TempImagesService } from './temp-images.service';

describe('TempImagesController', () => {
  let controller: TempImagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TempImagesController],
      providers: [TempImagesService],
    }).compile();

    controller = module.get<TempImagesController>(TempImagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
