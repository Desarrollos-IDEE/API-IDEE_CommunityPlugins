/**
 * @module M/plugin/Findroute
 */

 import FindrouteControl from './findroutecontrol.js';
 import '@fortawesome/fontawesome-free/js/fontawesome';
 import '@fortawesome/fontawesome-free/js/solid';

 import 'assets/css/findroute.css';


export default class Findroute extends IDEE.Plugin {

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
  constructor(params) {

    super();
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

    /**
     * Searchstreet control
     *
     * @private
     * @type {IDEE.control.Searchstreet}
     */
    this.control_ = null;     

    /**
     * Plugin options
     *
     * @private
     * @type {Object}
     */
    // Compatibilidad: soporta tanto params.options.X como params.X directamente
    this.options_ = IDEE.utils.isUndefined(params.options) ? (params || {}) : params.options;
    
    if(!IDEE.utils.isUndefined(params)){
      this.osrmurl_ = (((!IDEE.utils.isNullOrEmpty(this.options_.osrmurl)) || (!IDEE.utils.isUndefined(this.options_.osrmurl))) ? this.options_.osrmurl : undefined);
      this.osrmurlAlternativa_ = this.options_.osrmurlAlternativa;
      // Soporta tanto options.panel.position como options.position directamente
      const panelPosition = (this.options_.panel && this.options_.panel.position) || this.options_.position;
      this.panelPosition_ = (!IDEE.utils.isNullOrEmpty(panelPosition) ? panelPosition : IDEE.ui.position.TL);
      this.conflictedPlugins_ = this.options_.conflictedPlugins || [];
      if (!IDEE.utils.isArray(this.conflictedPlugins_)) {
        this.conflictedPlugins_ = this.conflictedPlugins_.split(',');
      }
      this.urlGeocoderInverso = this.options_.urlGeocoderInverso;
    }else{
      this.osrmurl_ = undefined;
      this.panelPosition_ =  IDEE.ui.position.TL;    
      this.conflictedPlugins_ = [];
    }

    /**
     * Service URL (Searchstreet)
     *
     * @private
     * @type {string}
     */
    this.url_ = this.options_.searchstreetUrl || 'https://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/geocoderMunProvSrs';

    /**
     * Service URL (Searchstreet Normalizar)
     */
    this.searchstreetNormalizar = this.options_.searchstreetNormalizar || 'https://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/normalizar';
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
    this.control_ = new FindrouteControl(this.url_, this.osrmurl_, this.osrmurlAlternativa_, this.conflictedPlugins_, this.urlGeocoderInverso, this.searchstreetNormalizar);
    this.controls_.push(this.control_);
    this.map_ = map;
    this.panel_ = new IDEE.ui.Panel("panelfindroute", {
      collapsible: true,
      className: 'm-findroute',
      position: this.panelPosition_,
      collapsedButtonClass: "g-cartografia-mapa-ruta",
      tooltip: "Cálculo de rutas"
    });

    // Foco al input al desplegar panel
    this.panel_.on(IDEE.evt.ADDED_TO_MAP, (html) => {
      this.panel_._buttonPanel.addEventListener('click', (evt) => {
        if (!this.panel_.collapsed) {
          this.control_.getInputOrigen().focus();
        }
      });
    });

    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
  }

  /**
   * Obtiene el nombre del plugin
   *
   * @getter
   * @function
   */
  get name() {
    return 'findroute';
  }

  /**
   * Esta función destruye el plugin
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.map_.removeControls(this.controls_);
    [this.map_, this.control_, this.controls_, this.panel_] = [null, null, null, null];
  }
}
