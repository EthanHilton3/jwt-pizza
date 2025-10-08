import { test } from "playwright-test-coverage";
import { expect, Page } from "@playwright/test";
import { basicInit } from "./basicTestInit";
import { Role } from "../src/service/pizzaService";

async function makeDiner(page: Page) {
	const dinerUser = { 'd@jwt.com': { id: '3', name: 'Kai Chen', email: 'd@jwt.com', password: 'a', roles: [{ role: Role.Diner }] } };
	await basicInit(page, dinerUser);
}

async function loginDiner(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill('d@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
}


test('login', async ({ page }) => {
	await makeDiner(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginDiner(page)
	await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
});

test('purchase with login', async ({ page }) => {
	await makeDiner(page);

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
	await makeDiner(page);
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
	await makeDiner(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginDiner(page);
	await expect(page.getByRole('link', { name: 'KC' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
	await page.getByRole('link', { name: 'Logout' }).click();
	await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});

test('diner dashboard', async ({ page }) => {
	await makeDiner(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginDiner(page);
	await page.getByRole('link', { name: 'KC', exact: true }).click();
	await expect(page.getByText('Kai Chen')).toBeVisible();
	await expect(page.getByText('d@jwt.com')).toBeVisible();
	await expect(page.getByText('diner', { exact: true })).toBeVisible();
});

