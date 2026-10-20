# API-IDEE Community Plugins

Repositorio de plugins comunitarios para la **API IDEE**. Este proyecto contiene plugins desarrollados por la comunidad que extienden las funcionalidades de la API IDEE.
Los plugins que pueden ser utilizados con la API IDEE para añadir funcionalidades adicionales a aplicaciones de mapas web.

## Estructura del Proyecto

```
API-IDEE_CommunityPlugins/
├── configuration/              # Directorio para configuraciones
│   ├── plugins.js              # Fichero necesario para generar la galería (estático)
│   ├── config.js               # Entornos/versiones API-IDEE + identificador google analytics + url de recursos estaticos + código de cambio de entorno API-IDEE
│   └── google_analytics_content.js
├── data/
│   ├── plugins.json            # Alta de plugins para la galería
│   ├── resourcesPlugins.json   # Recursos publicados de plugins
│   └── resources-collapsed-test/  # Colapso Entorno/API
│       ├── gallery-test-collapse.js
│       └── gallery-test-collapse.css
└── gallery/
│   ├── index.html              # Página principal de la galería
│   ├── test.html               # Wrapper único: selectores + iframe (?plugin=…)
│   └── <nombre-plugin>/        # Tests del plugin en la galería
│       ├── test-v1.html        # Test legacy (plugins/…/legacy/)
│       └── test-v2.html        # Test dist / paneles API-IDEE v2
├── plugins/                    # Código fuente de los plugins
│   └── archetype/              # Plantilla base
│       ├── dist/               # Última versión compilada
│       ├── legacy/             # Histórico de versiones
│       ├── src/
│       ├── test/
│       └── …
├── readme.md
├── resources/                  # Plantillas webpack, task, playwright, eslint
└── …
```

## Guía de uso de plugins en visualizadores

Para hacer uso de los plugins disponibles en API-IDEE Community Plugins importa los archivos CSS y JS correspondientes al plugin que deseas añadir a tu visualizador:

Ejemplo con el plugin Archetype:

```html
<!-- Para implementación OpenLayers -->
<link href="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/dist/archetype.ol.min.css" rel="stylesheet" />
<script type="text/javascript" src="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/dist/archetype.ol.min.js"></script>

<!-- Para implementación Cesium -->
<link href="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/dist/archetype.cesium.min.css" rel="stylesheet" />
<script type="text/javascript" src="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/dist/archetype.cesium.min.js"></script>
```

### Ejemplo de Uso

```javascript
// Crear el mapa
const map = IDEE.map({
    container: 'mapjs',
});

// Instanciar el plugin
const mp = new IDEE.plugin.Archetype({
    position: 'TR',
    collapsed: true,
    collapsible: true,
    tooltip: 'Plugin básico'
});

// Añadir el plugin al mapa
map.addPlugin(mp);
```

## Versionado

Existe un histórico de versiones de todos los plugins en el directorio `legacy/` de cada uno de ellos.
Es recomendable fijar las versiones para evitar errores inesperados.

Ejemplo con el plugin Archetype, implementación OpenLayers y versión 1.0.0:

```html
<link href="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/legacy/archetype-1.0.0.ol.min.css" rel="stylesheet" />
<script type="text/javascript" src="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/legacy/archetype-1.0.0.ol.min.js"></script>
```

Para conocer todas las versiones disponibles es necesario acceder a la carpeta legacy del plugin.
En caso de no desear fijar versión y disponer del plugin siempre actualizado en el visualizador se apuntaría a la carpeta dist del plugin.
Ejemplo con el plugin Archetype:

```html
<link href="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/dist/archetype.ol.min.css" rel="stylesheet" />
<script type="text/javascript" src="https://componentes.idee.es/api-idee-communityplugins/plugins/archetype/dist/archetype.ol.min.js"></script>
```

## Desarrollo

### Requisitos Previos

- **Node.js**: Versión 16 o superior
- **NPM**: Versión 8.19.4 o superior

### Configuración del Entorno de Desarrollo

1. **Clonar el repositorio**

```bash
git clone https://github.com/Desarrollos-IDEE/API-IDEE_CommunityPlugins.git
cd API-IDEE_CommunityPlugins
```

