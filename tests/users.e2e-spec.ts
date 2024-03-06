import { App } from '../src/app';
import { boot } from '../src/main';
import request from 'supertest';

let application: App;

beforeAll(async () => {
	const { app } = await boot;
	application = app;
});

describe('users e2e', () => {
	it('Register - error', async () => {
		const res = await request(application.app)
			.post('/users/register')
			.send({ email: 'hamilton@mail.com', password: '1' });
		expect(res.statusCode).toBe(422);
	});
	it('Login - error', async () => {
		const res = await request(application.app)
			.post('/users/login')
			.send({ email: 'hamilton@gang.com', password: '1223' });
		expect(res.statusCode).toBe(401);
	});
	it('Login - success', async () => {
		const res = await request(application.app)
			.post('/users/login')
			.send({ email: 'hamilton@gang.com', password: 'asdasddf' });
		expect(res.body.jwt).not.toBeUndefined();
	});
	it('Info - success', async () => {
		const login = await request(application.app)
			.post('/users/login')
			.send({ email: 'hamilton@gang.com', password: 'asdasddf' });
		const res = await request(application.app)
			.get('/users/info')
			.set('Authorization', `Bearer ${login.body.jwt}`);
		expect(res.body.email).toBe('hamilton@gang.com');
	});
	it('Info - error', async () => {
		const res = await request(application.app)
			.get('/users/info')
			.set(
				'Authorization',
				'Bearer eyJhbG5cCI6IkpXVCJ9.eyJlbWFpbCI6ImhhbWlsdG93bkBnYW5nLmNvbSIsImlhdCI6MTcwOTMwNTYzMH0.jaQM3LV1W1iZ545rxYQ3jFqUmDXtqSqP_pZ1KiRM0zQ',
			);
		expect(res.statusCode).toBe(401);
	});
});

afterAll(() => {
	application.close();
});
