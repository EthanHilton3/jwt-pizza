import { test } from "playwright-test-coverage";
import { expect, Page } from "@playwright/test";
import { basicInit } from "./basicTestInit";


async function loginDiner(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
}

async function loginAdmin(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill('a@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
}


test('login', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginDiner(page)
	await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
	await basicInit(page);

	// Go to order page
	await page.getByRole('button', { name: 'Order now' }).click();

	// Create order
	await expect(page.locator('h2')).toContainText('Awesome is a click away');
	await page.getByRole('combobox').selectOption('4');
	await page.getByRole('link', { name: 'Image Description Veggie A' }).click();
	await page.getByRole('link', { name: 'Image Description Pepperoni' }).click();
	await expect(page.locator('form')).toContainText('Selected pizzas: 2');
	await page.getByRole('button', { name: 'Checkout' }).click();

	// Login
	await loginDiner(page);

	// Pay
	await expect(page.getByRole('main')).toContainText('Send me those 2 pizzas right now!');
	await expect(page.locator('tbody')).toContainText('Veggie');
	await expect(page.locator('tbody')).toContainText('Pepperoni');
	await expect(page.locator('tfoot')).toContainText('0.008 ₿');
	await page.getByRole('button', { name: 'Pay now' }).click();

	// Check balance
	await expect(page.getByText('0.008')).toBeVisible();
});

test('register', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await page.getByRole('link', { name: 'Register' }).click();
	await page.getByPlaceholder('Name').fill('New User');
	await page.getByPlaceholder('Email address').fill('test@jwt.click');
	await page.getByPlaceholder('Password').fill('mypassword');
	await page.getByRole('button', { name: 'Register' }).click();
	await page.goto('http://localhost:5173/');
	await expect(page.getByRole('link', { name: 'home' })).toBeVisible();
});

test('logout', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginDiner(page);
	await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
	await page.getByRole('link', { name: 'Logout' }).click();
	await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('diner dashboard', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginDiner(page);
	await page.getByRole('link', { name: 'KC', exact: true }).click();
	await expect(page.getByText('Kai Chen')).toBeVisible();
	await expect(page.getByText('d@jwt.com')).toBeVisible();
	await expect(page.getByText('diner', { exact: true })).toBeVisible();
});

test('create new franchisee', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginAdmin(page);
	
	await page.getByRole('link', { name: 'Admin', exact: true }).click();
	await page.getByRole('button', { name: 'Add Franchise' }).click();
	await expect(page.getByText('Create franchise', { exact: true })).toBeVisible();
	await page.getByRole('textbox', { name: 'franchise name' }).click();
	await page.getByRole('textbox', { name: 'franchise name' }).fill('Pizza Planet');
	await page.getByRole('textbox', { name: 'franchisee admin email' }).click();
	await page.getByRole('textbox', { name: 'franchisee admin email' }).fill('pizzaPlanet@jwt.com');
	//await page.getByRole('button', { name: 'Create' }).click();

});

test('delete franchise',  async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginAdmin(page);

	await page.getByRole('link', { name: 'Admin', exact: true }).click();
	await page.getByRole('row', {name: 'topSpot Close'}).getByRole('button').click();
	await expect(page.getByText('Sorry to see you go', { exact: true })).toBeVisible();
	await expect(page.getByText('Are you sure you want to close the topSpot franchise? This will close all associated stores and cannot be restored. All outstanding revenue will not be refunded.', { exact: false })).toBeVisible();

 	await page.getByRole('button', { name: 'Cancel' }).click();
});

test('delete franchise store',  async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginAdmin(page);
	await page.getByRole('link', { name: 'Admin', exact: true }).click();
 	await page.getByRole('row', { name: 'Lehi ₿ Close' }).getByRole('button').click();
	await expect(page.getByText('Sorry to see you go', { exact: true })).toBeVisible();
 	await expect(page.getByText('Are you sure you want to close the LotaPizza store Lehi ? This cannot be restored. All outstanding revenue will not be refunded.', { exact: false })).toBeVisible();

  	await page.getByRole('button', { name: 'Close' }).click();
});

test('filter franchises', async ({ page }) => {
	await basicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginAdmin(page);
	await page.getByRole('link', { name: 'Admin', exact: true }).click();

	await page.getByRole('textbox', { name: 'Filter franchises' }).click();
	await page.getByRole('textbox', { name: 'Filter franchises' }).fill('LotaPizza');
	await page.getByRole('button', { name: 'Submit' }).click();
});

