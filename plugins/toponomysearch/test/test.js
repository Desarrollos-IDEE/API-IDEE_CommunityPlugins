import Toponomysearch from 'facade/toponomysearch';

IDEE.config.PROXY_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/api/proxy';
IDEE.config.PROXY_POST_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/proxyPost';
IDEE.proxy(true);

const map = IDEE.map({
  container: 'mapjs',
  projection: 'EPSG:25830',
  wmcfiles: ['https://componentes.idee.es/estaticos/Datos/WMC/mapa.xml'],
});

const mp = new Toponomysearch();

map.addPlugin(mp);
