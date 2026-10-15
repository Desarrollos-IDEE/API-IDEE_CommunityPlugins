/**
 * Entornos y versiones de API-IDEE para la galería.
 * Fuente de verdad: data/versionesApiIdee.json
 *
 * Cada entrada del JSON:
 * - id, label (UI)
 * - url: QRL base de API-IDEE
 * - versions: select de API-IDEE ("latest" → apiidee.ol.min.* sin sufijo)
 * - versionPanels: mapa versión API → panel 1 (legacy/test-v1) | 2 (dist/test-v2)
 *
 * Persistencia: solo ?env= / ?apiVersion= (sin localStorage).
 * Sin params al recargar → 1º entorno del JSON + última versión de ese entorno.
 * Plugins SIEMPRE desde plugins/ (nunca mapeaPlugins).
 */
const GALLERY_ENV_PARAM = 'env';
const GALLERY_API_VERSION_PARAM = 'apiVersion';

/** Compatibilidad con el parámetro antiguo pluginLine=v1|v2 */
const GALLERY_PLUGIN_LINE_PARAM = 'pluginLine';
const GALLERY_PLUGIN_LINE_V1 = 'v1';
const GALLERY_PLUGIN_LINE_V2 = 'v2';

const GALLERY_V1_DEFAULT_LEGACY_VERSION = '1.0.0';
const GALLERY_V1_LEGACY_VERSION_OVERRIDES = {
  catalogsearch: '2.0.0',
  managelayers: '2.0.0',
};

const GALLERY_PANEL_VERSION_LEGACY = 1;
const GALLERY_PANEL_VERSION_DIST = 2;

/**
 * Base URL del directorio data/ (hermano de configuration/, donde vive este script).
 * configuration/gallery-plugin-line.js → data/
 */
const GALLERY_DATA_BASE = (function resolveGalleryDataBase() {
  if (document.currentScript && document.currentScript.src) {
    return document.currentScript.src.replace(/\/configuration\/[^/]+$/, '/data/');
  }
  return '../../data/';
})();

const GALLERY_VERSIONES_JSON_URL =
  GALLERY_DATA_BASE + 'versionesApiIdee.json';

/** @type {Array<{id:string,label:string,url:string,versionPanels:Object,versions:string[]}>} */
let GALLERY_ENVIRONMENTS_LIST = [];

/** Mapa id → entorno (se rellena al cargar el JSON). */
let GALLERY_ENVIRONMENTS = {};

/** @type {string[]} */
let GALLERY_ENV_IDS = [];

let galleryApiConfigReady = false;
let galleryApiConfigPromise = null;

function normalizeGalleryUrl(url) {
  if (!url) {
    return '';
  }
  return String(url).replace(/\/+$/, '');
}

function normalizePanelVersion(value) {
  const parsed = Number(value);
  if (parsed === GALLERY_PANEL_VERSION_DIST) {
    return GALLERY_PANEL_VERSION_DIST;
  }
  return GALLERY_PANEL_VERSION_LEGACY;
}

function normalizeVersionsList(versions) {
	if (!Array.isArray(versions)) {
		return [];
	}
	const result = [];
	versions.forEach(function (item) {
		if (item === undefined || item === null) {
			return;
		}
		const text = String(item).trim();
		if (!text) {
			return;
		}
		if (result.indexOf(text) === -1) {
			result.push(text);
		}
	});
	return result;
}

function normalizeVersionPanels(rawPanels, versions) {
	const map = {};
	if (rawPanels && typeof rawPanels === 'object' && !Array.isArray(rawPanels)) {
		Object.keys(rawPanels).forEach(function (key) {
			const versionKey = String(key).trim();
			if (!versionKey) {
				return;
			}
			map[versionKey] = normalizePanelVersion(rawPanels[key]);
		});
	}
	versions.forEach(function (version) {
		if (map[version] === undefined) {
			console.error(
				'versionesApiIdee.json: falta versionPanels para la versión',
				version,
			);
			map[version] = GALLERY_PANEL_VERSION_LEGACY;
		}
	});
	return map;
}

function buildEnvironmentFromJsonEntry(entry, index) {
	const url = normalizeGalleryUrl(entry.url || entry.qrl || '');
	let id = entry.id;
	if (!id) {
		id = 'env-' + index;
	}
	let label = entry.label;
	if (!label) {
		label = id;
	}
	const versions = normalizeVersionsList(entry.versions);
	const versionPanels = normalizeVersionPanels(entry.versionPanels, versions);
	return {
		id: String(id),
		label: String(label),
		url: url,
		apiDomain: url,
		versionPanels: versionPanels,
		versions: versions,
		hint: label,
	};
}

