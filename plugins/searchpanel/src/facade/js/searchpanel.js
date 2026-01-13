/**
 * @module M/plugin/Searchpanel
 */
import 'assets/css/searchpanel';
import SearchpanelControl from './searchpanelcontrol';
import api from '../../api';

export default class Searchpanel extends IDEE.Plugin {
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
    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.map_ = null;
    this.panel_ = null;
    this.config_ = parameters.config;
    this.options_ = parameters.options;
    this.position_ = parameters.options.position || 'TL';

    if (this.position_ === 'TL' || this.position_ === 'BL') {
      this.positionClass_ = 'left';
    } else {
      this.positionClass_ = 'right';
    }

    /**
     * Array of controls
     * @private
     * @type {Array<IDEE.Control>}
     */
    this.controls_ = [];

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
    this.controls_.push(new SearchpanelControl(this.config_));
    this.map_ = map;
    // panel para agregar control - no obligatorio
    this.panel_ = new IDEE.ui.Panel('panelSearchpanel', {
      className: `search-panel ${this.positionClass_}`,
      collapsible: true,
      position: IDEE.ui.position[this.position_],
      collapsedButtonClass: 'g-cartografia-prismaticos',
      tooltip: this.config_.title,
    });
    this.panel_.addControls(this.controls_);
    map.addPanels(this.panel_);
    this.panel_.on(IDEE.evt.SHOW, () => {
      if (this.position_ === 'BR') {
        if (document.getElementsByClassName('m-map-info').length > 0) {
          document.getElementsByClassName('m-map-info')[0].style.display = 'none';
        }
        if (document.getElementsByClassName('m-location').length > 0) {
          document.getElementsByClassName('m-location')[0].style.display = 'none';
        }
        if (document.getElementsByClassName('m-rotate').length > 0) {
          document.getElementsByClassName('m-rotate')[0].style.display = 'none';
        }
      }
      if (this.position_ === 'BL') {
        document.getElementsByClassName('m-scaleline')[0].style.display = 'none';
      }
    });
    this.panel_.on(IDEE.evt.HIDE, () => {
      if (this.position_ === 'BR') {
        if (document.getElementsByClassName('m-map-info').length > 0) {
          document.getElementsByClassName('m-map-info')[0].style.display = 'block';
        }
        if (document.getElementsByClassName('m-location').length > 0) {
          document.getElementsByClassName('m-location')[0].style.display = 'block';
        }
        if (document.getElementsByClassName('m-rotate').length > 0) {
          document.getElementsByClassName('m-rotate')[0].style.display = 'block';
        }
      }
      if (this.position_ === 'BL') {
        document.getElementsByClassName('m-scaleline')[0].style.display = 'block';
      }
    });
  }

  /**
     * This function returns the position
     *
     * @public
     * @return {string}
     * @api
     */
  get position() {
    return this.position_;
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

  /**
   * This function destroys this plugin
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.map_.removeControls(this.controls_);
    [this.map_, this.panel_, this.controls_] = [null, null, null];
  }
}
