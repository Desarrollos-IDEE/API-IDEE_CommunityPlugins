import { test, expect } from '@playwright/test';

test('Test CatalogSearch', async ({ page }) => {
  await page.goto('/test/playwright/ol/catalogsearch-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.CatalogSearch({
      geoNetworkUrl: 'http://www.ideandalucia.es/catalogo/inspire/srv/spa',
      collapsible: true,
      classname: 'm-catalogsearch',
    });
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
