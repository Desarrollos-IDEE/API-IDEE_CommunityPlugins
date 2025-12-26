import { test, expect } from '@playwright/test';

test('Test Findroute', async ({ page }) => {
  await page.goto('/test/playwright/ol/findroute-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Findroute({options: {
      // Especificar url de instancia de OSRM
      //osrmurl: "",
      osrmurlAlternativa: "https://router.project-osrm.org",
      panel: {
        position: IDEE.ui.position.TL
      },
      conflictedPlugins: ["navigation", "tools", "panelSelectByPolygon"],    
      urlGeocoderInverso: "http://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/geocoderInversoSrs"
    }});
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
