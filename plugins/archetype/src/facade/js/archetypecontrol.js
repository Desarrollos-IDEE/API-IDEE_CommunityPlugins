/**
 * @module IDEE/control/ArchetypeControl
 */

import ArchetypeImplControl from 'impl/archetypecontrol';
import template from 'templates/archetype';
import { getValue } from './i18n/language';

/**
 * @classdesc
 * Control de ejemplo del plugin Archetype.
 */
export default class ArchetypeControl extends IDEE.Control {
  /**
   * @constructor
   * @extends {IDEE.Control}
   * @param {Object} options control options
   * @api stable
   */
  constructor(options = {}) {
    if (IDEE.utils.isUndefined(ArchetypeImplControl)
      || (IDEE.utils.isObject(ArchetypeImplControl)
      && IDEE.utils.isNullOrEmpty(Object.keys(ArchetypeImplControl)))) {
      IDEE.exception(getValue('exception.impl'));
    }
    const impl = new ArchetypeImplControl();
    super(ArchetypeControl.NAME, impl, options);
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
    this.map_ = map;
    return IDEE.template.compileSync(template, {
      vars: {
        translations: {
          text: getValue('text'),
        },
      },
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

/**
 * Name of this control
 * @const
 * @type {string}
 * @public
 * @api stable
 */
ArchetypeControl.NAME = 'Archetype';
