/* eslint-disable max-len,object-property-newline */
import Printerdos from 'facade/printerdos';

IDEE.language.setLang('es');
// IDEE.language.setLang('en');

const map = IDEE.map({
  container: 'mapjs',
  layers: ['OSM'],
});
window.map = map;

const mp = new Printerdos('https://geoprint-sigc.juntadeandalucia.es/geoprint3/print/SIGC');


map.addPlugin(mp);
window.mp = mp;
