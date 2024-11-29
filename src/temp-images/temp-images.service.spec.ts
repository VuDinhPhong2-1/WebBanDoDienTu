import { Test, TestingModule } from '@nestjs/testing';
import { TempImagesService } from './temp-images.service';

describe('TempImagesService', () => {
  let service: TempImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TempImagesService],
    }).compile();

    service = module.get<TempImagesService>(TempImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
