<p align="center">
  <img src="https://componentes.idee.es/estaticos/imagenes/logos/API_IDEE/API_2/API_2.svg" height="152" />
</p>
<h1 align="center"><strong>API IDEE</strong> <small>🔌 IDEE.plugin.Printer</small></h1>

# Descripción

Plugin de impresión a través del servicio Geoprint3. Recibe como parámetro opcional la Configuración de impresión que consumir, siendo una Configuración un conjunto de plantillas y opciones de impresión (formatos, dpi) agrupadas bajo una denomincación. Así, cada aplicación web podrá tener su propia Configuración para imprimir plantillas personalizadas. 

# Dependencias

Para que el plugin funcione correctamente es necesario importar las siguientes dependencias en el documento html:
Para uso de implementación OpenLayers:
- **printerdos.ol.min.js**
- **printerdos.ol.min.css**

Para uso de implementación Cesium:
- **printerdos.cesium.min.js**
- **printerdos.cesium.min.css**

# Uso del histórico de versiones

Existe un histórico de versiones de todos los plugins en el directorio `legacy/` de cada plugin. 
Es recomendable fijar las versiones para evitar errores inesperados.

Ejemplo con el plugin printerdos, implementación OpenLayers y versión 1.0.0:
- printerdos-1.0.0.ol.min.css
- printerdos-1.0.0.ol.min.js


# Parámetros

El constructor se inicializa con un JSON con los siguientes atributos:
- **url**. (opcional) Url de la Configuración que consumir.
- **params.urlApplication**. (opcional) Instancia de Geoprint3.
- **params.layout.outputFilename**. (opcional) Nombre fichero generado.
- **params.parameters.imagenCoordenadas**. (opcional) Imagen rosa de los vientos.
- **params.parameters.imagenAndalucia**. (opcional) Logo Junta de Andalucía.
- **options.legend**. (opcional) Indica si se desea mostrar la leyenda.
- **options.dpi**.(opcional) Valor por defecto para el selector dpi.
- **options.layout**. (opcional) Plantilla preseleccionada.
- **options.format**. (opcional) Valor por defecto para el selector de formato.
- **options.forceScale**. (opcional) Check de forzar escala marcado, false por defecto . 
- **options.labeling.conflictResolution**. (opcional) Cuando su valor es verdadero no permite que se superpongan dos etiquetas.
- **options.labeling.goodnessOfFit**. (opcional) Establece el porcentaje de la etiqueta que debe ubicarse dentro de la geometría para permitir dibujar la etiqueta.
- **options.labeling.allowOverruns**. (opcional) Cuando su valor es falso no permite que las etiquetas de las líneas vayan más allá del principio / final de la línea.
- **options.labeling.autoWrap**. (opcional) Número de píxeles que son en los que una etiqueta larga debe dividirse en varias líneas.
- **options.labeling.conflictResolution**. (opcional) 
- **options.labeling.followLine**. (opcional) Cuando su valor es verdadero activa etiquetas curvas en geometrías lineales.
- **options.labeling.group**. (opcional) Cuando su valor es verdadero las geometrías con las mismas etiquetas se agrupan y se consideran una sola entidad para etiquetar.
- **options.labeling.maxDisplacement**. (opcional) La distancia, en píxeles, a la que se puede desplazar una etiqueta desde su posición natural en un intento de encontrar una posición que no entre en conflicto con las etiquetas ya dibujadas.
- **options.labeling.spaceAround**. (opcional) la distancia mínima entre dos etiquetas, en píxeles.
- **options.layout**. (opcional) Plantilla preseleccionada.

# API-REST

```javascript
URL_API?printerdos=url
```

<table>
    <tr>
        <th>Parámetros</th>
        <th>Opciones/Descripción</th>
        <th>Disponibilidad</th>
    </tr>
    <tr>
        <td>url</td>
        <td>URL del servicio de impresión</td>
        <td>Base64 ✔️ | Separador ✔️</td>
    </tr>
    <tr>
        <td>params</td>
        <td>Objeto con parámetros descritos anteriormente</td>
        <td>Base64 ✔️ | Separador ❌</td>
    </tr>
    <tr>
        <td>options</td>
        <td>Objeto con opciones descritas anteriormente</td>
        <td>Base64 ✔️ | Separador ❌</td>
    </tr>