function applyEnvironmentsList(list) {
  GALLERY_ENVIRONMENTS_LIST = list.slice();
  GALLERY_ENVIRONMENTS = {};
  GALLERY_ENV_IDS = [];
  list.forEach(function (env) {
    GALLERY_ENVIRONMENTS[env.id] = env;
    GALLERY_ENV_IDS.push(env.id);
  });
}

/** Primer entorno del JSON; cadena vacía si aún no hay lista. */
function getDefaultGalleryEnvironmentId() {
  if (GALLERY_ENV_IDS.length > 0) {
    return GALLERY_ENV_IDS[0];
  }
  return '';
}

function parseEnvironmentsPayload(payload) {
  let rawList = payload;
  if (payload && Array.isArray(payload.environments)) {
    rawList = payload.environments;
  }
  if (!Array.isArray(rawList)) {
    console.error('versionesApiIdee.json debe ser un array de entornos');
    return [];
  }
  const list = [];
  rawList.forEach(function (entry, index) {
    if (!entry) {
      return;
    }
    const env = buildEnvironmentFromJsonEntry(entry, index);
    if (!env.url) {
      console.error('Entorno sin url/qrl en versionesApiIdee.json', entry);
      return;
    }
    list.push(env);
  });
  return list;
}

function loadVersionesApiIdeeSync() {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', GALLERY_VERSIONES_JSON_URL, false);
    xhr.send(null);
    if (xhr.status >= 200 && xhr.status < 300) {
      return parseEnvironmentsPayload(JSON.parse(xhr.responseText));
    }
    console.error('No se pudo cargar versionesApiIdee.json', xhr.status);
  } catch (err) {
    console.error(err);
  }
  return [];
}

function ensureGalleryApiConfigLoaded() {
  if (galleryApiConfigReady) {
    return Promise.resolve(GALLERY_ENVIRONMENTS_LIST);
  }
  if (galleryApiConfigPromise) {
    return galleryApiConfigPromise;
  }
  galleryApiConfigPromise = fetch(GALLERY_VERSIONES_JSON_URL)
    .then(function (res) {
      if (!res.ok) {
        throw new Error('HTTP ' + res.status);
      }
      return res.json();
    })
    .then(function (payload) {
      applyEnvironmentsList(parseEnvironmentsPayload(payload));
      galleryApiConfigReady = true;
      return GALLERY_ENVIRONMENTS_LIST;
    })
    .catch(function (err) {
      console.error(err);
      const fallback = loadVersionesApiIdeeSync();
      applyEnvironmentsList(fallback);
      galleryApiConfigReady = true;
      return GALLERY_ENVIRONMENTS_LIST;
    });
  return galleryApiConfigPromise;
}

/** Carga síncrona para bootstrap de test-v1/test-v2 (antes de document.write). */
function initGalleryApiConfigSync() {
  if (galleryApiConfigReady && GALLERY_ENV_IDS.length > 0) {
    return GALLERY_ENVIRONMENTS_LIST;
  }
  applyEnvironmentsList(loadVersionesApiIdeeSync());
  galleryApiConfigReady = true;
  return GALLERY_ENVIRONMENTS_LIST;
}

initGalleryApiConfigSync();

function isValidGalleryEnvironment(value) {
  return GALLERY_ENV_IDS.indexOf(value) !== -1;
}

function environmentHasPanelVersion(env, panelVersion) {
	const panels = env.versionPanels || {};
	const keys = Object.keys(panels);
	for (let i = 0; i < keys.length; i += 1) {
		if (panels[keys[i]] === panelVersion) {
			return true;
		}
	}
	return false;
}

function findEnvironmentByPanelVersion(panelVersion) {
  for (let i = 0; i < GALLERY_ENVIRONMENTS_LIST.length; i += 1) {
    const env = GALLERY_ENVIRONMENTS_LIST[i];
    if (environmentHasPanelVersion(env, panelVersion)) {
      return env;
    }
  }
  return null;
}

