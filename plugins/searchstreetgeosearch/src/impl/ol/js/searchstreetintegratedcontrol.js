/**
 * @module IDEE/impl/ol/control/SearchstreetIntegratedControl
 */
import SearchstreetImpl from 'SearchStreet/src/impl/ol/js/searchstreetcontrol';

export default class SearchstreetIntegratedControl extends SearchstreetImpl {
  /**
   * This function replaces the addTo of Searchstreet, not to add control
   *
   * @public
   * @function
   * @param {IDEE.Map} map - Map to add the plugin
   * @param {HTMLElement} template - Template SearchstreetGeosearch control
   * @api stable
   */
  addTo(map, element) {
    this.facadeMap_ = map;
    this.element_ = element;
  }

  /**
   * This function cancels the zoom function of searchstreet
   *
   * @public
   * @function
   * @api stable
   */
  zoomResults() {}
}
