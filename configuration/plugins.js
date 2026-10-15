const search = document.getElementById('search');
const gallerySections = document.getElementById('gallery-sections');
const galleryEmpty = document.getElementById('gallery-empty');
const matchObsolete = document.getElementById('match-list-obsolete');

const SECTIONS = [
  { id: 'migrated', tag: 'migrated', cardClass: 'plugin-card-migrated', badgeClass: '' },
  { id: 'pending', tag: 'pending', cardClass: 'plugin-card-pending', badgeClass: 'badge-pending' },
];

const sectionLists = {};
const sectionCounts = {};
const sectionWrappers = {};

SECTIONS.forEach((section) => {
  sectionLists[section.id] = document.getElementById('match-list-' + section.id);
  sectionCounts[section.id] = document.getElementById('count-' + section.id);
  sectionWrappers[section.id] = document.querySelector('[data-section="' + section.id + '"]');
});

let allPlugins = [];

const galleryPluginLineSelect = document.getElementById('galleryPluginLineSelect');
const galleryApiVersionSelect = document.getElementById('galleryApiVersionSelect');
const galleryPluginLineDescription = document.getElementById('galleryPluginLineDescription');

function updateGalleryPluginLineDescription(envId, apiVersion) {
  if (!galleryPluginLineDescription) {
    return;
  }
  galleryPluginLineDescription.textContent = getGalleryEnvironmentHint(envId, apiVersion);
}

function syncGalleryApiVersionSelect(envId) {
  fillGalleryApiVersionSelect(galleryApiVersionSelect, envId);
  if (!galleryApiVersionSelect) {
    return getGalleryApiVersion(envId);
  }
  const selectedVersion = getGalleryApiVersion(envId);
  if (selectedVersion) {
    galleryApiVersionSelect.value = selectedVersion;
  }
  return galleryApiVersionSelect.value || selectedVersion;
}

function initGalleryPluginLineSelector() {
  if (!galleryPluginLineSelect) {
    return;
  }
  fillGalleryEnvironmentSelect(galleryPluginLineSelect);
  const envId = getGalleryEnvironmentId();
  galleryPluginLineSelect.value = envId;
  const apiVersion = syncGalleryApiVersionSelect(envId);
  updateGalleryPluginLineDescription(envId, apiVersion);

  galleryPluginLineSelect.addEventListener('change', () => {
    const nextEnv = galleryPluginLineSelect.value;
    setGalleryEnvironment(nextEnv);
    const nextVersion = syncGalleryApiVersionSelect(nextEnv);
    setGalleryApiVersion(nextVersion, nextEnv);
    updateGalleryPluginLineDescription(nextEnv, nextVersion);
    renderLists(allPlugins, search.value);
  });

  if (galleryApiVersionSelect) {
    galleryApiVersionSelect.addEventListener('change', () => {
      const currentEnv = galleryPluginLineSelect.value;
      const nextVersion = galleryApiVersionSelect.value;
      setGalleryApiVersion(nextVersion, currentEnv);
      updateGalleryPluginLineDescription(currentEnv, nextVersion);
      renderLists(allPlugins, search.value);
    });
  }
}

function withGalleryPluginLine(url) {
  return appendGalleryEnvironmentToUrl(
    url,
    getGalleryEnvironmentId(),
    getGalleryApiVersion(),
  );
}

function hasTag(plugin, tag) {
  return (plugin.tags || []).some((item) => item === tag);
}

function matchesQuery(plugin, query) {
  if (!query) {
    return true;
  }
  const regex = new RegExp(removeDiacritics(query), 'gi');
  const haystack = [
    plugin.name,
    plugin.description,
    ...(plugin.tags || []),
  ].join(' ');
  return regex.test(removeDiacritics(haystack));
}

