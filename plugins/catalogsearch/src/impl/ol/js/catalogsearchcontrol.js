export default class CatalogSearchControl extends IDEE.impl.Control {
  /**
   * @classdesc
   * Main constructor of the CatalogSearchControl.
   *
   * @constructor
   * @extends {IDEE.impl.Control}
   * @api stable
   */
  constructor() {
    super();

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.facadeMap_ = null;
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {HTMLElement} html of the plugin
   * @api stable
   */
  addTo(map, element) {
    // specific code
    this.facadeMap_ = map;
    super.addTo(map, element);
  }

  /**
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    IDEE.dialog.info('Hello World!');
  }

  /**
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    IDEE.dialog.info('Bye World!');
  }

  /**
   * Método para recuperar las capabilities de la url pasada por parámetro
   *
   * @param {any} url
   * @returns
   * @memberof CatalogSearchControl
   */
  getLayersFromWMSCapabilities(url) {
    return new Promise((success, fail) => {
      // Version 1.3.0
      const wmsGetCapabilitiesUrl = IDEE.utils.getWMSGetCapabilitiesUrl(url, '1.3.0');
      // eslint-disable-next-line no-console
      IDEE.remote.get(wmsGetCapabilitiesUrl).then((response) => {
        try {
          const getCapabilitiesDocument = response.xml;
          const getCapabilitiesParser = new IDEE.impl.format.WMSCapabilities();
          const getCapabilities = getCapabilitiesParser.read(getCapabilitiesDocument);
          success(getCapabilities);
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
          fail(error);
        }
      }).catch((err) => fail(err));
    });
  }
}