function mapLegacyPluginLineToEnv(pluginLine) {
  if (pluginLine === GALLERY_PLUGIN_LINE_V1) {
    const legacyEnv = findEnvironmentByPanelVersion(
      GALLERY_PANEL_VERSION_LEGACY,
    );
    if (legacyEnv) {
      return legacyEnv.id;
    }
    return getDefaultGalleryEnvironmentId();
  }
  if (pluginLine === GALLERY_PLUGIN_LINE_V2) {
    const distEnv = findEnvironmentByPanelVersion(GALLERY_PANEL_VERSION_DIST);
    if (distEnv) {
      return distEnv.id;
    }
    return getDefaultGalleryEnvironmentId();
  }
  return null;
}

function getGalleryEnvironmentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromEnv = params.get(GALLERY_ENV_PARAM);
  if (isValidGalleryEnvironment(fromEnv)) {
    return fromEnv;
  }
  const fromLine = mapLegacyPluginLineToEnv(
    params.get(GALLERY_PLUGIN_LINE_PARAM),
  );
  if (fromLine) {
    return fromLine;
  }
  return null;
}

function getGalleryEnvironmentIdFromSelect() {
  const selectEl = document.getElementById('galleryPluginLineSelect');
  if (!selectEl) {
    return null;
  }
  if (isValidGalleryEnvironment(selectEl.value)) {
    return selectEl.value;
  }
  return null;
}

function getGalleryEnvironmentId() {
  const fromUrl = getGalleryEnvironmentIdFromUrl();
  if (fromUrl) {
    return fromUrl;
  }
  const fromSelect = getGalleryEnvironmentIdFromSelect();
  if (fromSelect) {
    return fromSelect;
  }
  return getDefaultGalleryEnvironmentId();
}

function getGalleryEnvironment(envId) {
  const id = envId || getGalleryEnvironmentId();
  if (GALLERY_ENVIRONMENTS[id]) {
    return GALLERY_ENVIRONMENTS[id];
  }
  if (GALLERY_ENVIRONMENTS_LIST.length > 0) {
    return GALLERY_ENVIRONMENTS_LIST[0];
  }
	return {
		id: 'fallback',
		label: 'Sin entornos',
		url: '',
		apiDomain: '',
		versionPanels: {},
		versions: [],
		hint: 'versionesApiIdee.json vacío o no cargado',
	};
}

function getGalleryPanelVersion(envId, apiVersion) {
	const env = getGalleryEnvironment(envId);
	let version = apiVersion;
	if (version === undefined || version === null || version === '') {
		version = getGalleryApiVersion(envId);
	}
	if (env.versionPanels && env.versionPanels[version] !== undefined) {
		return env.versionPanels[version];
	}
	return GALLERY_PANEL_VERSION_LEGACY;
}

function getGalleryPluginSource(envId, apiVersion) {
	if (getGalleryPanelVersion(envId, apiVersion) === GALLERY_PANEL_VERSION_DIST) {
		return 'dist';
	}
	return 'legacy';
}

function setGalleryEnvironment(envId) {
  if (!isValidGalleryEnvironment(envId)) {
    return;
  }
  const selectEl = document.getElementById('galleryPluginLineSelect');
  if (selectEl) {
    selectEl.value = envId;
  }
}

function getGalleryApiVersions(envId) {
  const env = getGalleryEnvironment(envId);
  return env.versions.slice();
}

function getDefaultApiVersion(envId) {
  const versions = getGalleryApiVersions(envId);
  if (versions.length === 0) {
    return '';
  }
  return versions[versions.length - 1];
}

function isValidGalleryApiVersion(envId, version) {
  if (!version) {
    return false;
  }
  return getGalleryApiVersions(envId).indexOf(version) !== -1;
}

function getRawGalleryApiVersionFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const fromUrl = params.get(GALLERY_API_VERSION_PARAM);
  if (!fromUrl) {
    return null;
  }
  return String(fromUrl).trim();
}

function getGalleryApiVersionFromUrl(envId) {
  const fromUrl = getRawGalleryApiVersionFromUrl();
  if (!fromUrl) {
    return null;
  }
  // Si el JSON aún no tiene la versión listada, respetar igual el ?apiVersion=
  if (getGalleryApiVersions(envId).length === 0) {
    return fromUrl;
  }
  if (isValidGalleryApiVersion(envId, fromUrl)) {
    return fromUrl;
  }
  return fromUrl;
}

function getGalleryApiVersionFromSelect(envId) {
  const selectEl = document.getElementById('galleryApiVersionSelect');
  if (!selectEl) {
    return null;
  }
  if (isValidGalleryApiVersion(envId, selectEl.value)) {
    return selectEl.value;
  }
  return null;
}

