import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { LoggerService } from './logger/logger.service';
import { IExceptionFilter } from './error/exception.filter.interface';
import { ExceptionFilter } from './error/exception.filter';
import { UserController } from './users/users.controller';
import { UserService } from './users/users.service';
import { IUsersController } from './users/users.controller.interface';
import { IUsersService } from './users/users.service.interface';
import { IConfigService } from './config/config.service.interface';
import { ConfigService } from './config/config.service';
import { PrismaService } from './database/prisma.service';
import { UsersRepository } from './users/users.repository';
import { IUsersRepository } from './users/users.repository.interface';
import { ISalesController } from './sales/sales.controller.interface';
import { ISalesService } from './sales/sales.service.interface';
import { ISalesRepository } from './sales/sales.repository.interface';
import { SalesController } from './sales/sales.controller';
import { SalesRepository } from './sales/sales.repository';
import { SalesService } from './sales/sales.service';

export interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBindings = new ContainerModule((bind: interfaces.Bind) => {
	bind<App>(TYPES.Application).to(App);
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExceptionFilter>(TYPES.ExceptionFilter).to(ExceptionFilter);
	bind<IUsersController>(TYPES.UserController).to(UserController);
	bind<IUsersService>(TYPES.UserService).to(UserService);
	bind<IConfigService>(TYPES.ConfigService).to(ConfigService).inSingletonScope();
	bind<PrismaService>(TYPES.PrismaService).to(PrismaService).inSingletonScope();
	bind<IUsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
	bind<ISalesController>(TYPES.SalesController).to(SalesController);
	bind<ISalesService>(TYPES.SalesService).to(SalesService);
	bind<ISalesRepository>(TYPES.SalesRepository).to(SalesRepository).inSingletonScope();
});

async function bootstrap(): Promise<IBootstrapReturn> {
	const appContainer = new Container();
	appContainer.load(appBindings);
	const app = appContainer.get<App>(TYPES.Application);
	await app.init();
	return { appContainer, app };
}

export const boot = bootstrap();
