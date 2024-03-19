import { inject, injectable } from 'inversify';
import { Request, Response, NextFunction } from 'express';
import { BaseController } from '../common/base.controller';
import { ILogger } from '../logger/logger.interface';
import { TYPES } from '../types';
import { ISalesService } from './sales.service.interface';
import 'reflect-metadata';
import { ISalesController } from './sales.controller.interface';
import { SaleCreateDto } from './dto/sale-create.dto';

@injectable()
export class SalesController extends BaseController implements ISalesController {
	constructor(
		@inject(TYPES.ILogger) private loggerService: ILogger,
		@inject(TYPES.SalesService) private salesService: ISalesService,
	) {
		super(loggerService);
		this.bindRoutes([
			{
				path: '/exportToTable',
				method: 'get',
				func: this.exportToTable,
			},
		]);
	}

	public async exportToTable(req: Request, res: Response, next: NextFunction): Promise<void> {
		const transferObject: SaleCreateDto = {
			id: String(req.query.id),
			firstName: String(req.query.firstName),
			phone: String(req.query.phone),
			email: String(req.query.email),
		};
		this.salesService.apiRecieveData(transferObject);
		this.ok(res, 'ok!');
	}
}
