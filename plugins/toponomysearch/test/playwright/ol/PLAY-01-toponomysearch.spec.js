import { test, expect } from '@playwright/test';

test('Test Toponomysearch', async ({ page }) => {
  await page.goto('/test/playwright/ol/toponomysearch-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Toponomysearch();
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
