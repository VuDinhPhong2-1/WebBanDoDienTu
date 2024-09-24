import { Test, TestingModule } from '@nestjs/testing';
import { SalePricesService } from './sale-prices.service';

describe('SalePricesService', () => {
  let service: SalePricesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalePricesService],
    }).compile();

    service = module.get<SalePricesService>(SalePricesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
