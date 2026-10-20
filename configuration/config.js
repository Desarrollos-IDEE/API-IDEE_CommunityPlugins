const IDEE_STATIC_RESOURCES = 'https://componentes.idee.es/estaticos';
const GOOGLE_ANALYTICS_ID = 'G-19NTRSBP21';

/**
 * El atributo versions contiene version de API-IDEE y version de panel (1 → test-v1/legacy, 2 → test-v2/dist)
 */
const IDEE_ENVIRONMENTS = [
  {
    id: 'produccion-cnig',
    label: 'Produccion CNIG',
    url: 'https://componentes.idee.es/api-idee',
    versions: {
      '1.0.0': 1,
      '1.1.0': 1,
      'latest': 1,
    },
  },
  {
    id: 'beta-cnig',
    label: 'Beta CNIG',
    url: 'https://componentes-beta.idee.es/api-idee',
    versions: {
      '1.0.0': 1,
      'latest': 2,
    },
  },
  {
    id: 'desarrollo-cnig',
    label: 'Desarrollo CNIG',
    url: 'https://componentes-desarrollo.idee.es/api-idee',
    versions: {
      '1.0.0': 1,
      '1.1.0': 1,
      'latest': 1,
    },
  },
];

// ################### FUNCIONES NO CONFIGURABLES ###################
const IDEE_ENV_PARAM = 'entorno';
const IDEE_VERSION_PARAM = 'version';
const IDEE_PLUGIN_PARAM = 'plugin';

function getUrlParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function getIdeePluginName() {
  const fromUrl = getUrlParam(IDEE_PLUGIN_PARAM);
  if (fromUrl) {
    return String(fromUrl).trim();
  }
  return '';
}

function getEnvironmentVersions(environment) {
  return Object.keys(environment.versions);
}

function resolveSelectedEnvironment(environments) {
  const selectedId = getUrlParam(IDEE_ENV_PARAM);
  return environments.find(function (env) {
    return env.id === selectedId;
  }) || environments[0];
}

function resolveIdeeVersion(environment) {
  const selectedVersion = getUrlParam(IDEE_VERSION_PARAM);
  const versions = getEnvironmentVersions(environment);
  if (versions.indexOf(selectedVersion) !== -1) {
    return selectedVersion;
  }
  return versions[0];
}

function resolveIdeeVersionSuffix(version) {
  if (version === 'latest') {
    return '';
  }
  return '-' + version;
}

function isTestV1(version, environment) {
  var env = environment || IDEE_SELECTED_ENVIRONMENT;
  var panel = env.versions[version];
  return panel !== 2;
}

function getEnvironmentById(id) {
  return IDEE_ENVIRONMENTS.find(function (env) {
    return env.id === id;
  }) || IDEE_ENVIRONMENTS[0];
}

function fillSelectorOptions(selector, values, selectedValue, labels) {
  selector.innerHTML = '';
  values.forEach(function (value, index) {
    var option = document.createElement('option');
    option.value = value;
    if (labels && labels[index]) {
      option.textContent = labels[index];
    } else {
      option.textContent = value;
    }
    if (value === selectedValue) {
      option.selected = true;
    }
    selector.appendChild(option);
  });
}

function updateIdeeUrlParams(entornoId, version) {
  var url = new URL(window.location.href);
  url.searchParams.set(IDEE_ENV_PARAM, entornoId);
  url.searchParams.set(IDEE_VERSION_PARAM, version);
  window.history.replaceState({}, '', url.toString());
}

function applyIdeeSelection(entornoId, version) {
  IDEE_SELECTED_ENVIRONMENT = getEnvironmentById(entornoId);
  IDEE_DOMAIN = IDEE_SELECTED_ENVIRONMENT.url;
  IDEE_VERSION = version;
  IDEE_VERSION_SUFFIX = resolveIdeeVersionSuffix(version);
  updateIdeeUrlParams(entornoId, version);
  loadIdeeTestFrame();
}

function buildIdeeTestFrameUrl() {
  var testFile = 'test-v2.html';
  if (isTestV1(IDEE_VERSION)) {
    testFile = 'test-v1.html';
  }

  var plugin = getIdeePluginName();
  if (plugin) {
    testFile = plugin + '/' + testFile;
  }

  var testUrl = new URL(testFile, window.location.href);
  var urlParams = new URLSearchParams(window.location.search);
  urlParams.forEach(function (value, key) {
    testUrl.searchParams.set(key, value);
  });
  return testUrl.toString();
}

function loadIdeeTestFrame() {
  var testFrame = document.getElementById('test-frame');
  if (!testFrame) {
    return;
  }
  testFrame.src = buildIdeeTestFrameUrl();
}

function initIdeeSelectors() {
  var envSelector = document.getElementById('env-selector');
  var versionSelector = document.getElementById('version-selector');

  if (!envSelector || !versionSelector) {
    loadIdeeTestFrame();
    return;
  }

  var selectedEnv = getUrlParam(IDEE_ENV_PARAM) || IDEE_ENVIRONMENTS[0].id;
  var environmentIds = IDEE_ENVIRONMENTS.map(function (env) {
    return env.id;
  });
  var environmentLabels = IDEE_ENVIRONMENTS.map(function (env) {
    return env.label || env.id;
  });

  fillSelectorOptions(envSelector, environmentIds, selectedEnv, environmentLabels);
  fillSelectorOptions(
    versionSelector,
    getEnvironmentVersions(IDEE_SELECTED_ENVIRONMENT),
    IDEE_VERSION,
  );

  envSelector.addEventListener('change', function () {
    var environment = getEnvironmentById(envSelector.value);
    var firstVersion = getEnvironmentVersions(environment)[0];
    fillSelectorOptions(versionSelector, getEnvironmentVersions(environment), firstVersion);
    applyIdeeSelection(envSelector.value, firstVersion);
  });

  versionSelector.addEventListener('change', function () {
    applyIdeeSelection(envSelector.value, versionSelector.value);
  });

  document.body.addEventListener('click', function (event) {
    var link = event.target.closest('a[href*="test.html"]');
    if (!link) {
      return;
    }
    var url = new URL(link.href, window.location.href);
    url.searchParams.set(IDEE_ENV_PARAM, envSelector.value);
    url.searchParams.set(IDEE_VERSION_PARAM, versionSelector.value);
    link.href = url.toString();
  }, true);

  loadIdeeTestFrame();
}

const IDEE_DATA_BASE = (function () {
  if (document.currentScript && document.currentScript.src) {
    return document.currentScript.src.replace(/\/configuration\/[^/]+$/, '/data/');
  }
  return '../../data/';
})();

function injectCollapseScript() {
  if (typeof document === 'undefined' || document.getElementById('gallery-test-collapse-js')) {
    return;
  }
  var src = IDEE_DATA_BASE + 'resources-collapsed-test/gallery-test-collapse.js';
  var script = document.createElement('script');
  script.id = 'gallery-test-collapse-js';
  script.src = src;
  script.setAttribute('data-css-href', src.replace(/\.js(\?.*)?$/, '.css$1'));
  document.head.appendChild(script);
}

let IDEE_SELECTED_ENVIRONMENT = resolveSelectedEnvironment(IDEE_ENVIRONMENTS);
let IDEE_DOMAIN = IDEE_SELECTED_ENVIRONMENT.url;
let IDEE_VERSION = resolveIdeeVersion(IDEE_SELECTED_ENVIRONMENT);
let IDEE_VERSION_SUFFIX = resolveIdeeVersionSuffix(IDEE_VERSION);

injectCollapseScript();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initIdeeSelectors);
} else {
  initIdeeSelectors();
}