</table>

### Ejemplos de uso API-REST
```
https://componentes.idee.es/api-idee?printerdos=url

```
https://componentes.idee.es/api-idee?printerdos=https://geoprint-sigc.juntadeandalucia.es/geoprint3/print/SIGC&layers=OSM
```

### Ejemplo de uso API-REST en base64

Para la codificación en base64 del objeto con los parámetros del plugin podemos hacer uso de la utilidad IDEE.utils.encodeBase64.
Ejemplo:
```javascript
IDEE.utils.encodeBase64(obj_params);
```

Ejemplo de constructor:
```javascript
{
  url: 'https://geoprint-sigc.juntadeandalucia.es/geoprint3/print/SIGC',
}
```
```
https://componentes.idee.es/api-idee?printerdos=base64=eyJ1cmwiOiJodHRwczovL2dlb3ByaW50LXNpZ2MuanVudGFkZWFuZGFsdWNpYS5lcy9nZW9wcmludDMvcHJpbnQvU0lHQyJ9&layers=OSM
```


# Ejemplos de uso


Configuración por defecto sin parámetros:
```javascript
mapajs.addPlugin(new IDEE.plugin.Printer());
```  

Configuración con parámetros:
```javascript
mapajs.addPlugin(new IDEE.plugin.Printer({
  url: 'https://geoprint-sigc.juntadeandalucia.es/geoprint3/print/SIGC',
  params: {
    urlApplication: 'https://geoprint-sigc.juntadeandalucia.es/geoprint3',
    layout: {
      outputFilename: 'impresion_${yyyy-MM-dd_hhmmss}',
    },
    parameters: {
      imagenCoordenadas: 'file://windrose.png',
      imagenAndalucia: 'file://logo_JA.png',
    }
  },
  options: {
    legend: true,
    dpi: 300,
    layout: 'A4 landscape (SIGC)',
    format: 'png',
    conflictResolution: true,  // Solo una vez, elige el valor que necesites
    goodnessOfFit: 0.5,
    allowOverruns: false,
    autoWrap: 400,
    followLine: true,
    group: false,
    maxDisplacement: 400,
    spaceAround: 50
  }
}));
```

# 👨‍💻 Desarrollo

Para el stack de desarrollo de este componente se ha utilizado

* NodeJS Versión: 16 o superior
* NPM Versión: 8.19.4 o superior

## 📐 Configuración del stack de desarrollo / *Work setup*


### 🐑 Clonar el repositorio / *Cloning repository*

Para descargar el repositorio en otro equipo lo clonamos:

```bash
git clone [URL del repositorio]
```

### 1️⃣ Instalación de dependencias / *Install Dependencies*

```bash
npm i
```

### 2️⃣ Arranque del servidor de desarrollo / *Run Application*

```bash
npm run start:ol
npm run start:cesium
```

## 📂 Estructura del código / *Code scaffolding*

```any
/
├── src 📦                  # Código fuente
├── legacy 📁               # Histórico de versiones
├── task 📁                 # EndPoints
├── test 📁                 # Testing
├── webpack-config 📁       # Webpack configs
└── ...
```
## 📌 Metodologías y pautas de desarrollo / *Methodologies and Guidelines*

Metodologías y herramientas usadas en el proyecto para garantizar el Quality Assurance Code (QAC)

* ESLint
  * [NPM ESLint](https://www.npmjs.com/package/eslint) \
  * [NPM ESLint | Airbnb](https://www.npmjs.com/package/eslint-config-airbnb)

## ⛽️ Revisión e instalación de dependencias / *Review and Update Dependencies*

Para la revisión y actualización de las dependencias de los paquetes npm es necesario instalar de manera global el paquete/ módulo "npm-check-updates".

```bash
# Install and Run
$npm i -g npm-check-updates
$ncu
```
