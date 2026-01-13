import Toponomysearch from 'facade/toponomysearch';

const map = IDEE.map({
  container: 'mapjs',
  projection: 'EPSG:25830',
  wmcfiles: ['https://componentes.idee.es/estaticos/Datos/WMC/mapa.xml'],
});

const mp = new Toponomysearch();

map.addPlugin(mp);