function getGalleryApiVersion(envId) {
  const resolvedEnvId = envId || getGalleryEnvironmentId();
  const fromUrl = getGalleryApiVersionFromUrl(resolvedEnvId);
  if (fromUrl) {
    return fromUrl;
  }
  const fromSelect = getGalleryApiVersionFromSelect(resolvedEnvId);
  if (fromSelect) {
    return fromSelect;
  }
  return getDefaultApiVersion(resolvedEnvId);
}

function setGalleryApiVersion(version, envId) {
  const resolvedEnvId = envId || getGalleryEnvironmentId();
  if (!isValidGalleryApiVersion(resolvedEnvId, version)) {
    return;
  }
  const selectEl = document.getElementById('galleryApiVersionSelect');
  if (selectEl) {
    selectEl.value = version;
  }
}

/**
 * QRL base de API-IDEE (sin versión en el path).
 * La versión va en el nombre: apiidee-1.0.1.ol.min.js
 */
function buildGalleryApiDomain(envId) {
  const resolvedEnvId = envId || getGalleryEnvironmentId();
  const env = getGalleryEnvironment(resolvedEnvId);
  return normalizeGalleryUrl(env.url);
}

function getGalleryApiDomain(envId) {
  return buildGalleryApiDomain(envId);
}

/** apiidee.ol.min | apiidee-1.0.1.ol.min ("latest" → sin sufijo/sin versión) */
function getGalleryApiIdeeFileBase(apiVersion, envId) {
  let version = apiVersion;
  if (version === undefined || version === null) {
    version = getGalleryApiVersion(envId);
  }
  if (String(version).trim() === 'latest') {
    return 'apiidee.ol.min';
  }
  return 'apiidee-' + version + '.ol.min';
}

function getGalleryApiIdeeCssUrl(envId, apiVersion) {
  return (
    getGalleryApiDomain(envId) +
    '/assets/css/' +
    getGalleryApiIdeeFileBase(apiVersion, envId) +
    '.css'
  );
}

function getGalleryApiIdeeJsUrl(envId, apiVersion) {
  return (
    getGalleryApiDomain(envId) +
    '/js/' +
    getGalleryApiIdeeFileBase(apiVersion, envId) +
    '.js'
  );
}

function getGalleryApiConfigurationJsUrl(envId, apiVersion) {
  let version = apiVersion;
  if (version === undefined || version === null) {
    version = getGalleryApiVersion(envId);
  }
  const base = getGalleryApiDomain(envId) + '/js/';
  if (String(version).trim() === 'latest') {
    return base + 'configuration.js';
  }
  return base + 'configuration-' + version + '.js';
}

/**
 * Asigna IDEE_DOMAIN / IDEE_REFACTOR_DOMAIN a la QRL base del entorno.
 * CSS/JS versionados: getGalleryApiIdeeCssUrl() / getGalleryApiIdeeJsUrl().
 */
function applyGalleryApiDomainsToWindow(envId) {
  initGalleryApiConfigSync();
  const resolvedEnvId = envId || getGalleryEnvironmentId();
  const domain = buildGalleryApiDomain(resolvedEnvId);
  IDEE_DOMAIN = domain;
  IDEE_REFACTOR_DOMAIN = domain;
  return domain;
}

function appendGalleryEnvironmentToUrl(url, envId, apiVersion) {
  const resolvedEnv = envId || getGalleryEnvironmentId();
  const resolvedVersion = apiVersion || getGalleryApiVersion(resolvedEnv);
  const target = new URL(url, window.location.href);
  target.searchParams.set(GALLERY_ENV_PARAM, resolvedEnv);
  if (resolvedVersion) {
    target.searchParams.set(GALLERY_API_VERSION_PARAM, resolvedVersion);
  } else {
    target.searchParams.delete(GALLERY_API_VERSION_PARAM);
  }
  target.searchParams.delete(GALLERY_PLUGIN_LINE_PARAM);
  return target.pathname + target.search + target.hash;
}

function getGalleryV1LegacyVersion(galleryPluginName) {
  if (GALLERY_V1_LEGACY_VERSION_OVERRIDES[galleryPluginName]) {
    return GALLERY_V1_LEGACY_VERSION_OVERRIDES[galleryPluginName];
  }
  return GALLERY_V1_DEFAULT_LEGACY_VERSION;
}

function usesLegacyPluginSource(envId, apiVersion) {
	return getGalleryPluginSource(envId, apiVersion) === 'legacy';
}

