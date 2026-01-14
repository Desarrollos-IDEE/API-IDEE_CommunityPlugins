<p align="center">
  <img src="https://www.ign.es/resources/viewer/images/logoApiCnig0.5.png" height="152" />
</p>
<h1 align="center"><strong>API IDEE</strong> <small>🔌 IDEE.plugin.Searchstreet</small></h1>

# Descripción

Buscador de vías y portales a través del Servicio de Geocodificación del Callejero Digital de Andalucía Unificado (CDAU), con autocompletado, a través de sus versiones REST JSON. Posibilidad de limitar el ámbito de búsqueda estableciendo el parámetro 'locality' al código INE del municipio donde buscar.

# Dependencias

Para que el plugin funcione correctamente es necesario importar las siguientes dependencias en el documento html:
Para uso de implementación OpenLayers:
- **searchstreet.ol.min.js**
- **searchstreet.ol.min.css**

Para uso de implementación Cesium:
- **searchstreet.cesium.min.js**
- **searchstreet.cesium.min.css**

# Uso del histórico de versiones

Existe un histórico de versiones de todos los plugins en el directorio `legacy/` de cada plugin. 
Es recomendable fijar las versiones para evitar errores inesperados.

Ejemplo con el plugin searchstreet, implementación OpenLayers y versión 1.0.0:
- searchstreet-1.0.0.ol.min.css
- searchstreet-1.0.0.ol.min.js

# Parámetros

El constructor se inicializa con un JSON con los siguientes atributos:

- **locality**: Código INE del municipio donde se quiere limitar la búsqueda. Es un parámetro opcional. Si no se especifica, la búsqueda se realizará en toda Andalucía. Ejemplo: '41091'.

# API-REST

```javascript
URL_API?searchstreet=locality
```

<table>
  <tr>
    <th>Parámetros</th>
    <th>Opciones/Descripción</th>
    <th>Disponibilidad</th>
  </tr>
  <tr>
    <td>locality</td>
    <td>Código INE</td>
    <td>Base64 ✔️ | Separador ✔️</td>
  </tr>
</table>

### Ejemplos de uso API-REST

```
https://componentes.idee.es/api-idee?searchstreet=locality
```

```
https://componentes.idee.es/api-idee?searchstreet=41091&projection=EPSG:25830&wmcfile=https://componentes.idee.es/estaticos/Datos/WMC/mapa.xml*Mapa
```
### Ejemplos de uso API-REST en base64

Para la codificación en base64 del objeto con los parámetros del plugin podemos hacer uso de la utilidad IDEE.utils.encodeBase64.
Ejemplo:
```javascript
IDEE.utils.encodeBase64(obj_params);
```

Ejemplo de constructor del plugin:
```javascript
{
  locality: '41091'
}
```

```
https://componentes.idee.es/api-idee/?searchstreet=base64=eyJsb2NhbGl0eSI6IjQxMDkxIn0=&projection=EPSG:25830&wmcfile=https://componentes.idee.es/estaticos/Datos/WMC/mapa.xml*Mapa
```

# Ejemplo de uso

Configuración por defecto:
```
mapajs.addPlugin(new IDEE.plugin.Searchstreet({}));
```

Limitar búsquedas a un municipio:
```
mapajs.addPlugin(new IDEE.plugin.Searchstreet({
  "locality": "41091"
}));
```

# 👨‍💻 Desarrollo

Para el stack de desarrollo de este componente se ha utilizado

* NodeJS Version: 14.16
* NPM Version: 6.14.11
* Entorno Windows.

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
npm start:ol
npm start:cesium
```

## 📂 Estructura del código / *Code scaffolding*

```any
/
├── src 📦                  # Código fuente
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