function buildPluginCard(plugin, section) {
  let badgeLabel = '';
  if (section.tag === 'migrated') {
    badgeLabel = 'migrado';
  } else if (section.tag === 'pending') {
    badgeLabel = 'pendiente';
  } else if (section.tag === 'obsolete') {
    badgeLabel = 'obsoleto';
  }

  return `
    <div class="col" style="padding-bottom:15px;">
      <div class="card shadow-sm h-100 ${section.cardClass}">
        <h4 class="text-primary text-center pt-2">${plugin.plugin}</h4>
        <div class="card-body">
          <span class="badge plugin-tag-badge ${section.badgeClass}">${badgeLabel}</span>
          <h5 class="card-title">${plugin.name}</h5>
          <p class="card-text" style="min-height:100px;">${plugin.description}</p>
          <div class="d-flex justify-content-between align-items-center">
            <div class="btn-group">
              <a href="${withGalleryPluginLine(plugin.url_es)}" class="btn btn-sm btn-outline-secondary" role="button" target="_blank" data-bs-toggle="button"><img style="width:24px;" src="${IDEE_STATIC_RESOURCES}/imagenes/logos/spain-flag.svg"></a>
              <a href="${withGalleryPluginLine(plugin.url_en)}" class="btn btn-sm btn-outline-secondary" role="button" target="_blank" data-bs-toggle="button"><img style="width:24px;" src="${IDEE_STATIC_RESOURCES}/imagenes/logos/uk-flag.svg"></a>
              <a href="${plugin.url_git}" class="btn btn-sm btn-outline-secondary" role="button" target="_blank" data-bs-toggle="button"><img style="width:24px;" src="${IDEE_STATIC_RESOURCES}/imagenes/logos/logo-github.svg"></a>
            </div>
            <small class="text-muted">${plugin.version}</small>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderEmpty(container, message) {
  container.innerHTML = '<div class="col-12 empty-gallery">' + message + '</div>';
}

function renderSection(section, plugins, query) {
  const container = sectionLists[section.id];
  const filtered = plugins.filter((plugin) => {
    return hasTag(plugin, section.tag) && matchesQuery(plugin, query);
  });

  sectionCounts[section.id].textContent = String(filtered.length);

  if (filtered.length === 0) {
    let emptyMessage = 'No hay plugins en esta sección.';
    if (query) {
      emptyMessage = 'No hay plugins que coincidan con la búsqueda en esta sección.';
    }
    renderEmpty(container, emptyMessage);
  } else {
    container.innerHTML = filtered.map((plugin) => buildPluginCard(plugin, section)).join('');
  }
}

function renderObsoletePlugins(plugins, query) {
  const obsoletePlugins = plugins.filter((plugin) => {
    return plugin.obsolete && matchesQuery(plugin, query);
  });

  if (obsoletePlugins.length === 0) {
    matchObsolete.innerHTML = '<div class="col-12 text-center text-muted py-5"><p>No existen actualmente plugins obsoletos.</p></div>';
    return;
  }

  matchObsolete.innerHTML = obsoletePlugins.map((plugin) => {
    return buildPluginCard(plugin, {
      tag: 'obsolete',
      cardClass: 'plugin-card-obsolete',
      badgeClass: 'badge-obsolete',
    });
  }).join('');
}

function renderLists(plugins, query) {
  const activePlugins = plugins.filter((plugin) => !plugin.obsolete);
  let totalMatches = 0;

  SECTIONS.forEach((section) => {
    const visiblePlugins = activePlugins.filter((plugin) => {
      return hasTag(plugin, section.tag) && matchesQuery(plugin, query);
    });
    totalMatches += visiblePlugins.length;
    renderSection(section, activePlugins, query);

    if (visiblePlugins.length === 0) {
      sectionWrappers[section.id].style.display = 'none';
    } else {
      sectionWrappers[section.id].style.display = '';
    }
  });

  renderObsoletePlugins(plugins, query);

  if (totalMatches === 0) {
    gallerySections.classList.add('d-none');
    galleryEmpty.classList.remove('d-none');
    if (query) {
      galleryEmpty.textContent = 'No hay plugins que coincidan con la búsqueda.';
    } else {
      galleryEmpty.textContent = 'No hay plugins activos.';
    }
  } else {
    gallerySections.classList.remove('d-none');
    galleryEmpty.classList.add('d-none');
  }
}

async function loadPlugins() {
  await ensureGalleryApiConfigLoaded();
  initGalleryPluginLineSelector();
  const res = await fetch('../data/plugins.json');
  allPlugins = await res.json();
  renderLists(allPlugins, search.value);
}

search.addEventListener('input', () => {
  renderLists(allPlugins, search.value);
});

loadPlugins();
