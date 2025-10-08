import { Page } from '@playwright/test';
import { expect } from 'playwright-test-coverage';
import { Role, User } from '../src/service/pizzaService';

/**
 * Mocks API behavior for a logged-in Franchisee owner (Kai Chen).
 */
export async function basicInitFranchisee(page: Page) {
	let loggedInUser: User | undefined;
	let loggedInToken: string | undefined;
	const validUsers: Record<string, User> = { 'f@jwt.com': { id: '4', name: 'Kai Chen', email: 'f@jwt.com', password: 'a', roles: [{ role: Role.Franchisee }] } };;

	// Log all API requests
	page.on('request', req => {
		if (req.url().includes('/api/')) {
			console.log('📡 Request:', req.method(), req.url());
		}
	});

	// ===== AUTH =====
	await page.route('*/**/api/auth', async route => {
		const req = route.request();

		if (req.method() === 'DELETE') {
			const authHeader = req.headers()['authorization'];
			expect(authHeader).toBe('Bearer ' + loggedInToken);
			loggedInUser = undefined;
			return route.fulfill({ status: 200 });
		}

		if (req.method() === 'PUT') {
			const body = req.postDataJSON();
			const user = validUsers[body.email];
			if (!user || user.password !== body.password) {
				return route.fulfill({ status: 401, json: { error: 'Unauthorized' } });
			}

			loggedInUser = user;
			loggedInToken = 'abcdef';
			return route.fulfill({ json: { user: loggedInUser, token: loggedInToken } });
		}

		return route.fulfill({ status: 405 });
	});

	await page.route('*/**/api/user/me', async route => {
		expect(route.request().method()).toBe('GET');
		await route.fulfill({ json: loggedInUser });
	});

	// ===== FRANCHISE ENDPOINTS =====

	// Standard franchises and stores
	await page.route(/\/api\/franchise(\?.*)?$/, async (route) => {
		const franchiseRes = {
			franchises: [
				{
					id: 2,
					admins: [{ id: 4, name: 'Kai Chen', email: 'f@jwt.com' }],
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

	// GET /api/franchise/:userId — always returns the hardcoded franchise for user ID 4
	await page.route('/api/franchise/4', async route => {
		const kaiFranchises = [
			{
				id: 2,
				admins: [{ id: 4, name: 'Kai Chen', email: 'f@jwt.com' }],
				name: 'LotaPizza',
				stores: [
					{ id: 4, name: 'Lehi' },
					{ id: 5, name: 'Springville' },
					{ id: 6, name: 'American Fork' },
				],
			},
		];
		return route.fulfill({ json: kaiFranchises });

	});

	// POST /api/franchise
	await page.route('*/**/api/franchise', async route => {
		if (route.request().method() === 'POST') {
			// Franchisees can’t normally create new franchises — only Admins
			return route.fulfill({ status: 403, json: { error: 'unable to create a franchise' } });
		}
		return route.continue();
	});

	// DELETE /api/franchise/:franchiseId
	await page.route(/\/api\/franchise\/\d+$/, async route => {
		if (route.request().method() === 'DELETE') {
			return route.fulfill({ json: { message: 'franchise deleted' } });
		}
		return route.continue();
	});

	// POST /api/franchise/:franchiseId/store
	await page.route(/\/api\/franchise\/\d+\/store$/, async route => {
		if (route.request().method() === 'POST') {
			const body = route.request().postDataJSON();
			return route.fulfill({
				json: { id: Math.floor(Math.random() * 1000), name: body.name, totalRevenue: 0 },
			});
		}
		return route.continue();
	});

	// DELETE /api/franchise/:franchiseId/store/:storeId
	await page.route(/\/api\/franchise\/\d+\/store\/\d+$/, async route => {
		if (route.request().method() === 'DELETE') {
			return route.fulfill({ json: { message: 'store deleted' } });
		}
		return route.continue();
	});

	// ===== MENU (still needed by dashboard) =====
	await page.route('*/**/api/order/menu', async route => {
		await route.fulfill({
			json: [
				{ id: 1, title: 'Veggie', price: 0.0038, description: 'A garden of delight' },
				{ id: 2, title: 'Pepperoni', price: 0.0042, description: 'Spicy treat' },
			],
		});
	});

	await page.goto('/');
}
