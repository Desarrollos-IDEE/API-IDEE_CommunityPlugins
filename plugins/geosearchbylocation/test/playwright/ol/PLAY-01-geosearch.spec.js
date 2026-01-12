import { test, expect } from '@playwright/test';

test('Test Geosearchbylocation', async ({ page }) => {
  await page.goto('/test/playwright/ol/geosearchbylocation-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Geosearchbylocation({
      distance: 600,
      url: 'https://geobusquedas-sigc.juntadeandalucia.es',
      core: 'sigc',
      handler: '/search?',
    });
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
