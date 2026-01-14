/* eslint-disable max-len,object-property-newline */
import SearchStreetGeosearch from 'facade/searchstreetgeosearch';

IDEE.config.PROXY_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/api/proxy';
IDEE.config.PROXY_POST_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/proxyPost';
IDEE.proxy(true);
IDEE.language.setLang('es');

const map = IDEE.map({
  container: 'mapjs',
  projection: 'EPSG:25830',
  wmcfiles: ['https://componentes.idee.es/estaticos/Datos/WMC/mapa.xml'],
});
window.map = map;

const mp = new SearchStreetGeosearch({
  // locality: '41091',
});
map.addPlugin(mp); window.mp = mp;
