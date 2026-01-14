import { test, expect } from '@playwright/test';

test('Test Searchstreet', async ({ page }) => {
  await page.goto('/test/playwright/ol/searchstreet-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Searchstreet({});
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
