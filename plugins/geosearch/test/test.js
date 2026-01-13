import Geosearch from 'facade/geosearch';

IDEE.config.PROXY_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/api/proxy';
IDEE.config.PROXY_POST_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/proxyPost';
IDEE.proxy(true);

IDEE.language.setLang('es');
// IDEE.language.setLang('en');

const map = IDEE.map({
  container: 'mapjs',
  wmcfiles: ['https://componentes.idee.es/estaticos/Datos/WMC/mapa.xml'],
  projection: 'EPSG:25830'
});
window.map = map;

const mp = new Geosearch({
  url: 'https://geobusquedas-sigc.juntadeandalucia.es',
  core: 'sigc',
  handler: '/search?',
});
map.addPlugin(mp); window.mp = mp;
