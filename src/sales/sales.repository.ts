import { inject, injectable } from 'inversify';
import 'reflect-metadata';
import * as fs from 'fs';
import * as xlsx from 'xlsx';
import axios from 'axios';
import { ISalesRepository } from './sales.repository.interface';
import { TYPES } from '../types';
import { IConfigService } from '../config/config.service.interface';
import { response } from 'express';

@injectable()
export class SalesRepository implements ISalesRepository {
	private session: number = 0; // Инициализация сессии

	constructor(@inject(TYPES.ConfigService) private configService: IConfigService) {}

	public async uploadToYandex(filePath: string): Promise<void> {
		this.session++;
		const currentDate = new Date();
		const path = `/AV/Cтратегические сессии от ${currentDate.toLocaleDateString()} ${this.session}.xlsx`;
		const encodedPath = encodeURIComponent(path);
		const uploadUrl = `https://cloud-api.yandex.net/v1/disk/resources/upload?path=${encodedPath}&overwrite=false`;
		const accessToken = this.configService.get('OAUTH');

		// Чтение файла в поток
		const fileStream = fs.createReadStream(filePath);

		try {
			const response = await axios({
				method: 'GET',
				url: uploadUrl,
				headers: {
					Authorization: `OAuth ${accessToken}`,
					'Content-Type': 'application/octet-stream',
				},
			});

			const uploadUrlPut = response.data.href; // Получаем URL для загрузки из ответа

			// Загружаем файл по полученному URL
			await axios({
				method: 'PUT',
				url: uploadUrlPut,
				data: fileStream,
			});

			console.log('Файл успешно загружен на Яндекс.Диск');
		} catch (error) {
			console.error('Ошибка загрузки файла:', error);
		}
	}

	public async createTable(salesData: string[][]): Promise<string> {
		const currentDate = new Date();
		// Заголовки для таблицы
		const headers = ['ID', 'First Name', 'Phone', 'GetCourse'];

		// Добавляем данные к заголовкам
		const data = [headers, ...salesData];

		// Создаем новый книгу Excel
		const workbook = xlsx.utils.book_new();

		// Создаем новый лист с данными
		const worksheet = xlsx.utils.aoa_to_sheet(data);

		// Добавляем лист к книге
		xlsx.utils.book_append_sheet(workbook, worksheet, 'Заказы');

		// Сохраняем книгу в файл
		const fileName = `salesData.xlsx`;
		xlsx.writeFile(workbook, fileName);
		return fileName;
	}

	public async writeToTable(): Promise<void> {}
}
