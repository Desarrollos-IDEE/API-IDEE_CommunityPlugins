import Findroute from 'facade/findroute.js';

IDEE.proxy(false);

IDEE.config.PROXY_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/api/proxy';
IDEE.config.PROXY_POST_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/proxyPost';

var myMap = IDEE.map({
  container: 'mapjs',
  layers: [new IDEE.layer.OSM()],
  projection: 'EPSG:25830'
});
window.map = myMap;

var mp = new Findroute({
  options: {
    searchstreetUrl: 'https://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/geocoderMunProvSrs',
    searchstreetNormalizar: 'https://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/normalizar',
    // Especificar url de instancia de OSRM
    //osrmurl: "",
    osrmurlAlternativa: "https://router.project-osrm.org",
    panel: {
      position: IDEE.ui.position.TL
    },
    conflictedPlugins: ["navigation", "tools", "panelSelectByPolygon"],    
    urlGeocoderInverso: "http://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/geocoderInversoSrs"
  }
});

// add here the plugin into the map
myMap.addPlugin(mp);
