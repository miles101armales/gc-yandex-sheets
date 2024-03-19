import { NextFunction, Request, Response } from 'express';

export interface ISalesController {
	exportToTable: (req: Request, res: Response, next: NextFunction) => void;
}