2. **Instalar dependencias del plugin**

Ejemplo con el plugin Archetype:

```bash
cd plugins/archetype
npm install
```

3. **Iniciar el servidor de desarrollo**

```bash
# Para OpenLayers
npm run start:ol

# Para Cesium
npm run start:cesium
```

### Estructura de un Plugin

Cada plugin debe seguir esta estructura:

```
plugin-name/
├── dist/                # Archivos última versión compilados
├── legacy/              # Histórico de versiones
├── playwright-config/   # Configuración playwright
├── src/
│   ├── facade/          # Código común 
│   │   ├── js/          # JavaScript del plugin
│   │        └── i18n/   # Archivos de internacionalización
│   │   ├── assets/      # CSS, imágenes, fuentes
│   ├── impl/            # Implementaciones específicas
│   │   ├── ol/          # Implementación para OpenLayers
│   │   └── cesium/      # Implementación para Cesium
│   ├── templates/       # Plantillas HTML
│   ├── api.json         # Metadatos y configuración del plugin
├── test/                # Tests
│   ├── playwright/      # Tests automático con playwright
│   ├── dev.html         # Test desarrollo (HTML)
│   ├── test.js          # Test desarrollo (JS)
│   ├── prod.html        # Test desarrollo compilado (HTML + JS)
└── webpack-config/      # Configuraciones de Webpack
└── README.md            # Documentación del plugin
└── ...                  # Otros ficheros y directorios
```

### Testing

Cada plugin incluye archivos de test de desarrollo en el directorio `test/`:

- `dev.html` - Para pruebas en desarrollo
- `prod.html` - Para pruebas en desarrollo con el plugin compilado

Además se incluyen test automáticos para pruebas repetitivas o comprobaciones tras cambio de versiones/modificaciones.
Para la ejecución de test automáticos es necesario ejecutar previamente `npx -y playwright@1.50.1 install` para instalar playwright en la máquina.

### Contribución

¡Tus aportes son bienvenidos! Para colaborar:

