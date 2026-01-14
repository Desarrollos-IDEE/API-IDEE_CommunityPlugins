import CatalogSearch from 'facade/catalogsearch';

IDEE.config.PROXY_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/api/proxy';
IDEE.config.PROXY_POST_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/proxyPost';
IDEE.proxy(true);

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
