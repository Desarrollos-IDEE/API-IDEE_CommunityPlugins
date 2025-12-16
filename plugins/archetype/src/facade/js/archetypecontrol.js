/**
 * @module IDEE/control/ArchetypeControl
 */

import ArchetypeImplControl from 'impl/archetypecontrol';
import template from 'templates/archetype';
import { getValue } from './i18n/language';

export default class ArchetypeControl extends IDEE.Control {
  /**
   * @classdesc
   * Constructor de la clase. Crea un control ArchetypeControl
   *
   * @constructor
   * @extends {IDEE.Control}
   * @api stable
   */
  constructor(isDraggable) {
    // 1. Comprueba si la implementación puede crear el control
    if (IDEE.utils.isUndefined(ArchetypeImplControl)
      || (IDEE.utils.isObject(ArchetypeImplControl)
      && IDEE.utils.isNullOrEmpty(Object.keys(ArchetypeImplControl)))) {
      IDEE.exception(getValue('exception.impl'));
    }
    // 2. Crea la implementación del control
    const impl = new ArchetypeImplControl();
    super(impl, 'Archetype');

    /**
     * Indicador de si el plugin puede arrastrarse o no
     * @public
     * @type {boolean}
     */
    this.isDraggable_ = isDraggable || false;
  }

  /**
   * Esta función crea la vista
   *
   * @public
   * @function
   * @param {IDEE.Map} map Mapa al que se añade el control
   * @api stable
   */
  createView(map) {
    return new Promise((success, fail) => {
      const html = IDEE.template.compileSync(template, {
        vars: {
          translations: {
            title: getValue('title'),
            text: getValue('text'),
          },
        },
      });

      if (this.isDraggable_) {
        IDEE.utils.draggabillyPlugin(this.getPanel(), '#m-archetype-title');
      }
      success(html);
    });
  }

  /**
   * Esta función compara controles
   *
   * @public
   * @function
   * @param {IDEE.Control} control control para comparar
   * @api stable
   */
  equals(control) {
    return control instanceof ArchetypeControl;
  }
}