1. Realiza un fork de nuestro repositorio
2. Crea una rama para tu feature (`git checkout -b feat_nombre_nuevo-plugin`)
3. Desarrolla tu plugin siguiendo la estructura establecida
   > 3.1. Copia la estructura del plugin `archetype` como plantilla o usa la herramienta de npm [api-idee-create-plugin](https://www.npmjs.com/package/api-idee-create-plugin) para crear una base para tu plugin
   Nota: en caso de copiar el plugin archetype será necesario reemplazar archetype/Archetype por el nombre de tu plugin
   > 3.2. Modifica los archivos según tus necesidades  
   > 3.3. Desarrolla las implementaciones para OpenLayers y/o Cesium (no es necesario que estén ambas implementadas pero al menos debe contar con la estructura básica). La estructura básica cuenta con:
   - Creación de la estructura plugin/src/impl/cesium/js y plugin/src/impl/ol/js.
   - Creación del fichero de implementación con al menos el contenido (ejemplo de Archetype):
   <pre>
      /**
      * @module IDEE/impl/control/ArchetypeControl
      */
   </pre>
   > 3.4. Implementar test en desarrollo y automático (playwright)
4. Compila y prueba tu plugin
5. Integra el plugin en la galería (ver sección [Integrar un nuevo plugin en la galería](#integrar-un-nuevo-plugin-en-la-galería))
6. Dar de alta el plugin en `data/plugins.json` (necesario para que aparezca en la galería)
7. Envía un Pull Request

<a id="normas-pull-request"></a>Para que un Pull Request sea aceptado se deben cumplir las siguientes normas:

1. Disponer del directorio "legacy" en la raíz de la carpeta del plugin donde se almacenarán el histórico de versiones
2. Tener documentado correctamente el fichero api.json y README.md
3. Disponer de la implementación en OpenLayers y/o en Cesium JS
Nota: no es necesario el desarrollo de ambas implementaciones pero si de la estructura básica
4. Compilar correctamente
5. Disponer de al menos 1 test en la galería, este test debe ser interactivo permitiendo visualizar todos los parámetros disponibles e interactuar con ellos (ver [Integrar un nuevo plugin en la galería](#integrar-un-nuevo-plugin-en-la-galería))
6. Crear al menos un test automático con playwright. Puedes ver un ejemplo en el plugin archetype dentro de su carpeta test/playwright

### Integrar un nuevo plugin en la galería

La galería (`gallery/`) es lo que se muestra desde `gallery/index.html`. Cada plugin necesita su carpeta de tests y el alta en `data/plugins.json`.

Usa como plantilla `gallery/archetype/`.

#### 1. Crear la carpeta de tests

```
gallery/test.html                 # Único para todos los plugins (?plugin=<nombre>)
gallery/<nombre-plugin>/
├── test-v1.html   # Test con build legacy (paneles API-IDEE v1)
└── test-v2.html   # Test con build dist (paneles API-IDEE v2)
```

- **`gallery/test.html`**: wrapper único (barra `#config-bar` + iframe). No hay que copiarlo por plugin; en `plugins.json` se enlaza con `?plugin=<nombre>`.
- **`test-v1.html`**: usa los mimificados del plugin desde `plugins/<nombre>/legacy/…`.
- **`test-v2.html`**: usa los mimificados del plugin desde `plugins/<nombre>/dist/…`.

Los selectores de **Entorno** y **Versión API-IDEE** están en `gallery/index.html` y en `gallery/test.html`. Se definen en `configuration/config.js` (`IDEE_ENVIRONMENTS`): cada versión lleva un número de panel (`1` → `test-v1` / legacy, `2` → `test-v2` / dist). Al cambiarlos se actualiza la URL (`?entorno=&version=`) sin recargar la página; en el test solo se recarga el iframe.

#### 2. Formulario de parámetros (test interactivo)

**v2 (recomendado)** — estructura esperada por el CSS de API-IDEE y por el colapso de la galería:

```html
<div class="m-api-idee-test-form-frame">
  <div class="m-test-form">
    <!-- un <div> por parámetro: label + input/select/textarea -->
  </div>
  <div class="m-test-buttons">
    <button class="m-test-button" id="botonEliminar">Eliminar Plugin</button>
  </div>
</div>
<div id="mapjs" class="m-container"></div>
```

No envuelvas `.m-test-form` en contenedores extra: el CSS de API-IDEE usa selectores de hijo directo (`body > .m-api-idee-test-form-frame > .m-test-form`).

**v1 (legacy)** — suele ser un `<div>` con los controles antes de `#mapjs`.

El colapso lo inyecta solo `data/resources-collapsed-test/gallery-test-collapse.js` (no hace falta añadirlo en el HTML):

- «Mostrar / Ocultar entorno / versión» sobre `#config-bar` en `gallery/test.html`.
- «Mostrar / Ocultar parámetros» sobre el formulario del test dentro del iframe.

#### 3. Alta en `data/plugins.json`

Añade una entrada (ejemplo mínimo):

```json
{
  "name": "miplugin",
  "plugin": "[miplugin]",
  "version": "v1.0.0",
  "description": "Descripción breve",
  "url_es": "../gallery/test.html?plugin=miplugin&language=es",
  "url_en": "../gallery/test.html?plugin=miplugin&language=en",
  "url_git": "https://github.com/Desarrollos-IDEE/API-IDEE_CommunityPlugins/tree/main/plugins/miplugin",
  "obsolete": false
}
```

- `version`: se muestra en la tarjeta de la galería.
- `obsolete`: si es `true`, el plugin aparece en la sección «Plugins obsoletos».

La galería apunta siempre al `gallery/test.html` único (`?plugin=nombre`); el iframe carga `<plugin>/test-v1.html` o `test-v2.html` según `configuration/config.js` y los selectores de entorno / versión.

#### Migración

¿Tienes un plugin ya desarrollado y quieres añadirlo a nuestro repositorio? ¡También eres bienvenido!
Sigue esta guía para poder contribuir:

1. Revisa la configuración de Webpack:
Dentro del plugin existe un directorio webpack-config.
Puedes sustituir los ficheros por los de `resources/webpack-config` para que cumplan con los requisitos de API-IDEE Community Plugins.
Notas:

- Si tienes configuraciones extras debes añadirlas a estos ficheros.
- Si dispones en tu plugin de la carpeta `src/facade/assets/images` debes descomentar las líneas:

<pre>
        // , {
        //   from: 'src/facade/assets/images',
        //   to: 'images',
        // },
</pre>
de los ficheros `webpack.production-cesium.config.js` y `webpack.production-ol.config.js`.

- Debes modificar

<pre>
    'archetype.cesium.min': path.resolve(__dirname, '..', 'src', 'index-cesium.js'),
    [`archetype-${pjson.version}.cesium.min`]: path.resolve(__dirname, '..', 'src', 'index-cesium.js'),
</pre>
del fichero `webpack.production-cesium.config.js`
y
<pre>
  entry: {
    'archetype.ol.min': path.resolve(__dirname, '..', 'src', 'index-ol.js'),
    [`archetype-${pjson.version}.ol.min`]: path.resolve(__dirname, '..', 'src', 'index-ol.js'),
  },
</pre>
del fichero `webpack.production-ol.config.js`
sustituyendo archetype por el nombre de tu plugin.

2. Revisa tus ficheros task:
Dentro del plugin existe un directorio task.
Puedes sustituir los ficheros por los de `resources/task` para que cumplan con los requisitos de API-IDEE Community Plugins.
Nota: si tienes configuraciones extras debes añadirlas a estos ficheros

3. Añade la configuración de playwright:
En la raíz del directorio del plugin copia la carpeta `resources/playwright-config`.
Y si en el package.json no existe la dependencia "@playwright/test" añádela de la siguiente forma: "@playwright/test": "1.50.1".

4. Configuración básica .eslintrc:
En la raíz del del plugin debe existir el fichero .eslintrc.
Puedes usar de base el de `resources/.eslintrc`.

5. Actualización de librerías en package.json:
Es recomendable actualizar las librerías de tu plugin en fichero package.json principalmente las librerías comunes que se encuentran con el plugin archetype.

6. Comprueba que el fichero package.json dispone en el apartado "scripts", al menos, el siguiente contenido:

```
    "start": "webpack serve --config=webpack-config/webpack.development-ol.config.js",
    "start:ol": "webpack serve --config=webpack-config/webpack.development-ol.config.js",
    "start:cesium": "webpack serve --config=webpack-config/webpack.development-cesium.config.js",
    "prebuild": "npm run prebuild:ol && npm run prebuild:cesium",
    "prebuild:ol": "node task/create-entrypoint-ol.js",
    "prebuild:cesium": "node task/create-entrypoint-cesium.js",
    "build": "webpack --config=webpack-config/webpack.production-ol.config.js && webpack --config=webpack-config/webpack.production-cesium.config.js && npm run copy-legacy",
    "copy-legacy": "node task/copy-to-legacy.js",
    "test-build": "npm run build && live-server --open=test/prod.html",
    "check": "eslint ./src",
    "fix": "eslint --fix ./src"
```

Nota: por lo general, tendrás algunos comandos ya establecidos pero serán necesarios adaptarlos para que permitan sus despliegues tanto en OpenLayers como en Cesium, así como el versionado automático en legacy.

7. Los test del plugin deben apuntar a un despliegue de API-IDEE.

8. Crear la estructura básica para Cesium (disponible en el plugin archetype).

9. Renombrar, en caso de que exista, "M." por "IDEE.".

10. Comprobar que el plugin compila correctamente. En caso de errores puedes consultar nuestro [fichero de errores conocidos](Errores%20conocidos.txt).

11. Actualizar versión del plugin. Si es la primera vez que se sube debe tener la versión 1.0.0.

12. Revisar readme y api.json del plugin.

13. Si el plugin tiene su propio .gitignore es necesario revisar si es realmente necesario ya que este repositorio tiene su propio .gitignore.

14. [Revisa las normas](#normas-pull-request) antes de hacer el Pull Request.

15. ¡GRACIAS!

## 📄 Licencia

Los plugins en este repositorio están licenciados bajo la **European Union Public Licence (EUPL) v. 1.2**.

## 🔗 Enlaces Útiles

- [API IDEE - Documentación Oficial](https://github.com/Desarrollos-IDEE/API-IDEE/wiki)
- [Repositorio Principal API-IDEE](https://github.com/Desarrollos-IDEE/API-IDEE)
