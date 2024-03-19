import { SaleCreateDto } from './dto/sale-create.dto';
import { Sale } from './sales.entity';

export interface ISalesService {
	apiRecieveData: (dto: SaleCreateDto) => Promise<moment.Moment>;
}
