import { test, expect } from '@playwright/test';

test('Test SearchStreetGeosearch', async ({ page }) => {
  await page.goto('/test/playwright/ol/searchstreetgeosearch-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.SearchstreetGeosearch({});
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