function getGalleryPluginTestTarget(envId, apiVersion) {
	if (usesLegacyPluginSource(envId, apiVersion)) {
		return 'test-v1.html';
	}
	return 'test-v2.html';
}

/**
 * Rutas relativas al HTML de gallery/{plugin}/ para CSS/JS del plugin (solo OL).
 */
function getGalleryPluginAssetPaths(galleryPluginName, envId, apiVersion) {
	const source = getGalleryPluginSource(envId, apiVersion);

	if (source === 'legacy') {
    const version = getGalleryV1LegacyVersion(galleryPluginName);
    const base =
      '../../plugins/' +
      galleryPluginName +
      '/legacy/' +
      galleryPluginName +
      '-' +
      version +
      '.ol.min';
    return {
      css: base + '.css',
      js: base + '.js',
      version: version,
      source: 'legacy',
    };
  }

  const distBase =
    '../../plugins/' +
    galleryPluginName +
    '/dist/' +
    galleryPluginName +
    '.ol.min';
  return {
    css: distBase + '.css',
    js: distBase + '.js',
    source: 'dist',
  };
}

function getGalleryHelpPluginBase(envId) {
  return getGalleryApiDomain(envId) + '/plugins/help/help.ol.min';
}

function fillGalleryEnvironmentSelect(selectEl) {
  if (!selectEl) {
    return;
  }
  selectEl.innerHTML = '';
  GALLERY_ENVIRONMENTS_LIST.forEach(function (env) {
    const option = document.createElement('option');
    option.value = env.id;
    option.textContent = env.label;
    selectEl.appendChild(option);
  });
}

function fillGalleryApiVersionSelect(selectEl, envId) {
  if (!selectEl) {
    return;
  }
  const versions = getGalleryApiVersions(envId);
  selectEl.innerHTML = '';
  versions.forEach(function (version) {
    const option = document.createElement('option');
    option.value = version;
    option.textContent = version;
    selectEl.appendChild(option);
  });
  selectEl.disabled = versions.length === 0;
  const defaultVersion = getDefaultApiVersion(envId);
  if (defaultVersion) {
    selectEl.value = defaultVersion;
  }
}

function getGalleryEnvironmentHint(envId, apiVersion) {
	const env = getGalleryEnvironment(envId);
	let versionText = apiVersion;
	if (!versionText) {
		versionText = getGalleryApiVersion(envId);
	}
	if (!versionText) {
		versionText = '(sin versión)';
	}
	const panelVersion = getGalleryPanelVersion(envId, apiVersion);
	const pluginSource = getGalleryPluginSource(envId, apiVersion);
	return (
		env.hint +
		' · paneles v' +
		panelVersion +
		' · ' +
		pluginSource +
		' · API ' +
		versionText +
		' → ' +
		getGalleryApiIdeeJsUrl(envId, apiVersion)
	);
}

/** Compatibilidad con código previo basado en pluginLine v1|v2 */
function getGalleryPluginLine() {
	if (usesLegacyPluginSource(getGalleryEnvironmentId(), getGalleryApiVersion())) {
		return GALLERY_PLUGIN_LINE_V1;
	}
	return GALLERY_PLUGIN_LINE_V2;
}

function setGalleryPluginLine(line) {
  const mapped = mapLegacyPluginLineToEnv(line);
  if (mapped) {
    setGalleryEnvironment(mapped);
  }
}

function appendGalleryPluginLineToUrl(url, line) {
  const mapped = mapLegacyPluginLineToEnv(line) || getGalleryEnvironmentId();
  return appendGalleryEnvironmentToUrl(url, mapped);
}

/**
 * Carga el colapso de paneles de test (barra Entorno/API y formulario de parámetros).
 * Se incluye aquí porque gallery-plugin-line.js ya está en test.html, test-v1 y test-v2.
 */
(function loadGalleryTestCollapse() {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.getElementById('gallery-test-collapse-js')) {
    return;
  }
  let src = '../../configuration/gallery-test-collapse.js';
  if (document.currentScript && document.currentScript.src) {
    src = document.currentScript.src.replace(
      /gallery-plugin-line\.js(\?.*)?$/,
      'gallery-test-collapse.js$1',
    );
  }
  const script = document.createElement('script');
  script.id = 'gallery-test-collapse-js';
  script.src = src;
  script.setAttribute(
    'data-css-href',
    src.replace(/gallery-test-collapse\.js(\?.*)?$/, 'gallery-test-collapse.css$1'),
  );
  document.head.appendChild(script);
})();

