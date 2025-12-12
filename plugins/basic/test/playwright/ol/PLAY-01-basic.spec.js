import { test, expect } from '@playwright/test';

test('Test Basic', async ({ page }) => {
  await page.goto('/test/playwright/ol/basic-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Basic({});
  });
  
  const position = await page.evaluate(() => window.mp.position);
  expect(position).toBe('TR');
});
