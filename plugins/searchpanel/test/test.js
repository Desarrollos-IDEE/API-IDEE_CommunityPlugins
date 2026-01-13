import Searchpanel from 'facade/searchpanel';

IDEE.config.PROXY_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/api/proxy';
IDEE.config.PROXY_POST_URL = 'https://mapea4-sigc.juntadeandalucia.es/mapea/proxyPost';
IDEE.proxy(true);

const map = IDEE.map({
  container: 'mapjs',
});

map.addControls(['Scale', 'ScaleLine', 'panzoom', 'location', 'rotate']);



const configFuentesyManantiales = {
  options: {
    position: 'BR'
  },
  config: {
    title: 'Fuentes y Manantiales de Andalucía',
    geosearchUrl: 'https://geobusquedas-sigc.juntadeandalucia.es/geobusquedas/fuentesymanantiales/search_html?',
    maxResults: 100,
    fields: [
      {
        field: 'nombre',
        alias: 'Nombre',
        label: 'Escribe el nombre',
      },
      {
        field: 'municipio_fuente',
        alias: 'Municipio',
        label: 'Escribe el nombre del Municipio',
      },
      {
        field: 'provincia_fuente',
        alias: 'Provincia',
        label: 'Escribe el nombre de la Provincia',
      }
    ],
    infoFields: [
      {
        field: 'nombre',
        alias: 'Nombre '
      },
      {
        field: 'imagen',
        alias: 'imagen'
      },
      {
        field: 'tipo',
        alias: 'Tipo'
      },
      {
        field: 'enlace',
        alias: 'Ficha'
      },
      {
        field: 'municipio_fuente',
        alias: 'Municipio'
      },
      {
        field: 'provincia_fuente',
        alias: 'Provincia'
      }
    ]
  }
}



const configDirectorioEmpresas = {
  options: {
    position: 'TL'
  },
  config: {
    title: 'Buscador de Espacios Productivos',
    geosearchUrl: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geobusquedas/eepp-f1_directorio/search?',
    maxResults: 100,
    fields: [
      {
        field: 'razon_soci',
        alias: 'Nombre',
        label: 'Escribe el nombre (Razón social)',
      }
    ],
    infoFields: [
      {
        field: 'razon_soci',
        alias: 'Nombre '
      },
      {
        field: 'actividad',
        alias: 'Actividad'
      },
      {
        field: 'estrato',
        alias: 'asalariados'
      },
      {
        field: 'nombre',
        alias: 'Espacio Productivo'
      },
      {
        field: 'direccion',
        alias: 'Dirección'
      }
    ]
  }
}



const configEspaciosProductivos = {
  options: {
    position: 'TL'
  },
  config: {
    title: 'Buscador de Espacios Productivos',
    geosearchUrl: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geobusquedas/eepp-f1/search?',
    maxResults: 100,
    fields: [
      {
        field: 'municipio',
        alias: 'Municipio',
        label: 'Escribe el nombre del Municipio',
      },
      {
        field: 'provincia',
        alias: 'Provincia',
        label: 'Escribe el nombre de la Provincia',
      },
      {
        field: 'nombre',
        alias: 'Nombre',
        label: 'Escribe el nombre del Espacio Productivo',
      }
    ],
    infoFields: [
      {
        field: 'nombre',
        alias: 'Nombre '
      },
      {
        field: 'tipologia',
        alias: 'Tipología'
      },
      {
        field: 'municipio',
        alias: 'Municipio'
      },
      {
        field: 'provincia',
        alias: 'Provincia'
      }
    ]
  }
}


const configMunicipos = {
  options: {
    position: 'TR'
  },
  config: {
    title: 'Buscador de Municipios',
    geosearchUrl: 'http://geobusquedas-sigc.juntadeandalucia.es/sigc/search?',
    maxResults: 200,
    fields: [
      {
        field: 'municipio',
        alias: 'Municipio',
        label: 'Escribe el nombre del Municipio',
      }
    ],
    infoFields: [
      {
        field: 'municipio',
        alias: 'Municipio'
      },
      {
        field: 'nombre_provincia',
        alias: 'Provincia'
      }
    ]
  }
}

const configPlayas = {
  options: {
    position: 'BL'
  },
  config: {
    title: 'Buscador de Playas',
    geosearchUrl: 'https://www.juntadeandalucia.es/institutodeestadisticaycartografia/geobusquedas/playas/search?',
    maxResults: 100,
    fields: [
      {
        field: 'nombre_playa',
        alias: 'Playa',
        label: 'Escribe el nombre de la Playa',
      },
      {
        field: 'nombre_municipio',
        alias: 'Municipio',
        label: 'Escribe el nombre del Municipio',
      },
      {
        field: 'provincia',
        alias: 'Provincia',
        label: 'Escribe el nombre de la Provincia'
      }
    ],
    infoFields: [
      {
        field: 'nombre_playa',
        alias: 'Playa'
      },
      {
        field: 'nombre_municipio',
        alias: 'Municipio'
      },
      {
        field: 'aseos',
        alias: 'Aseos'
      },
      {
        field: 'salvamento_y_socorrismo',
        alias: 'Salvamento y Socorrismo'
      }
    ]
  }
}

//const mp = new Searchpanel(configFuentesyManantiales);
//const mp = new Searchpanel(configDirectorioEmpresas);
//const mp = new Searchpanel(configEspaciosProductivos);
const mp = new Searchpanel(configMunicipos);
//const mp = new Searchpanel(configPlayas);

map.addPlugin(mp);
