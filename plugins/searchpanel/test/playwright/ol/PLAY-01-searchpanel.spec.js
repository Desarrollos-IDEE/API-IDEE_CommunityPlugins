import { test, expect } from '@playwright/test';

test('Test Searchpanel', async ({ page }) => {
  await page.goto('/test/playwright/ol/searchpanel-ol.html');
  await page.evaluate(() => {
    window.mapjs = IDEE.map({
      container: 'mapjs',
    });
    window.mp = new IDEE.plugin.Searchpanel({
      options: {
        position: 'TL'
      },
      config: {
        title: 'Buscador de Espacios Productivos',
        geosearchUrl: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geobusquedas/eepp-f1/search?',
        maxResults: 100,
        fields: [
          {
            field: 'municipio',
            alias: 'Municipio',
            label: 'Escribe el nombre del Municipio',
          },
          {
            field: 'provincia',
            alias: 'Provincia',
            label: 'Escribe el nombre de la Provincia',
          },
          {
            field: 'nombre',
            alias: 'Nombre',
            label: 'Escribe el nombre del Espacio Productivo',
          }
        ],
        infoFields: [
          {
            field: 'nombre',
            alias: 'Nombre '
          },
          {
            field: 'tipologia',
            alias: 'Tipología'
          },
          {
            field: 'municipio',
            alias: 'Municipio'
          },
          {
            field: 'provincia',
            alias: 'Provincia'
          }
        ]
      }
    });
    window.mapjs.addPlugin(window.mp);
  });
  
  const nPlugins = await page.evaluate(() => window.mapjs.getPlugins().length);
  expect(nPlugins).toBe(1);
});
