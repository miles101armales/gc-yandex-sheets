export interface ISalesRepository {
	uploadToYandex: (filePath: string) => Promise<void>;
	createTable: (data: string[][]) => Promise<string>;
	writeToTable: () => Promise<void>;
}
