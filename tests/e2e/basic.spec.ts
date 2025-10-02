import { test, expect } from '@playwright/test';

test.describe('Royal Mail delivery app', () => {
  test('home page loads core copy', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Royal Mail delivery tracker' })).toBeVisible();
    await expect(page.getByText('Crowd-sourced arrival times').first()).toBeVisible();

    const reportLinks = page.getByRole('link', { name: 'Report a delivery' });
    await expect(reportLinks).toHaveCount(2);
  });

  test('report form accepts input', async ({ page }) => {
    await page.goto('/report');

    await expect(page.getByLabel('Postcode')).toBeVisible();
    await page.getByLabel('Postcode').fill('M46 0TF');

    await expect(page.getByLabel('Delivery date')).toBeVisible();
    await expect(page.getByLabel('Delivery time')).toBeVisible();

    await page.getByLabel('Delivery type').selectOption('parcels');
    await page.getByLabel('Optional note').fill('Left in the porch');

    await expect(page.getByRole('button', { name: 'Submit delivery report' })).toBeEnabled();
  });
});
