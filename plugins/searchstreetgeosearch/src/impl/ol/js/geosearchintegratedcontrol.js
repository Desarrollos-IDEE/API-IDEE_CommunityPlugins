/**
 * @module IDEE/impl/ol/control/GeosearchIntegratedControl
 */
import GeosearchControlImpl from 'Geosearch/src/impl/ol/js/geosearchcontrol';

export default class GeosearchIntegrated extends GeosearchControlImpl {
  /**
   * This function replaces the addto of Geosearch not to add control
   *
   * @public
   * @function
   * @param {IDEE.Map} map - Map to add the plugin
   * @param {function} element - Template SearchstreetGeosearch control
   * @api stable
   */
  addTo(map, element) {
    this.facadeMap_ = map;

    map.addLayers(this.layer_);
  }

  /**
   *  This function cancels the zoom function of Geosearch
   *
   * @private
   * @function
   */
  zoomToResults() {}
}
