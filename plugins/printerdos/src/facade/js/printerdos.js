/**
 * @module IDEE/plugin/Printer
 */
import PrinterControl from './printercontrol';
import '../assets/css/printer.css';
import api from '../../api';

export default class Printer extends IDEE.Plugin {
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
    super(null);

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
     * TODO
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
    this.name = Printer.NAME;

    if (IDEE.utils.isUndefined(IDEE.config.geoprint2)) {
      IDEE.config('geoprint2', {
        URL: 'https://geoprint-sigc.juntadeandalucia.es/geoprint3/print/SIGC',
        URL_APPLICATION: 'https://geoprint-sigc.juntadeandalucia.es/geoprint3',
      });
    }

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.url_ = IDEE.config.geoprint2.URL;
    if (!IDEE.utils.isNullOrEmpty(parameters.url)) {
      this.url_ = parameters.url;
    }

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.params_ = {
      urlApplication: IDEE.config.geoprint2.URL_APPLICATION,
      layout: {
        outputFilename: 'apiidee_${yyyy-MM-dd_hhmmss}',
      },
    };
    if (!IDEE.utils.isNullOrEmpty(parameters.params)) {
      this.params_ = parameters.params;
      if (IDEE.utils.isNullOrEmpty(this.params_.urlApplication)) {
        this.params_.urlApplication = IDEE.config.geoprint2.URL_APPLICATION;
      }

      if (IDEE.utils.isNullOrEmpty(this.params_.layout)) {
        this.params_.layout = {
          outputFilename: 'apiidee_${yyyy-MM-dd_hhmmss}',
        };
      }
    }

    /**
     * Facade of the map
     * @private
     * @type {String}
     */
    this.options_ = {};
    if (!IDEE.utils.isNullOrEmpty(parameters.options)) {
      this.options_ = parameters.options;
    }

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * This function provides the implementation
   * of the object
   *
   * @public
   * @function
   * @param {Object} map the map to add the plugin
   * @api stable
   */
  addTo(map) {
    this.map_ = map;

    this.control_ = new PrinterControl(
      this.url_,
      this.params_,
      this.options_,
    );
    this.panel_ = new IDEE.ui.Panel('printer', {
      collapsible: true,
      className: 'm-printer',
      collapsedButtonClass: 'g-cartografia-impresora',
      position: IDEE.ui.position.TR,
      tooltip: 'Impresión del mapa',
    });
    this.panel_.on(IDEE.evt.ADDED_TO_MAP, (html) => {
      IDEE.utils.enableTouchScroll(html);
    });
    this.panel_.addControls(this.control_);
    this.map_.addPanels(this.panel_);

    this.control_.on(IDEE.evt.ADDED_TO_MAP, () => {
      this.fire(IDEE.evt.ADDED_TO_MAP);
    });
  }

  /**
   * This function return the control of plugin
   *
   * @public
   * @function
   * @api stable
   */
  getControls() {
    const aControls = [];
    aControls.push(this.control_);
    return aControls;
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
    this.params_ = null;
    this.options_ = null;
    this.name = null;
  }

  /**
   * This function compare if pluging recieved by param is instance of   IDEE.plugin.Printer
   *
   * @public
   * @function
   * @param {IDEE.plugin} plugin to comapre
   * @api stable
   */
  equals(plugin) {
    if (plugin instanceof Printer) {
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
    return `printer=${this.url_}`;
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
 * Name to identify this plugin
 * @const
 * @type {string}
 * @public
 * @api stable
 */
Printer.NAME = 'printer';
