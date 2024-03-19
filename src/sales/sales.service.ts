import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import { ISalesService } from './sales.service.interface';
import { SaleCreateDto } from './dto/sale-create.dto';
import { Sale } from './sales.entity';
import { TYPES } from '../types';
import { ISalesRepository } from './sales.repository.interface';
import moment, { Moment } from 'moment';
import * as fs from 'fs';

@injectable()
export class SalesService implements ISalesService {
	private endTime: moment.Moment | null = null;
	private timerTimeout: NodeJS.Timeout | null = null;
	private data: string[][] = []; // Массив данных
	private hasExecuted: boolean = false;

	constructor(@inject(TYPES.SalesRepository) private salesRepository: ISalesRepository) {}

	public async apiRecieveData(dto: SaleCreateDto): Promise<moment.Moment> {
		return new Promise((resolve, reject) => {
			const duration = moment.duration(2, 'seconds');
			this.endTime = moment().add(duration);

			this.setTimer(); // Установить таймер при каждом новом запросе

			try {
				if (this.endTime) {
					this.data.push([
						`https://azatvaleev.getcourse.ru/sales/control/deal/update/id/${dto.id}`,
						dto.firstName,
						dto.phone,
					]);
				}
				console.log('Data has been accepted');
			} catch (error) {
				console.error('Ошибка при добавлении данных в файл:', error);
			}

			const checkTimer = async (): Promise<void> => {
				if (this.endTime !== null) {
					const remainingTime = moment.duration(this.endTime.diff(moment()));
					if (remainingTime.asSeconds() <= 0) {
						clearInterval(this.timerTimeout!);
						if (!this.hasExecuted) {
							this.hasExecuted = true; // Устанавливаем флаг, что функция уже вызвана
							this.salesRepository.createTable(this.data);
							await this.salesRepository
								.uploadToYandex(`salesData.xlsx`)
								.then(() => {
									resolve(this.endTime!);
								})
								.catch(reject);
							fs.unlink('salesData.xlsx', (err) => {
								if (err) {
									console.error('Ошибка при удалении файла:', err);
									return;
								}
								console.log('Файл успешно удален');
							});
						}
					}
				}
			};

			checkTimer();
		});
	}

	private setTimer(): void {
		if (this.timerTimeout) {
			clearInterval(this.timerTimeout);
		}
		this.timerTimeout = setInterval(async () => {
			await this.checkTimer();
		}, 1000);
	}

	private async checkTimer(): Promise<void> {
		if (this.endTime !== null) {
			const remainingTime = moment.duration(this.endTime.diff(moment()));
			if (remainingTime.asSeconds() <= 0) {
				clearInterval(this.timerTimeout!);
				if (!this.hasExecuted) {
					this.hasExecuted = false; // Сбрасываем флаг, что функция уже вызвана
					this.salesRepository.createTable(this.data);
					await this.salesRepository.uploadToYandex(`salesData.xlsx`);
				}
			}
		}
	}
}
