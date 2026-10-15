![](https://componentes.idee.es/estaticos/imagenes/logos/API_IDEE/API_2/API_2.svg)

# **API IDEE** 🔌 IDEE.plugin.Archetype

# Descripción

Plugin básico (plantilla) para crear otros plugins.

# Dependencias

Para que el plugin funcione correctamente es necesario importar las siguientes dependencias en el documento html:
Para uso de implementación OpenLayers:

- **archetype.ol.min.js**
- **archetype.ol.min.css**

Para uso de implementación Cesium:

- **archetype.cesium.min.js**
- **archetype.cesium.min.css**

# Uso del histórico de versiones

Existe un histórico de versiones de todos los plugins en el directorio `legacy/` de cada plugin.
Es recomendable fijar las versiones para evitar errores inesperados.

Ejemplo con el plugin Archetype, implementación OpenLayers y versión 2.0.0:

- archetype-2.0.0.ol.min.css
- archetype-2.0.0.ol.min.js

# Parámetros

| Parámetro   | Tipo             | Por defecto        | Descripción                                                |
| ----------- | ---------------- | ------------------ | ---------------------------------------------------------- |
| `position`  | `left` | `right` | `right`            | Barra de herramientas donde se muestra el botón del plugin |
| `collapsed` | `boolean`        | `true`             | Indica si el panel aparece colapsado al inicio             |
| `order`     | `number`         | —                  | Orden del botón/panel entre controles y plugins            |
| `tooltip`   | `string`         | `Plantilla plugin` | Texto al pasar el ratón sobre el botón                     |

# API-REST

```javascript
URL_API?archetype=position*collapsed*order*tooltip
```

### Ejemplos de uso API-REST

```
https://componentes.idee.es/api-idee?archetype=position*collapsed*order*tooltip
```

```
https://componentes.idee.es/api-idee?archetype=right*true*0*Plantilla
```

### Ejemplo de uso API-REST en base64

Para la codificación en base64 del objeto con los parámetros del plugin podemos hacer uso de la utilidad IDEE.utils.encodeBase64.
Ejemplo:

```javascript
IDEE.utils.encodeBase64({
  position: 'right',
  collapsed: true,
  order: 0,
  tooltip: 'Plantilla plugin',
});
```

```
https://componentes.idee.es/api-idee?archetype=base64=eyJwb3NpdGlvbiI6InJpZ2h0IiwiY29sbGFwc2VkIjp0cnVlLCJvcmRlciI6MCwidG9vbHRpcCI6IlBsYW50aWxsYSBwbHVnaW4ifQ==
```

# Ejemplo de uso

```javascript
const mp = new IDEE.plugin.Archetype({
  position: 'right',
  collapsed: true,
  order: 0,
  tooltip: 'Plantilla plugin',
});

map.addPlugin(mp);
```

# 👨‍💻 Desarrollo

Para el stack de desarrollo de este componente se ha utilizado

- NodeJS Versión: 16 o superior
- NPM Versión: 8.19.4 o superior

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

- ESLint
  - [NPM ESLint](https://www.npmjs.com/package/eslint) \
  - [NPM ESLint | Airbnb](https://www.npmjs.com/package/eslint-config-airbnb)

## ⛽️ Revisión e instalación de dependencias / *Review and Update Dependencies*

Para la revisión y actualización de las dependencias de los paquetes npm es necesario instalar de manera global el paquete/ módulo "npm-check-updates".

```bash
# Install and Run
$npm i -g npm-check-updates
$ncu
```

## Tabla de compatibilidad de versiones

[Consulta el api resourcePlugin](https://componentes.idee.es/api-idee/api/actions/resourcesPlugins?name=archetype)
