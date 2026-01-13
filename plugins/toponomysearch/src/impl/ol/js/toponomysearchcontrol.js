/* eslint-disable */ 
/**
 * @module M/impl/control/ToponomysearchControl
 */

import popuptemplate from 'templates/toponomypopup';

export default class ToponomysearchControl extends IDEE.impl.Control {

  /**
   * @classdesc
   * Main constructor of the ToponomySearchControl.
   *
   * @constructor
   * @extends {IDEE.impl.Control}
   * @api stable
   */
  constructor() {
    super();

    /**
     * Facade of the map
     *
     * @private
     * @type {IDEE.Map}
     */
    this.facadeMap_ = null;

    /**
     * List of items drawn on the map for control
     *
     * @public
     * @type {array}
     * @api stable
     */
    this.listPoints = [];

    /**
     * HTML template
     *
     * @private
     * @type {HTMLElement}
     */
    this.element_ = null;

  }

  /**
   * Template for this controls
   * @const
   * @type {string}
   * @public
   * @api stable
   */
  /*static get POPUP_TEMPLATE() {
    return 'toponomypopup.html';
  }*/

  /**
  * This function adds the control to the specified map
  *
  * @public
  * @function
  * @param {IDEE.Map} map - Map to add the plugin
  * @param {HTMLElement} element - Template of this control
  * @api stable
  */
  addTo(map, element) {
    this.facadeMap_ = map;
    this.element_ = element;

    super.addTo(map, element);
  }

  /**
   * This function draw points on the map
   *
   * @public
   * @function
   * @param {array} results - Results query results
   * @api stable
   */
  drawPoints(results) {
    let positionFeature = null;
    for (let i = 0, ilen = results.length; i < ilen; i++) {
      positionFeature = new ol.Feature();
      positionFeature.setStyle(new ol.style.Style({
        image: new ol.style.Circle({
          radius: 6,
          fill: new ol.style.Fill({
            color: '#FFB74D'
          }),
          stroke: new ol.style.Stroke({
            color: '#00897B',
            width: 2
          })
        })
      }));
      /*positionFeature.setGeometry([results[i].entidad.coordenadax,
      results[i].entidad.coordenaday
      ] ? new ol.geom.Point([
        results[i].entidad.coordenadax, results[i].entidad.coordenaday
      ]) : null);*/
      positionFeature.setGeometry(new ol.geom.Point([
        results[i].entidad.coordenadax, 
        results[i].entidad.coordenaday
      ]));
      let properties = results[i].entidad;
      positionFeature.setProperties({
        coordenadax: properties.coordenadax,
        coordenaday: properties.coordenaday,
        nombre: properties.nombre,
        tipo: properties.tipo,
        municipio: properties.municipio,
        provincia: properties.provincia
      });
      positionFeature.setId(properties.identidad);
      this.addEventClickFeature(positionFeature);
      this.listPoints.push(IDEE.impl.Feature.olFeature2Facade(positionFeature));
    }
    this.facadeMap_.drawFeatures(this.listPoints);

    this.zoomResults();
  }

  /**
   * This function zooms results
   *
   * @public
   * @function
   * @api stable
   */
  zoomResults(features) {

    if (IDEE.utils.isNullOrEmpty(features)) {
      features = this.listPoints;
    } else {
      if (!Array.isArray(features)) {
        features = [features];
      }
    }
    //let features = this.facadeMap_.getImpl().getDrawLayer().getOL3Layer().getSource().getFeatures();

    let extent = IDEE.impl.utils.getFeaturesExtent(features,this.facadeMap_.getProjection().code);
    this.facadeMap_.getMapImpl().getView().fit(extent, { duration: 500, minResolution: 5 });
  }


  /**
   * This function calls the show popup function to display information
   *
   * @public
   * @function
   * @param {object} element - Specific result query response
   * @param {ol.Feature} result - Feature
   * @api stable
   */
  addEventClickFeature(feature) {
    feature.set("vendor", {
      "mapea": {
        "click": (evt) => {
          this.showPopup_(feature.getProperties());
        }
      }
    });
  }

  /**
   * This function show popup with information
   *
   * @private
   * @function
   * @param {object} feature - Specific result query response
   * @param {boolean} noPanMapIfOutOfView
   */
  showPopup_(feature, noPanMapIfOutOfView) {
    const htmlAsText = IDEE.template.compileSync(popuptemplate, {
      'jsonp': true,
      'vars': {
        'nombre': feature.nombre,
        'tipo': feature.tipo,
        'mun': feature.municipio,
        'prov': feature.provincia
      },
      'parseToHtml': false
    });

      let popupContent = {
        'icon': 'g-cartografia-zoom',
        'title': 'ToponomySearch',
        'content': htmlAsText
      };

      this.popup_ = this.facadeMap_.getPopup();
      if (!IDEE.utils.isNullOrEmpty(this.popup_)) {
        let hasExternalContent = this.popup_.getTabs().some((tab) => {
          return (tab['title'] !== 'ToponomySearch');
        });
        if (!hasExternalContent) {
          this.facadeMap_.removePopup();
          if (IDEE.utils.isUndefined(noPanMapIfOutOfView)) {
            this.popup_ = new IDEE.Popup();
          }
          else {
            this.popup_ = new IDEE.Popup({
              'panMapIfOutOfView': noPanMapIfOutOfView
            });
          }
          this.popup_.addTab(popupContent);
          this.facadeMap_.addPopup(this.popup_, [feature.coordenadax, feature.coordenaday]);
        }
        else {
          this.popup_.addTab(popupContent);
        }
      }
      else {
        if (IDEE.utils.isUndefined(noPanMapIfOutOfView)) {
          this.popup_ = new IDEE.Popup();
        }
        else {
          this.popup_ = new IDEE.Popup({
            'panMapIfOutOfView': noPanMapIfOutOfView
          });
        }
        this.popup_.addTab(popupContent);
        this.facadeMap_.addPopup(this.popup_, [Math.trunc(feature.coordenadax), Math.trunc(feature.coordenaday)]);
      }
  }

  loadLocation(id) {
    this.facadeMap_.removePopup();
    let feature, drawLayer;
    drawLayer = this.facadeMap_.getLayers().filter((layer) => {
      return (layer.name === '__draw__');
    });
    if (!IDEE.utils.isNullOrEmpty(drawLayer)) {
      feature = drawLayer[0].getFeatureById(id);
    }
    if (!IDEE.utils.isNullOrEmpty(feature)) {
      this.showPopup_(feature.getAttributes(), false);
      this.zoomResults(feature);
    }
  }

  /**
   * This function return HTML template
   *
   * @public
   * @function
   * @api stable
   * @returns {HTMLElement} HTML template
   */
  getElement() {
    return this.element_;
  }


  /**
   * This function remove the points drawn on the map
   *
   * @private
   * @function
   */
  removePoints_() {
    this.facadeMap_.removeFeatures(this.listPoints);
    this.listPoints = [];
  }


  /**
   * This function destroys this control and clearing the HTML
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.removePoints_();
    this.facadeMap_.getMapImpl().removeControl(this);
    this.facadeMap_.getImpl().removePopup();
    this.facadeMap_ = null;
    this.listPoints = null;
    this.element_ = null;
  }
}
