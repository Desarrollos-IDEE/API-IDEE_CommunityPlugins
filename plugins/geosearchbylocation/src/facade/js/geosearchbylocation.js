/**
 * @module IDEE/plugin/Geosearchbylocation
 */
import GeosearchbylocationControl from './geosearchbylocationcontrol';
import '../assets/css/geosearchbylocation.css';
import api from '../../api.json'; // eslint-disable-line import/extensions

export default class Geosearchbylocation extends IDEE.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a Control
   * object which has an implementation Object
   *
   * @constructor
   * @extends {IDEE.Plugin}
   * @param {Mx.parameters.Geosearchbylocation} parameters - Geosearchbylocation parameters
   * @api stable
   */
  constructor(parameters = {}) {
    // call super
    super();

    /**
     * Name of this control
     * @public
     * @type {string}
     * @api stable
     */
    this.name = Geosearchbylocation.NAME;

    /**
     * URL for the query
     * @private
     * @type {string}
     */
    this.url_ = IDEE.config.GEOSEARCH_URL || 'https://geobusquedas-sigc.juntadeandalucia.es';
    if (!IDEE.utils.isNullOrEmpty(parameters.url)) {
      this.url_ = parameters.url;
    }

    /**
     * Core to the URL for the query
     * @private
     * @type {string}
     */
    this.core_ = IDEE.config.GEOSEARCH_CORE || 'sigc';
    if (!IDEE.utils.isNullOrEmpty(parameters.core)) {
      this.core_ = parameters.core;
    }

    /**
     * Handler to the URL for the query
     * @private
     * @type {string}
     */
    this.handler_ =  IDEE.config.GEOSEARCH_HANDLER || '/search?';
    if (!IDEE.utils.isNullOrEmpty(parameters.handler)) {
      this.handler_ = parameters.handler;
    }

    /**
     * Distance search
     * @private
     * @type {number}
     */
    this.distance_ = IDEE.config.GEOSEARCH_DISTANCE || '600';
    if (!IDEE.utils.isNullOrEmpty(parameters.distance)) {
      this.distance_ = parameters.distance;
    }

    /**
     * Spatial field
     * @private
     * @type {string}
     */
    this.spatialField_ = IDEE.config.GEOSEARCH_SPATIAL_FIELD || 'geom';

    /**
     * Number of responses allowed
     * @private
     * @type {number}
     */
    this.rows_ = IDEE.config.GEOSEARCHBYLOCATION_ROWS || '100';

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.map_ = null;

    /**
     * Implementation of this object
     * @public
     * @type {IDEE.control.Geosearchbylocation}
     * @api stable
     */
    this.controlGeo_ = null;

    /**
     * Plugin panel
     * @private
     * @type {IDEE.ui.Panel}
     */
    this.panel_ = null;

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * @inheritdoc
   * @public
   * @function
   * @param {IDEE.Map} map - Map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.map_ = map;
    this.controlGeo_ = new GeosearchbylocationControl(
      this.url_,
      this.core_,
      this.handler_,
      this.distance_,
      this.spatialField_,
      this.rows_,
    );
    this.controlGeo_.on(IDEE.evt.ADDED_TO_MAP, () => {
      this.fire(IDEE.evt.ADDED_TO_MAP);
    });

    this.panel_ = new IDEE.ui.Panel(Geosearchbylocation.NAME, {
      collapsible: false,
      className: 'm-geosearchbylocation',
      position: IDEE.ui.position.BR,
    });
    // sets the className depending on other panels
    const locationPanel = map.getPanels([IDEE.control.Location.NAME])[0];
    let streetViewPanel;

    // TODO
    // if (!IDEE.utils.isNullOrEmpty(IDEE.plugin.Streetview)) {
    //   streetViewPanel = map.getPanels([IDEE.plugin.Streetview.NAME])[0];
    // }

    if (!IDEE.utils.isNullOrEmpty(locationPanel) && !IDEE.utils.isNullOrEmpty(streetViewPanel)) {
      locationPanel.addClassName('m-with-geosearchbylocation');
      streetViewPanel.addClassName('m-with-geosearchbylocation');
      this.panel_.addClassName('m-with-location m-with-streetview');
    } else if (!IDEE.utils.isNullOrEmpty(locationPanel)) {
      locationPanel.addClassName('m-with-geosearchbylocation');
      this.panel_.addClassName('m-with-location');
    } else if (!IDEE.utils.isNullOrEmpty(streetViewPanel)) {
      streetViewPanel.addClassName('m-with-geosearchbylocation');
      this.panel_.addClassName('m-with-streetview');
    }
    this.panel_.addControls(this.controlGeo_);
    this.map_.addPanels(this.panel_);
  }

  /**
   * This function destroys this plugin
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.map_.removeControls([this.controlGeo_]);
    this.controlGeo_ = null;
    this.name = null;
    this.url_ = null;
    this.core_ = null;
    this.handler_ = null;
    this.distance_ = null;
    this.spatialField_ = null;
    this.rows_ = null;
    this.map_ = null;
    this.controlGeo_ = null;
    this.panel_ = null;
  }

  /**
   * This function return the control of plugin
   *
   * @public
   * @function
   * @api stable
   */
  getControls() {
    const aControl = [];
    aControl.push(this.controlGeo_);
    return aControl;
  }

  /**
   * This function compare if pluging recieved by param is instance of
   * IDEE.plugin.Geosearchbylocation
   *
   * @public
   * @function
   * @param {IDEE.plugin} plugin to comapre
   * @api stable
   */
  equals(plugin) {
    if (plugin instanceof Geosearchbylocation) {
      return true;
    }
    return false;
  }

  /**
   * Gets the parameter api rest of the plugin
   *
   * @public
   * @function
   * @api
   */
  getAPIRest() {
    return `geosearchbylocation=${this.distance_}*${this.url_}*${this.core_}*${this.handler_}`;
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

/**
 * Name of this control
 * @const
 * @type {string}
 * @public
 * @api stable
 */

Geosearchbylocation.NAME = 'geosearchbylocation';
