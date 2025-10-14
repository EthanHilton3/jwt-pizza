import { test } from 'playwright-test-coverage';
import { expect, Page } from "@playwright/test";
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