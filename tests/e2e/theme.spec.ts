import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('switches between light and dark modes and persists across navigation', async ({ page }) => {
    await page.goto('/');

    const html = page.locator('html');
    const toggle = page.getByRole('button', { name: /Switch to (light|dark) mode/ });

    const initialTheme = await html.getAttribute('data-theme');
    const initialBackground = await page.evaluate(() => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim();
      return value ? `rgb(${value.replace(/\s+/g, ', ')})` : null;
    });
    const initialComputedBackground = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundColor
    );
    expect(initialBackground).toBe(initialComputedBackground);

    await toggle.click();

    await expect.poll(async () => html.getAttribute('data-theme')).not.toBe(initialTheme);
    const toggledTheme = await html.getAttribute('data-theme');
    expect(toggledTheme).not.toBeNull();
    const themeValue = toggledTheme!;
    expect(themeValue).not.toBe(initialTheme);

    const expectedBackground = await page.evaluate(() => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue('--background')
        .trim();
      return value ? `rgb(${value.replace(/\s+/g, ', ')})` : null;
    });
    expect(expectedBackground).not.toBe(initialBackground);

    await expect.poll(async () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    ).toBe(expectedBackground);

    const storedTheme = await page.evaluate(() => window.localStorage.getItem('rmdt-theme'));
    expect(storedTheme).toBe(themeValue);

    await page.getByRole('link', { name: 'Report a delivery' }).first().click();
    await page.waitForURL('**/report');

    await expect(html).toHaveAttribute('data-theme', themeValue);
    const storedAfterNav = await page.evaluate(() => window.localStorage.getItem('rmdt-theme'));
    expect(storedAfterNav).toBe(themeValue);
    await expect.poll(async () =>
      page.evaluate(() => getComputedStyle(document.body).backgroundColor)
    ).toBe(expectedBackground);
  });
});
