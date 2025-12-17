/**
 * @module M/plugin/CatalogSearch
 */
import 'assets/css/catalogsearch';
import CatalogSearchControl from './catalogsearchcontrol';
import api from '../../api';

export default class CatalogSearch extends IDEE.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {IDEE.Plugin}
   * @param {Object} impl implementation object
   * @api stable
   */
  constructor(parameters) {
    super();

    const varParameters = (parameters || {});

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.map_ = null;

    /**
     * Control that executes the searches
     * @private
     * @type {Object}
     */
    this.control_ = null;

    /**
     * @private
     * @type {IDEE.ui.Panel}
     */
    this.panel_ = null;

    /**
     * Name of this control
     * @public
     * @type {string}
     * @api stable
     */
    this.name_ = 'catalogsearch';

    /**
     * Classname of html Plugin
     *
     * @private
     * @type {String}
     */
    this.className_ = varParameters.classname || 'm-catalogsearch';

    /**
     * Collapsible Plugin
     *
     * @private
     * @type {boolean}
     */
    this.collapsible_ = varParameters.collapsible;
    if (this.collapsible_ === undefined) this.collapsible_ = true;

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.geoNetworkUrl_ = 'http://www.ideandalucia.es/catalogo/inspire/srv/spa';
    if (!IDEE.utils.isNullOrEmpty(varParameters.geoNetworkUrl)) {
      this.geoNetworkUrl_ = varParameters.geoNetworkUrl;
    }

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * This function adds this plugin into the map
   *
   * @public
   * @function
   * @param {IDEE.Map} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.map_ = map;

    // eslint-disable-next-line no-underscore-dangle
    map._areasContainer.getElementsByClassName('m-top m-right')[0].classList.add('top-extra');

    this.control_ = new CatalogSearchControl(this.geoNetworkUrl_);
    this.panel_ = new IDEE.ui.Panel('catalogsearch', {
      collapsible: this.collapsible_,
      className: this.className_,
      collapsedButtonClass: 'g-cartografia-zoom',
      position: IDEE.ui.position.TL,
      tooltip: 'Búsqueda en catálogo',
    });
    this.panel_.addControls(this.control_);
    this.map_.addPanels(this.panel_);
    this.control_.on(IDEE.evt.ADDED_TO_MAP, () => {
      this.fire(IDEE.evt.ADDED_TO_MAP);
    });
  }

  /**
   * This function provides the input search
   *
   * @public
   * @function
   * @returns {HTMLElement} the input that executes the search
   * @api stable
   */
  getInput() {
    let inputSearch = null;
    if (!IDEE.utils.isNullOrEmpty(this.control_)) {
      inputSearch = this.control_.getInput();
    }
    return inputSearch;
  }

  /**
   * This function destroys this plugin
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.map_.removeControls([this.control_]);
    [this.map_, this.control_, this.panel_,
      this.geoNetworkUrl_, this.searchParameters_,
    ] = [null, null, null, null, null];
  }

  /**
   * This function compare if pluging recieved by param is instance of  IDEE.plugin.catalogsearch
   *
   * @public
   * @function
   * @param {IDEE.plugin} plugin to comapre
   * @api stable
   */
  equals(plugin) {
    let boolean = false;
    if (plugin instanceof CatalogSearch) {
      boolean = true;
    }
    return boolean;
  }

  /**
   * This functions returns the controls of the plugin.
   *
   * @public
   * @return {IDEE.Control}
   * @api
   */
  get control() {
    return this.control_;
  }

  /**
   * @getter
   * @public
   */
  get name() {
    return 'catalogsearch';
  }

  /**
   * This function gets metadata plugin
   *
   * @public
   * @function
   * @api stable
   */
  getMetadata() {
    return this.metadata_;
  }
}
