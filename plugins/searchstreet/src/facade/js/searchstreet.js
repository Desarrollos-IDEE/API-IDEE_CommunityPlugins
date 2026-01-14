/**
 * @module IDEE/plugin/Searchstreet
 */
import Autocomplete from './autocomplete';
import SearchstreetControl from './searchstreetcontrol';
import '../assets/css/searchstreet.css';
import api from '../../api';

export default class Searchstreet extends IDEE.Plugin {
  /**
   * @classdesc
   * Main facade plugin object. This class creates a plugin
   * object which has an implementation Object
   *
   * @constructor
   * @extends {IDEE.Plugin}
   * @param {Mx.parameters.Searchstreet} parameters - Searchstreet parameters
   * @api stable
   */
  constructor(parameters = {}) {
    super();
    /**
     * Name plugin
     *
     * @public
     * @type {string}
     * @api stable
     */
    this.name = 'searchstreet';

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.map_ = null;

    /**
     * Searchstreet control
     *
     * @private
     * @type {IDEE.control.Searchstreet}
     */
    this.control_ = null;

    /**
     * Autocomplete control
     *
     * @private
     * @type {IDEE.plugin.Autocomplete}
     */
    this.autocompletador_ = null;

    /**
     * Panel Searchstreet
     * @private
     * @type {IDEE.ui.Panel}
     */
    this.panel_ = null;

    /**
     * Service URL (Searchstreet)
     *
     * @private
     * @type {string}
     */
    this.url_ = IDEE.config.SEARCHSTREET_URL || 'https://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/geocoderMunProvSrs';

    /**
     * INE code to specify the search
     *
     * @private
     * @type {number}
     */
    this.locality_ = '';
    if (!IDEE.utils.isNullOrEmpty(parameters.locality)) {
      this.locality_ = parameters.locality;
    }

    /**
     * Metadata from api.json
     * @private
     * @type {Object}
     */
    this.metadata_ = api.metadata;
  }

  /**
   * @inheritdoc
   *
   * @public
   * @function
   * @param {IDEE.Map}
   *        map - Facade map
   * @api stable
   */
  addTo(map) {
    this.map_ = map;

    map.areasContainer.getElementsByClassName('m-top m-right')[0].classList.add('top-extra');
    // Checks if the received INE code is correct.
    const comCodIne = IDEE.utils.addParameters(IDEE.config.SEARCHSTREET_URLCOMPROBARINE || 'https://ws248.juntadeandalucia.es/EXT_PUB_CallejeroREST/comprobarCodIne', {
      codigo: this.locality_,
    });
    if (!IDEE.utils.isNullOrEmpty(comCodIne)) {
      IDEE.remote.get(comCodIne).then((response) => {
        let results;
        // try {
        if (!IDEE.utils.isNullOrEmpty(response.text)) {
          results = JSON.parse(response.text);
          if (!IDEE.utils.isNullOrEmpty(this.locality_)
            && IDEE.utils.isNullOrEmpty(results.comprobarCodIneResponse.comprobarCodIneReturn)) {
            // If not correct, value empty
            IDEE.dialog.error(`El código del municipio '${this.locality}' no es válido`);
            this.locality_ = '';
          }
        }
        this.control_ = new SearchstreetControl(this.url_, this.locality_);
        this.control_.on(IDEE.evt.ADDED_TO_MAP, () => {
          this.fire(IDEE.evt.ADDED_TO_MAP);
          this.autocompletador_ = new Autocomplete({
            locality: this.locality_,
            target: this.control_.getInput(),
            html: this.control_.getHtml(),
          });
          this.map_.addPlugin(this.autocompletador_);
        }, this);
        this.panel_ = new IDEE.ui.Panel('searchstreet', {
          collapsible: true,
          className: 'm-searchstreet',
          position: IDEE.ui.position.TL,
          tooltip: 'Buscador de calles',
        });
        // JGL20170816: foco al input al desplegar panel

        this.panel_.on(IDEE.evt.ADDED_TO_MAP, (html) => {
          this.panel_.getButtonPanel().addEventListener('click', (evt) => {
            if (!this.panel_.collapsed) {
              this.control_.getInput().focus();
            }
          });
        });
        this.panel_.addControls(this.control_);
        this.map_.addPanels(this.panel_);
        // }
        // catch (err) {
        //   IDEE.exception(`La respuesta no es un JSON válido: ${err}`);
        // }
      });
    }
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
    this.map_.removePlugins(this.autocompletador_);
    this.name = null;
    this.map_ = null;
    this.control_ = null;
    this.autocompletador_ = null;
    this.panel_ = null;
    this.url_ = null;
    this.locality_ = null;
  }

  /**
   * This function compare if pluging recieved by param is instance of IDEE.plugin.Searchstreet
   *
   * @public
   * @function
   * @param {IDEE.plugin} plugin to comapre
   * @api stable
   */
  equals(plugin) {
    if (plugin instanceof Searchstreet) {
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
    return 'searchstreet';
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
