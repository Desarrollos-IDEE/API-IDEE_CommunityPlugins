import Geosearch from 'facade/geosearch';

IDEE.language.setLang('es');
// IDEE.language.setLang('en');

const map = IDEE.map({
  container: 'mapjs',
  layers: [new IDEE.layer.OSM()],
  projection: 'EPSG:25830'
});
window.map = map;

const mp = new Geosearch({});
map.addPlugin(mp); window.mp = mp;
