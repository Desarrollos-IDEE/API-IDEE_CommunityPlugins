import Archetype from 'facade/archetype';

IDEE.language.addTranslation('ca', {
  "scale": {
      "title": "Escala",
      "scale": "Escala",
      "level": "Nivell"
  },
  "archetype": {
    exception: {
      impl: "La implementació no pot crear controls d'Archetype."
    },
    text: "Contingut del plugin d'exemple.",
    textHelp: {
      help1: "Text d'exemple 1.",
      help2: "Text d'exemple 2",
      help3: "Text d'exemple 3"
    },
    title: "Plantilla plugin",
    tooltip: "Plantilla plugin"
  }
});

IDEE.language.setLang('es');

const mapa = IDEE.map({
  container: 'mapjs',
  controls: ['scale*true'],
});

// IDEE.language.setLang('es');
// IDEE.language.setLang('en');

// const map = IDEE.map({
//   container: 'mapjs',
// });
// window.map = map;

const mp = new Archetype({
  position: 'TL', // TR, BR, TL, BL
  collapsed: true,
  collapsible: true,
  tooltip: 'Plantilla',
  isDraggable: true,
});
window.mp = mp;

mapa.addPlugin(mp);

mapa.addPlugin(new IDEE.plugin.Help({}));


// console.log(IDEE.language.getTranslation('es').archetype);

const es = Archetype.getJSONTranslations('es');
// const en = Archetype.getJSONTranslations('en');

// IDEE.language.getTranslation('es').archetype = es;
// IDEE.language.getTranslation('en').archetype = en;

// console.log(IDEE.language.getTranslation('es').archetype);
// console.log(IDEE.language.getTranslation('en').archetype);

// console.log(IDEE.language.getValue('archetype', 'es'));
// console.log(IDEE.language.getValue('archetype', 'en'));
