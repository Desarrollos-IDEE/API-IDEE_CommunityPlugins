# IDEE.plugin.CatalogSearch

Plugin de Mapea desarrollado por el Instituto de Estadística y Cartografía dedicado a realizar búsquedas sobre un catálogo de metados implementado con Geonetwork.

Al realizar la búsqueda, si alguno de los resultados es un servicio OGC, permitirá consultar las capas del mismo y añadirlas al mapa de forma interactiva

![Imagen1](./docs/images/catalogsearch_1.png)

## Dependencias

- catalogsearch.ol.min.js
- catalogsearch.ol.min.css

## Parámetros

- El constructor se inicializa con un JSON de _options_ con los siguientes atributos:

- **geoNetworkUrl**. URL de geoNetwork.
- **collapsible**. Si es *true*, el botón aparece, y puede desplegarse y contraerse. Si es *false*, el botón no aparece. Por defecto tiene el valor *true*.
- **classname**. Indica una clase CSS para aplicar al panel.

## Ejemplos de uso

### Ejemplo 1
```javascript
   const map = IDEE.map({
     container: 'map'
   });

   const mp = new IDEE.plugin.CatalogSearch({});

   map.addPlugin(mp);
```
### Ejemplo 2
```javascript
const mp = new IDEE.plugin.CatalogSearch({
  geoNetworkUrl: 'http://www.ideandalucia.es/catalogo/inspire/srv/spa',
  classname: 'm-catalogsearch',
  collapsible: false
});

map.addPlugin(mp);
```
### Ejemplo 3
```javascript
const mp = new IDEE.plugin.CatalogSearch({});

map.addPlugin(mp);
```
