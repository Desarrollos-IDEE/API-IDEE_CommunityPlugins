import Archetype from 'facade/archetype';

IDEE.language.setLang(window.localStorage.getItem('language') || 'es');

const map = IDEE.map({
  container: 'mapjs',
  controls: ['scale'],
});
window.map = map;

let mp;

const createPlugin = (options) => {
  mp = new Archetype(options);
  window.mp = mp;
  map.addPlugin(mp);
};

const removePlugin = () => {
  if (mp) {
    try {
      map.removePlugins(mp);
    } catch (err) {
      console.error(err);
    }
    mp = null;
  }
};

const botonEliminar = document.getElementById('botonEliminar');
if (botonEliminar) {
  botonEliminar.addEventListener('click', () => { removePlugin(); });
}

const selectPosicion = document.getElementById('selectPosicion');
const selectCollapsed = document.getElementById('selectCollapsed');
const inputOrder = document.getElementById('inputOrder');
const inputTooltip = document.getElementById('inputTooltip');

const updatePlugin = () => {
  const options = {
    position: selectPosicion
      ? selectPosicion.options[selectPosicion.selectedIndex].value
      : 'right',
    collapsed: selectCollapsed
      ? selectCollapsed.options[selectCollapsed.selectedIndex].value === 'true'
      : true,
    order: inputOrder ? Number(inputOrder.value) : 0,
    tooltip: inputTooltip ? inputTooltip.value : 'Plantilla plugin',
  };

  removePlugin();
  createPlugin(options);
};

[
  selectPosicion,
  selectCollapsed,
  inputOrder,
  inputTooltip,
].filter(Boolean).forEach((ctrl) => {
  ctrl.addEventListener('change', updatePlugin);
});

updatePlugin();

try {
  map.addPlugin(new IDEE.plugin.Help({}));
} catch (err) {
  console.error(err);
}
