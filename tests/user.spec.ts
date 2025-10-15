import { test } from 'playwright-test-coverage';
import { expect, Page, request } from "@playwright/test";
import { basicInit } from "./basicTestInit";

async function loginAdmin(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
}

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

test('getUsers test', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginAdmin(page);
	await page.getByRole('link', { name: 'Admin' }).click();
	
	await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
	await expect(page.locator('table tbody tr')).toHaveCount(10);
 	await page.getByRole('textbox', { name: 'Filter users' }).fill('a');
  	await page.getByRole('cell', { name: 'a Submit' }).getByRole('button').click();
	await expect(page.locator('table tbody tr')).toHaveCount(10);
});

test('deleteUser', async ({ page }) => {
    await basicInit(page);
    await page.getByRole('link', { name: 'Login' }).click();
    await loginAdmin(page);
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page.getByRole('heading', { name: 'Users' })).toBeVisible();
    
    // Get initial user count
    const initialCount = await page.getByRole('cell', { name: 'Delete' }).count();
	console.log(`Initial user count: ${initialCount}`);
    
    // Listen for the dialog and accept it
    page.on('dialog', dialog => dialog.accept());
    
    // Click the delete button
    await page.getByRole('button', { name: 'Delete' }).nth(0).click();
    
    // Verify the user was deleted (count should decrease)
	let userCountAfterDeletion = await page.getByRole('cell', { name: 'Delete' }).count();
	console.log(`User count after deletion attempt: ${userCountAfterDeletion}`);
    await expect(page.getByRole('cell', { name: 'Delete' })).toHaveCount(initialCount - 1);
});