import { expect, test } from '@playwright/test';

function escapeRegex(value: string) {
  return value.replace(/([\\^$.*+?()[\]{}|-])/g, '\\$1');
}

function generatePostcode() {
  const digit = (min = 0, max = 9) => Math.floor(Math.random() * (max - min + 1)) + min;
  const letter = () => String.fromCharCode(65 + digit(0, 25));

  const outward = `Q${letter()}${digit(1, 8)}${letter()}`;
  const inward = `${digit(0, 9)}${letter()}${letter()}`;
  return `${outward} ${inward}`;
}

test.describe('reporting flow', () => {
  test('submitting a report unlocks full postcode stats once threshold is reached', async ({ page }) => {
    const postcode = generatePostcode();
    const outwardSector = `${postcode.slice(0, postcode.indexOf(' '))} ${postcode.split(' ')[1][0]}`;
    const today = new Date().toISOString().slice(0, 10);

    const seedTimes = ['07:00', '07:30', '08:00', '08:30', '09:00', '09:30'];
    for (const deliveryTime of seedTimes) {
      const response = await page.request.post('/api/report', {
        data: {
          postcode,
          deliveryDate: today,
          deliveryTime,
          deliveryType: 'letters'
        }
      });
      expect(response.ok()).toBeTruthy();
    }

    await page.goto(`/report?postcode=${encodeURIComponent(postcode)}`);

    await page.getByLabel('Postcode').fill(postcode);
    await page.getByLabel('Delivery date').fill(today);
    await page.getByLabel('Delivery time').fill('10:00');
    await page.getByLabel('Delivery type').selectOption('both');
    await page.getByLabel('Optional note').fill('Playwright seeded run');
    await page.getByRole('button', { name: 'Submit delivery report' }).click();

    await page.waitForURL(`**/postcode/${encodeURIComponent(postcode)}`);

    await expect(page.getByRole('heading', { name: postcode, level: 1 })).toBeVisible();
    const sectorHeading = page
      .getByRole('heading', { level: 2 })
      .filter({ hasText: new RegExp(`^${escapeRegex(outwardSector)}$`) });
    await expect(sectorHeading).toHaveCount(1);
    const fullHeading = page
      .getByRole('heading', { level: 2 })
      .filter({ hasText: new RegExp(`^${escapeRegex(postcode)}$`) });
    await expect(fullHeading).toHaveCount(1);

    const reportsSummary = page.getByText('7 reports in the last 30 days');
    await expect(reportsSummary).toHaveCount(2);
    await expect(page.getByText('Medium confidence')).toHaveCount(2);

    await expect(page.locator('svg.recharts-surface')).toHaveCount(2);
    await expect(page.getByText('Need at least 7 reports for full postcode breakdown.')).toHaveCount(0);
  });

  test('API returns validation errors for bad payloads', async ({ request }) => {
    const response = await request.post('/api/report', {
      data: {
        postcode: 'invalid',
        deliveryDate: 'not-a-date',
        deliveryTime: '99:99',
        deliveryType: 'letters'
      }
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty('error');
  });
});
