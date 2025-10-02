import { test, expect } from '@playwright/test';

test.describe('Royal Mail delivery app', () => {
  test('home page loads core copy', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Royal Mail delivery tracker' })).toBeVisible();
    await expect(page.getByText('Crowd-sourced arrival times').first()).toBeVisible();

    const reportLinks = page.getByRole('link', { name: 'Report a delivery' });
    await expect(reportLinks).toHaveCount(2);
  });

  test('postcode search normalises input and navigates', async ({ page }) => {
    await page.goto('/');

    const input = page.getByPlaceholder('Enter postcode (e.g. M46 0TF)');
    await input.fill('m460tf');
    await expect(input).toHaveValue('M46 0TF');

    await page.getByRole('button', { name: 'Check delivery times' }).click();
    await page.waitForURL('**/postcode/M46%200TF', { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'No data for M46 0TF' })).toBeVisible();
  });

  test('report form accepts input', async ({ page }) => {
    await page.goto('/report');

    await expect(page.getByLabel('Postcode')).toBeVisible();
    const postcodeField = page.getByLabel('Postcode');
    await postcodeField.fill('m460tf');
    await expect(postcodeField).toHaveValue('M46 0TF');

    await expect(page.getByLabel('Delivery date')).toBeVisible();
    await expect(page.getByLabel('Delivery time')).toBeVisible();

    await page.getByLabel('Delivery type').selectOption('parcels');
    await page.getByLabel('Optional note').fill('Left in the porch');

    await expect(page.getByRole('button', { name: 'Submit delivery report' })).toBeEnabled();
  });
});
