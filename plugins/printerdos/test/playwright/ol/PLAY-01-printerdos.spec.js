import { test, expect } from '@playwright/test';

test('Test PrinterDos', async ({ page }) => {
  await page.goto('/test/playwright/ol/printerdos-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Printer({});
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
