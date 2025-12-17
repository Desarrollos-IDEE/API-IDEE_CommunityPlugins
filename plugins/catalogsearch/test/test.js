import CatalogSearch from 'facade/catalogsearch';

const map = IDEE.map({
  container: 'mapjs',
});

const mp = new CatalogSearch({
  geoNetworkUrl: 'http://www.ideandalucia.es/catalogo/inspire/srv/spa',
  collapsible: true,
  classname: 'm-catalogsearch',
});

map.addPlugin(mp);

window.map = map;
