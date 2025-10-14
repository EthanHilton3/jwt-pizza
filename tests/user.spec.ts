import { test } from 'playwright-test-coverage';
import { expect, request } from "@playwright/test";
import { basicInit } from "./basicTestInit";

test('updateUser', async ({ page }) => {
	await basicInit(page);
	const email = `user${Math.floor(Math.random() * 10000)}@jwt.com`;
	await page.getByRole('link', { name: 'Register' }).click();
	await page.getByRole('textbox', { name: 'Full name' }).fill('pizza diner');
	await page.getByRole('textbox', { name: 'Email address' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill('diner');
	await page.getByRole('button', { name: 'Register' }).click();
	await page.getByRole('link', { name: 'pd' }).click();
	await expect(page.getByRole('main')).toContainText('pizza diner');


	await page.getByRole('button', { name: 'Edit' }).click();
	await expect(page.locator('h3')).toContainText('Edit user');
	await page.getByRole('button', { name: 'Update' }).click();
	await expect(page.locator('[role="dialog"]')).toBeVisible();
	await expect(page.getByRole('main')).toContainText('pizza diner');


	await page.getByRole('button', { name: 'Edit' }).click();
	await expect(page.locator('h3')).toContainText('Edit user');
	await page.getByRole('textbox').first().fill('pizza dinerx');
	await page.getByRole('button', { name: 'Update' }).click();
	await page.waitForSelector('[role="dialog"].hidden', { state: 'attached' });
	await expect(page.getByRole('main')).toContainText('pizza dinerx');

	await page.getByRole('link', { name: 'Logout' }).click();
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('textbox', { name: 'Email address' }).fill(email);
	await page.getByRole('textbox', { name: 'Password' }).fill('diner');
	await page.getByRole('button', { name: 'Login' }).click();
	await page.getByRole('link', { name: 'pd' }).click();
	await expect(page.getByRole('main')).toContainText('pizza dinerx');
});

// test('list users', async () => {
// 	const requestContext = await request.newContext();
// 	const listUsersRes = await requestContext.get('/api/user');
// 	expect(listUsersRes.status).toBe(200);
// });

// test('list users unauthorized', async () => {
// 	const listUsersRes = await request(app).get('/api/user');
// 	expect(listUsersRes.status).toBe(401);
// });

// test('list users', async () => {
// 	const [user, userToken] = await registerUser(request(app));
// 	const listUsersRes = await request(app)
// 		.get('/api/user')
// 		.set('Authorization', 'Bearer ' + userToken);
// 	expect(listUsersRes.status).toBe(200);
// });

// async function registerUser(service) {
// 	const testUser = {
// 		name: 'pizza diner',
// 		email: `${randomName()}@test.com`,
// 		password: 'a',
// 	};
// 	const registerRes = await service.post('/api/auth').send(testUser);
// 	registerRes.body.user.password = testUser.password;

// 	return [registerRes.body.user, registerRes.body.token];
// }

// function randomName() {
// 	return Math.random().toString(36).substring(2, 12);
// }