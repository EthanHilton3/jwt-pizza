import { test } from "playwright-test-coverage";
import { expect, Page } from "@playwright/test";
import { basicInit } from "./basicTestInit";
import { Role } from "../src/service/pizzaService";

async function makeBasicInit(page: Page) {
	const franchiseeUser = { 'f@jwt.com': { id: '3', name: 'Kai Chen', email: 'f@jwt.com', password: 'a', roles: [{ role: Role.Franchisee }] } };
	await basicInit(page, franchiseeUser);
}

async function loginSteps(page: Page) {
	await page.getByRole('textbox', { name: 'Email address' }).fill('f@jwt.com');
	await page.getByRole('textbox', { name: 'Password' }).fill('a');
	await page.getByRole('button', { name: 'Login' }).click();
}

test('franchisee dashboard', async ({ page }) => {
	await makeBasicInit(page);
	await page.getByRole('link', { name: 'Login' }).click();
	await loginSteps(page);

	await page.getByRole('link', { name: 'Franchise' }).first().click();

	await expect(page.getByText('Kai Chen')).toBeVisible();
});