/**
 * @module M/plugin/Toponomysearch
 */
import 'assets/css/toponomysearch';
import ToponomySearchControl from './toponomysearchcontrol';
import api from '../../api';

export default class ToponomySearch extends IDEE.Plugin {
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
  constructor(parameters = {}) {
    super();

    const params = parameters;

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.map_ = null;

    /**
     * Array of controls
     * @private
     * @type {Array<IDEE.Control>}
     */
    this.controls_ = [];

    this.control_ = null;

    this.name_ = 'toponomysearch';

    /**
     * TODO
     * @private
     * @type {IDEE.ui.Panel}
     */
    this.panel_ = null;

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.url_ = IDEE.config.GEOSEARCH_URL || 'https://geobusquedas-sigc.juntadeandalucia.es';
    if (!IDEE.utils.isNullOrEmpty(params.url)) {
      this.url_ = params.url;
    }

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.core_ = IDEE.config.GEOSEARCH_CORE || 'sigc';
    if (!IDEE.utils.isNullOrEmpty(params.core)) {
      this.core_ = params.core;
    }

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.handler_ = IDEE.config.GEOSEARCH_HANDLER || '/search?';
    if (!IDEE.utils.isNullOrEmpty(params.handler)) {
      this.handler_ = params.handler;
    }

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.searchParameters_ = params.params || {};

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

    // eslint-disable-next-line max-len
    this.control_ = new ToponomySearchControl(this.url_, this.core_, this.handler_, this.searchParameters_);
    this.controls_.push(this.control_);
    this.panel_ = new IDEE.ui.Panel('toponomysearch', {
      'collapsible': true,
      'className': 'm-toponomysearch',
      'collapsedButtonClass': 'g-cartografia-localizacion2',
      'position': IDEE.ui.position.TL,
      'tooltip': 'Búsqueda de topónimos',
    });
    this.panel_.on(IDEE.evt.ADDED_TO_MAP, () => {
      this.fire(IDEE.evt.ADDED_TO_MAP);
    });
    this.panel_.addControls(this.control_);
    this.map_.addPanels(this.panel_);
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
    this.map_ = null;
    this.control_ = null;
    this.panel_ = null;
    this.url_ = null;
    this.core_ = null;
    this.handler_ = null;
    this.searchParameters_ = null;
  }

  /**
   * This function compare if pluging recieved by param is instance of  IDEE.plugin.toponomysearch
   *
   * @public
   * @function
   * @param {IDEE.plugin} plugin to comapre
   * @api stable
   */
  equals(plugin) {
    if (plugin instanceof ToponomySearch) {
      return true;
    }
    return false;
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

  get name() {
    return 'toponomysearch';
  }
}
