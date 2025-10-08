import { Page } from '@playwright/test';
import { test, expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

export async function basicInit(page: Page) {
	let loggedInUser: User | undefined;
	let loggedInToken: string | undefined;
	const validUsers: Record<string, User> =
	{
		'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] },
		/*'f@jwt.com': { id: '4', name: 'Kai Chen', email: 'f@jwt.com', password: 'a', roles: [{ role: Role.Franchisee }] },*/
		'a@jwt.com': { id: '5', name: 'Kai Chen', email: 'a@jwt.com', password: 'a', roles: [{ role: Role.Admin }] },
	};

	// // Log all API requests
	// page.on('request', req => {
	// 	if (req.url().includes('/api/')) {
	// 		console.log('📡 Request:', req.method(), req.url());
	// 	}
	// });

	// Login and logout handling
	await page.route('*/**/api/auth', async (route) => {
		const req = route.request();

		// Handle DELETE requests for logout
		if (req.method() === 'DELETE') {
			const authHeader = req.headers()['authorization'];
			expect(authHeader).toBe('Bearer ' + loggedInToken);

			// Clear logged-in state
			loggedInUser = undefined;

			await route.fulfill({
				status: 200
			});
			return;
		}

		// Handle login PUT requests (existing logic)
		if (req.method() === 'PUT') {
			const loginReq = req.postDataJSON();
			const user = validUsers[loginReq.email];
			if (!user || user.password !== loginReq.password) {
				await route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
				return;
			}

			loggedInUser = validUsers[loginReq.email];
			loggedInToken = 'abcdef';
			const loginRes = {
				user: loggedInUser,
				token: loggedInToken,
			};
			await route.fulfill({ json: loginRes });
			return;
		}

		// Default fallback for any other method
		await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
	});


	// Return the currently logged in user
	await page.route('*/**/api/user/me', async (route) => {
		expect(route.request().method()).toBe('GET');
		await route.fulfill({ json: loggedInUser });
	});

	// A standard menu
	await page.route('*/**/api/order/menu', async (route) => {
		const menuRes = [
			{
				id: 1,
				title: 'Veggie',
				image: 'pizza1.png',
				price: 0.0038,
				description: 'A garden of delight',
			},
			{
				id: 2,
				title: 'Pepperoni',
				image: 'pizza2.png',
				price: 0.0042,
				description: 'Spicy treat',
			},
		];
		expect(route.request().method()).toBe('GET');
		await route.fulfill({ json: menuRes });
	});

	// Standard franchises and stores
	await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
		const franchiseRes = {
			franchises: [
				{
					id: 2,
					name: 'LotaPizza',
					stores: [
						{ id: 4, name: 'Lehi' },
						{ id: 5, name: 'Springville' },
						{ id: 6, name: 'American Fork' },
					],
				},
				{ id: 3, name: 'PizzaCorp', stores: [{ id: 7, name: 'Spanish Fork' }] },
				{ id: 4, name: 'topSpot', stores: [] },
			],
		};
		expect(route.request().method()).toBe('GET');
		await route.fulfill({ json: franchiseRes });
	});

	// Order a pizza.
	await page.route('*/**/api/order', async (route) => {
		const req = route.request();

		// Handle POST (placing an order)
		if (req.method() === 'POST') {
			const orderReq = route.request().postDataJSON();
			const orderRes = {
				order: { ...orderReq, id: 23 },
				jwt: 'eyJpYXQ',
			};
			expect(route.request().method()).toBe('POST');
			await route.fulfill({ json: orderRes });
			return;
		}

		// Handle GET (diner dashboard)
		if (req.method() === 'GET') {
			expect(route.request().method()).toBe('GET');

			const ordersRes = {
				dinerId: 416,
				orders: [
					{
						id: 15,
						franchiseId: 52,
						storeId: 5,
						date: '2025-10-07T23:12:10.000Z',
						items: [
							{ id: 28, menuId: 1, description: 'Veggie', price: 0.0038 },
							{ id: 29, menuId: 2, description: 'Pepperoni', price: 0.0042 },
							{ id: 30, menuId: 3, description: 'Margarita', price: 0.0042 },
						],
					},
				],
				page: 1,
			};

			await route.fulfill({
				status: 200,
				contentType: 'application/json',
				json: ordersRes,
			});
			return;
		}

		await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
	});

	// Logout
	await page.route('*/**/api/user/logout', async (route) => {
		expect(route.request().method()).toBe('POST');
		loggedInUser = undefined;
		await route.fulfill({ status: 200 });
	});

	// create franchisee user
	await page.route('*/**/api/franchisee', async (route) => {
		const req = route.request();
		const method = req.method();

		if (method === 'POST') {
			const authHeader = req.headers()['authorization'];
			expect(authHeader).toBe('Bearer ' + loggedInToken);

			const newreq = req.postDataJSON()
			const { name, email } = newreq;

			const newFranchisee = {
				name: name,
				email: email
			}

			expect(method).toBe('POST');
			await route.fulfill({
				status: 200,
				json: newFranchisee
			});
		}
	});

	// Franchise management (GET, DELETE)
	await page.route(/\/api\/franchise(\/\d+)?$/, async (route) => {
		const req = route.request();
		const method = req.method();
		const authHeader = req.headers()['authorization'];

		// DELETE a franchise
		if (method === 'DELETE') {
			expect(authHeader).toBe('Bearer ' + loggedInToken);

			const match = req.url().match(/\/api\/franchise\/(\d+)/);
			const franchiseId = match ? match[1] : undefined;
			expect(franchiseId).toBeDefined();

			await route.fulfill({
				status: 200,
				json: { message: `franchise ${franchiseId} deleted` },
			});
			return;
		}

		await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
	});

	// Store management (POST create, DELETE delete)
	await page.route(/\/api\/franchise\/(\d+)\/store(\/(\d+))?$/, async (route) => {
		const req = route.request();
		const method = req.method();
		const authHeader = req.headers()['authorization'];
		expect(authHeader).toBe('Bearer ' + loggedInToken);

		const urlMatch = req.url().match(/\/api\/franchise\/(\d+)(?:\/store(?:\/(\d+))?)?/);
		const franchiseId = urlMatch?.[1];
		const storeId = urlMatch?.[2];

		// POST → create new store
		if (method === 'POST') {
			const { name } = req.postDataJSON();
			expect(name).toBeTruthy();

			const newStore = {
				id: Math.floor(Math.random() * 1000),
				name,
				totalRevenue: 0,
			};

			await route.fulfill({
				status: 200,
				json: newStore,
			});
			return;
		}

		// DELETE → delete a specific store
		if (method === 'DELETE') {
			expect(storeId).toBeDefined();
			await route.fulfill({
				status: 200,
				json: { message: `store ${storeId} deleted from franchise ${franchiseId}` },
			});
			return;
		}

		await route.fulfill({ status: 405, json: { error: 'Method Not Allowed' } });
	});

	await page.goto('/');
}