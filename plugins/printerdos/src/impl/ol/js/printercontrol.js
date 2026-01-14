/**
 * @namespace IDEE.impl.control
 */
export default class PrinterControl extends IDEE.impl.Control {
  /**
   * @classdesc
   * Main constructor of the measure conrol.
   *
   * @constructor
   * @extends {ol.control.Control}
   * @api stable
   */
  constructor(options = {}) {
    super();
    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.facadeMap_ = null;

    this.additionalOptsLabel_ = {};
    this.labeling_ = options.labeling;
    if (!IDEE.utils.isNullOrEmpty(this.labeling_)) {
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.allowOverruns)) {
        this.additionalOptsLabel_.allowOverruns = this.labeling_.allowOverruns;
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.autoWrap)) {
        this.additionalOptsLabel_.autoWrap = this.labeling_.autoWrap;
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.conflictResolution)) {
        this.additionalOptsLabel_.conflictResolution = this.labeling_.conflictResolution;
      } else {
        this.additionalOptsLabel_.conflictResolution = 'false';
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.followLine)) {
        this.additionalOptsLabel_.followLine = this.labeling_.followLine;
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.goodnessOfFit)) {
        this.additionalOptsLabel_.goodnessOfFit = this.labeling_.goodnessOfFit;
      } else {
        this.additionalOptsLabel_.goodnessOfFit = 0.9;
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.group)) {
        this.additionalOptsLabel_.group = this.labeling_.group;
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.maxDisplacement)) {
        this.additionalOptsLabel_.maxDisplacement = this.labeling_.maxDisplacement;
      }
      if (!IDEE.utils.isNullOrEmpty(this.labeling_.spaceAround)) {
        this.additionalOptsLabel_.spaceAround = this.labeling_.spaceAround;
      }
    } else {
      this.additionalOptsLabel_.conflictResolution = 'false';
      this.additionalOptsLabel_.goodnessOfFit = 0.9;
    }
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  addTo(map, element) {
    this.facadeMap_ = map;

    this.element = element;

    super.addTo(map, element);
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeLayer(layer) {
    return (new Promise((success, fail) => {
      if (layer.type === IDEE.layer.type.WMC) {
        // none
      } else if (layer.type === IDEE.layer.type.KML) {
        success(this.encodeKML(layer));
      } else if (layer.type === IDEE.layer.type.WMS) {
        success(this.encodeWMS(layer));
      } else if (layer.type === IDEE.layer.type.WFS) {
        success(this.encodeWFS(layer));
      } else if (layer.type === IDEE.layer.type.GeoJSON) {
        /* se reutiliza el codificador WFS ya, aunque ya está en geojson,
          el proceso a realizar es el mismo y recodificar en geojson no
          penaliza */

        success(this.encodeWFS(layer));
      } else if (layer.type === IDEE.layer.type.WMTS) {
        this.encodeWMTS(layer).then((encodedLayer) => {
          success(encodedLayer);
        });
      } else if (layer instanceof IDEE.layer.MVT) {
        success(this.encodeMVT(layer));
      } else if (layer.type === IDEE.layer.type.MBtiles) {
        // none
      } else if (layer.type === IDEE.layer.type.OSM) {
        success(this.encodeOSM(layer));
      } else if (layer.type === IDEE.layer.type.Mapbox) {
        success(this.encodeMapbox(layer));
      } else if (IDEE.utils.isNullOrEmpty(layer.type) && layer instanceof IDEE.layer.Vector) {
        success(this.encodeWFS(layer));
      } else {
        success(this.encodeWFS(layer));
      }
    }));
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeLegend(layer) {
    let encodedLegend = null;

    if (layer.displayInLayerSwitcher) {
      encodedLegend = {
        classes: [],
      };

      const regExpImgDefault = new RegExp(`.*${IDEE.Layer.LEGEND_DEFAULT}$`);
      const regExpImgError = new RegExp(`.*${IDEE.Layer.LEGEND_ERROR}$`);
      const legendURL = layer.getLegendURL();
      if (!IDEE.utils.isNullOrEmpty(legendURL) && !regExpImgDefault.test(legendURL)
        && !regExpImgError.test(legendURL)) {
        encodedLegend.classes[0] = {
          name: layer.name,
          icons: [layer.getLegendURL()],
        };
        if (layer instanceof IDEE.layer.Vector) {
          delete encodedLegend.classes[0].icons;
        }
      }
    }

    return encodedLegend;
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeKML(layer) {
    let encodedLayer = null;

    const olLayer = layer.getImpl().getLayer();
    const features = olLayer.getSource().getFeatures();
    const layerName = layer.name;
    const layerOpacity = olLayer.getOpacity();
    const geoJSONFormat = new ol.format.GeoJSON();
    let bbox = this.facadeMap_.getBbox();
    bbox = [bbox.x.min, bbox.y.min, bbox.x.max, bbox.y.max];
    const resolution = this.facadeMap_.getMapImpl().getView().getResolution();

    const encodedFeatures = [];
    let indexText = 1;
    let indexGeom = 1;
    let style = '';
    const stylesNames = {};
    const stylesNamesText = {};
    let index = 1;
    let nameFeature;
    let filter;
    features.forEach((feature) => {
      const geometry = feature.getGeometry();
      let styleId = feature.get('styleUrl');
      if (!IDEE.utils.isNullOrEmpty(styleId)) {
        styleId = styleId.replace('#', '');
      }
      const styleFn = feature.getStyle();
      if (!IDEE.utils.isNullOrEmpty(styleFn)) {
        let featureStyle;
        try {
          featureStyle = styleFn(feature, resolution);
          if (Array.isArray(featureStyle)) {
            featureStyle = featureStyle[0];
          }
        } catch (e) {
          featureStyle = styleFn.call(feature, resolution)[0];
        }
        if (!IDEE.utils.isNullOrEmpty(featureStyle)) {
          const img = featureStyle.getImage();
          let imgSize = img.getImageSize();
          if (IDEE.utils.isNullOrEmpty(imgSize)) {
            imgSize = [64, 64];
          }
          // MapFish Print 3 solo acepta los tipos polygon, text, line y point
          let parseType;
          if (feature.getGeometry().getType().toLowerCase() === 'multipolygon') {
            parseType = 'polygon';
          } else if (feature.getGeometry().getType().toLowerCase() === 'multipoint') {
            parseType = 'point';
          } else {
            parseType = feature.getGeometry().getType().toLowerCase();
          }
          const stroke = featureStyle.getStroke();
          let styleText;
          const styleGeom = {
            type: parseType,
            id: styleId,
            externalGraphic: img.getSrc(),
            graphicHeight: imgSize[0],
            graphicWidth: imgSize[1],
            graphicOpacity: img.getOpacity(),
            strokeWidth: stroke ? stroke.getWidth() : 1,
          };
          const text = (featureStyle.getText && featureStyle.getText());
          if (!IDEE.utils.isNullOrEmpty(text)) {
            styleText = {
              type: 'text',
              label: IDEE.utils.isNullOrEmpty(text.getText()) ? feature.get('name') : text.getText(),
              fontColor: IDEE.utils.isNullOrEmpty(text.getFill()) ? '' : IDEE.utils.rgbToHex(IDEE.utils.isArray(text.getFill().getColor())
                ? `rgba(${text.getFill().getColor().toString()})`
                : text.getFill().getColor()),
              fontSize: '11px',
              fontFamily: 'Helvetica, sans-serif',
              fontWeight: 'bold',
              conflictResolution: this.additionalOptsLabel_.conflictResolution,
              labelAlign: text.getTextAlign(),
              labelXOffset: text.getOffsetX(),
              labelYOffset: text.getOffsetY(),
              labelOutlineColor: IDEE.utils.isNullOrEmpty(text.getStroke()) ? '' : IDEE.utils.rgbToHex(IDEE.utils.isArray(text.getStroke().getColor())
                ? `rgba(${text.getStroke().getColor().toString()})`
                : text.getStroke().getColor()),
              labelOutlineWidth: IDEE.utils.isNullOrEmpty(text.getStroke()) ? '' : text.getStroke().getWidth(),
            };
            // Se deja la cifra hexadecimal en 6 dígitos para la integración con Mapea 4
            styleText.fontColor = styleText.fontColor.slice(0, 7);
            styleText.labelOutlineColor = styleText.labelOutlineColor.slice(0, 7);
            styleText = this.addAdditionalLabelOptions(styleText);
          }
          nameFeature = `draw${index}`;
          if ((!IDEE.utils.isNullOrEmpty(geometry) && geometry.intersectsExtent(bbox))
            || !IDEE.utils.isNullOrEmpty(text)) {
            const styleStr = JSON.stringify(styleGeom);
            const styleTextStr = JSON.stringify(styleText);
            let styleName = stylesNames[styleStr];
            let styleNameText = stylesNamesText[styleTextStr];
            if (IDEE.utils.isUndefined(styleName) || IDEE.utils.isUndefined(styleNameText)) {
              const symbolizers = [];
              let flag = 0;
              if (!IDEE.utils.isNullOrEmpty(geometry) && geometry.intersectsExtent(bbox)
                && IDEE.utils.isUndefined(styleName)) {
                styleName = indexGeom;
                stylesNames[styleStr] = styleName;
                flag = 1;
                symbolizers.push(styleStr);
                indexGeom += 1;
                index += 1;
              }
              if (!IDEE.utils.isNullOrEmpty(text) && IDEE.utils.isUndefined(styleNameText)) {
                styleNameText = indexText;
                stylesNamesText[styleTextStr] = styleNameText;
                symbolizers.push(styleTextStr);
                indexText += 1;
                if (flag === 0) {
                  index += 1;
                  symbolizers.push(styleStr);
                }
              }
              if (styleName === undefined) {
                styleName = 0;
              }
              if (styleNameText === undefined) {
                styleNameText = 0;
              }
              // Se añaden los estilos con el formato adecuado para MapFish Print 3
              filter = `"[_gx_style ='${styleName + styleNameText}']"`;
              if (!IDEE.utils.isNullOrEmpty(symbolizers)) {
                const a = ` ${filter}:{"symbolizers": [${symbolizers}]}`;
                if (style !== '') {
                  style += `,${a}`;
                } else {
                  style += `{${a},"version":"2"`;
                }
              }
            }

            const geoJSONFeature = geoJSONFormat.writeFeatureObject(feature);
            geoJSONFeature.properties = {
              // gx_style es la propiedad que se usa para referenciar a la feature en los estilos
              _gx_style: styleName + styleNameText,
              name: nameFeature,
            };
            encodedFeatures.push(geoJSONFeature);
          }
        }
      }
    }, this);

    if (style !== '') {
      style = JSON.parse(style.concat('}'));
    } else {
      style = {
        '*': {
          symbolizers: [],
        },
        version: '2',
      };
    }

    encodedLayer = {
      type: 'Vector',
      style,
      styleProperty: '_gx_style',
      geoJson: {
        type: 'FeatureCollection',
        features: encodedFeatures,
      },
      name: layerName,
      opacity: layerOpacity,
    };

    return encodedLayer;
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeWMS(layer) {
    let encodedLayer = null;
    const olLayer = layer.getImpl().getLayer();
    const layerUrl = layer.url;
    const layerOpacity = olLayer.getOpacity();
    // const tiled = layer.getImpl().tiled;
    const params = olLayer.getSource().getParams();
    const paramsLayers = [params.LAYERS];
    const paramsFormat = params.FORMAT;
    const paramsStyles = [params.STYLES];
    encodedLayer = {
      baseURL: layerUrl,
      opacity: layerOpacity,
      // singleTile: !tiled,
      type: 'WMS',
      layers: paramsLayers.join(',').split(','),
      format: paramsFormat || 'image/jpeg',
      styles: paramsStyles.join(',').split(','),
    };

    /** ***********************************
     MAPEA DE CAPAS TILEADA.
    ************************************ */
    // Se adapta el código para llamar al método noCache o noChache
    // dependiendo si usamos Mapea 5 o 4
    // eslint-disable-next-line no-underscore-dangle
    if (layer._updateNoCache) {
      // eslint-disable-next-line no-underscore-dangle
      layer._updateNoCache();
      const noCacheName = layer.getNoCacheName();
      const noChacheUrl = layer.getNoCacheUrl();
      if (!IDEE.utils.isNullOrEmpty(noCacheName) && !IDEE.utils.isNullOrEmpty(noChacheUrl)) {
        encodedLayer.layers = [noCacheName];
        encodedLayer.baseURL = noChacheUrl;
      }
    } else {
      const noCacheName = layer.getNoChacheName();
      const noCacheUrl = layer.getNoChacheUrl();
      if (!IDEE.utils.isNullOrEmpty(noCacheName) && !IDEE.utils.isNullOrEmpty(noCacheUrl)) {
        encodedLayer.layers = [noCacheName];
        encodedLayer.baseURL = noCacheUrl;
      }
    }

    /** *********************************  */

    /** Ticket */
    if (IDEE.config.ticket != null && encodedLayer.baseURL.indexOf('&ticket') === -1) {
      encodedLayer.baseURL = IDEE.utils.addParameters(encodedLayer.baseURL, `ticket=${IDEE.config.ticket}`);
    }

    // defaults
    encodedLayer.customParams = {
      // service: 'WMS',
      // version: '1.1.1',
      // request: 'GetMap',
      // styles: '',
      // format: 'image/jpeg',
    };

    const propKeys = Object.keys(params);
    propKeys.forEach((key) => {
      if ('iswmc,transparent'.indexOf(key.toLowerCase()) !== -1) {
        encodedLayer.customParams[key] = params[key];
      }
    });
    return encodedLayer;
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeWFS(layer) {
    let encodedLayer = null;
    let continuePrint = true;
    if (layer.getStyle() instanceof IDEE.style.Chart) {
      continuePrint = false;
    } else if (layer.getStyle() instanceof IDEE.style.Cluster
      && layer.getStyle().getOldStyle() instanceof IDEE.style.Chart) {
      continuePrint = false;
    }
    if (continuePrint) {
      const projection = this.facadeMap_.getProjection();
      const olLayer = layer.getImpl().getLayer();
      let features = null;
      // Esta condición sirve para que las capas MVT no provoquen un error.
      // Te devuelve la capa sin estilos.
      if (layer.type === IDEE.layer.type.MVT) {
        features = layer.getFeatures();
      } else {
        features = [];
        if (olLayer.getSource() != null) {
          features = olLayer.getSource().getFeatures();
        }
      }
      const layerName = layer.name;
      const layerOpacity = olLayer.getOpacity();
      const layerStyle = olLayer.getStyle();
      const geoJSONFormat = new ol.format.GeoJSON();
      let bbox = this.facadeMap_.getBbox();
      bbox = [bbox.x.min, bbox.y.min, bbox.x.max, bbox.y.max];
      const resolution = this.facadeMap_.getMapImpl().getView().getResolution();

      const encodedFeatures = [];
      let nameFeature;
      let filter;
      let index = 1;
      let indexText = 1;
      let indexGeom = 1;
      let style = '';
      const stylesNames = {};
      const stylesNamesText = {};
      features.forEach((feature) => {
        const geometry = feature.getGeometry();
        let featureStyle;
        const fStyle = feature.getStyle();

        if (!IDEE.utils.isNullOrEmpty(fStyle)) {
          featureStyle = fStyle;
        } else if (!IDEE.utils.isNullOrEmpty(layerStyle)) {
          featureStyle = layerStyle;
        }

        if (featureStyle instanceof Function) {
          featureStyle = featureStyle.call(featureStyle, feature, resolution);
        }

        let styleIcon = null;
        if (featureStyle instanceof Array) {
          // JGL20180118: prioridad al estilo que tiene SRC
          if (featureStyle.length > 1) {
            styleIcon = !IDEE.utils.isNullOrEmpty(featureStyle[1])
              && !IDEE.utils.isNullOrEmpty(featureStyle[1].getImage())
              && featureStyle[1].getImage().getGlyph
              ? featureStyle[1].getImage() : null;
            featureStyle = (!IDEE.utils.isNullOrEmpty(featureStyle[1].getImage())
                && featureStyle[1].getImage().getSrc)
              ? featureStyle[1] : featureStyle[0];
          } else {
            featureStyle = featureStyle[0];
          }
        }

        if (!IDEE.utils.isNullOrEmpty(featureStyle)) {
          const image = featureStyle.getImage();
          const imgSize = IDEE.utils
            .isNullOrEmpty(image) ? [0, 0] : (image.getImageSize() || [24, 24]);
          let text = featureStyle.getText();
          if (IDEE.utils.isNullOrEmpty(text) && !IDEE.utils.isNullOrEmpty(featureStyle.textPath)) {
            text = featureStyle.textPath;
          }
          let parseType;
          if (feature.getGeometry().getType().toLowerCase() === 'multipolygon') {
            parseType = 'polygon';
          } else if (feature.getGeometry().getType().toLowerCase() === 'multipoint') {
            parseType = 'point';
          } else if (feature.getGeometry().getType().toLowerCase() === 'multilinestring') {
            parseType = 'line';
          } else {
            parseType = feature.getGeometry().getType().toLowerCase();
          }
          const stroke = IDEE.utils.isNullOrEmpty(image)
            ? featureStyle.getStroke() : (image.getStroke && image.getStroke());
          const fill = IDEE.utils.isNullOrEmpty(image)
            ? featureStyle.getFill() : (image.getFill && image.getFill());

          let styleText;
          const pointRadius = IDEE.utils.isNullOrEmpty(image) ? '' : (image.getRadius && image.getRadius());

          const styleGeom = {
            type: parseType,
            fillColor: IDEE.utils.isNullOrEmpty(fill) ? '#000000' : IDEE.utils.rgbaToHex(fill.getColor()).slice(0, 7),
            fillOpacity: IDEE.utils.isNullOrEmpty(fill)
              ? 0 : IDEE.utils.getOpacityFromRgba(fill.getColor()),
            strokeColor: IDEE.utils.isNullOrEmpty(stroke) ? '#000000' : IDEE.utils.rgbaToHex(stroke.getColor()),
            strokeOpacity: IDEE.utils.isNullOrEmpty(stroke)
              ? 0 : IDEE.utils.getOpacityFromRgba(stroke.getColor()),
            strokeWidth: IDEE.utils.isNullOrEmpty(stroke)
              ? 0 : (stroke.getWidth && stroke.getWidth()),
            pointRadius: IDEE.utils.isNullOrEmpty(image) ? '' : (image.getRadius && image.getRadius()),
            externalGraphic: IDEE.utils.isNullOrEmpty(image) ? '' : (image.getSrc && image.getSrc()),
            graphicHeight: imgSize[0],
            graphicWidth: imgSize[1],
          };

          if (Number.isNaN(pointRadius)) {
            styleGeom.fillOpacity = 0;
            styleGeom.strokeOpacity = 0;
            styleGeom.pointRadius = 0;
          }
          const imageIcon = !IDEE.utils.isNullOrEmpty(styleIcon)
            && styleIcon.getImage ? styleIcon.getImage() : null;
          if (!IDEE.utils.isNullOrEmpty(imageIcon)) {
            if (styleIcon.getRadius && styleIcon.getRadius()) {
              styleGeom.pointRadius = styleIcon.getRadius && styleIcon.getRadius();
            }
            if (styleIcon.getOpacity && styleIcon.getOpacity()) {
              styleGeom.graphicOpacity = styleIcon.getOpacity();
            }
            styleGeom.externalGraphic = imageIcon.toDataURL();
          }

          if (!IDEE.utils.isNullOrEmpty(text)) {
            let tAlign = text.getTextAlign();
            let tBLine = text.getTextBaseline();
            let align = '';
            if (!IDEE.utils.isNullOrEmpty(tAlign)) {
              if (tAlign === IDEE.style.align.LEFT) {
                tAlign = 'l';
              } else if (tAlign === IDEE.style.align.RIGHT) {
                tAlign = 'r';
              } else if (tAlign === IDEE.style.align.CENTER) {
                tAlign = 'c';
              } else {
                tAlign = '';
              }
            }
            if (!IDEE.utils.isNullOrEmpty(tBLine)) {
              if (tBLine === IDEE.style.baseline.BOTTOM) {
                tBLine = 'b';
              } else if (tBLine === IDEE.style.baseline.MIDDLE) {
                tBLine = 'm';
              } else if (tBLine === IDEE.style.baseline.TOP) {
                tBLine = 't';
              } else {
                tBLine = '';
              }
            }
            if (!IDEE.utils.isNullOrEmpty(tAlign) && !IDEE.utils.isNullOrEmpty(tBLine)) {
              align = tAlign.concat(tBLine);
            }
            const font = text.getFont();
            const fontWeight = !IDEE.utils.isNullOrEmpty(font) && font.indexOf('bold') > -1 ? 'bold' : 'normal';
            let fontSize = '11px';
            if (!IDEE.utils.isNullOrEmpty(font)) {
              const px = font.substr(0, font.indexOf('px'));
              if (!IDEE.utils.isNullOrEmpty(px)) {
                const space = px.lastIndexOf(' ');
                if (space > -1) {
                  fontSize = px.substr(space, px.length).trim().concat('px');
                } else {
                  fontSize = px.concat('px');
                }
              }
            }
            styleText = {
              type: 'text',
              label: text.getText() || '',
              fontColor: IDEE.utils.isNullOrEmpty(text.getFill()) ? '#000000' : IDEE.utils.rgbToHex(text.getFill().getColor()),
              fontSize,
              fontFamily: 'Helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight,
              conflictResolution: this.additionalOptsLabel_.conflictResolution,
              labelXOffset: text.getOffsetX(),
              labelYOffset: text.getOffsetY(),
              fillColor: styleGeom.fillColor || '#FF0000',
              fillOpacity: styleGeom.fillOpacity || 1,
              labelOutlineColor: IDEE.utils.isNullOrEmpty(text.getStroke()) ? '' : IDEE.utils.rgbToHex(text.getStroke().getColor() || '#FF0000'),
              labelOutlineWidth: IDEE.utils.isNullOrEmpty(text.getStroke()) ? '' : text.getStroke().getWidth(),
              labelAlign: align,
            };
            styleText = this.addAdditionalLabelOptions(styleText);
          }
          nameFeature = `draw${index}`;

          if ((!IDEE.utils.isNullOrEmpty(geometry) && geometry.intersectsExtent(bbox))
            || !IDEE.utils.isNullOrEmpty(text)) {
            const styleStr = JSON.stringify(styleGeom);
            const styleTextStr = JSON.stringify(styleText);
            let styleName = stylesNames[styleStr];
            let styleNameText = stylesNamesText[styleTextStr];
            if (IDEE.utils.isUndefined(styleName) || IDEE.utils.isUndefined(styleNameText)) {
              const symbolizers = [];
              let flag = 0;
              if (!IDEE.utils.isNullOrEmpty(geometry) && geometry.intersectsExtent(bbox)
                && IDEE.utils.isUndefined(styleName)) {
                styleName = indexGeom;
                stylesNames[styleStr] = styleName;
                flag = 1;
                symbolizers.push(styleStr);
                indexGeom += 1;
                index += 1;
              }
              if (!IDEE.utils.isNullOrEmpty(text) && IDEE.utils.isUndefined(styleNameText)) {
                styleNameText = indexText;
                stylesNamesText[styleTextStr] = styleNameText;
                symbolizers.push(styleTextStr);
                indexText += 1;
                if (flag === 0) {
                  index += 1;
                  symbolizers.push(styleStr);
                }
              }

              if (styleName === undefined) {
                styleName = 0;
              }
              if (styleNameText === undefined) {
                styleNameText = 0;
              }
              filter = `"[_gx_style ='${styleName + styleNameText}']"`;
              if (!IDEE.utils.isNullOrEmpty(symbolizers)) {
                let a = ` ${filter}:{"symbolizers": [${symbolizers}]}`;
                if (layer.getStyle() instanceof IDEE.style.Proportional) {
                  const typeFeature = feature.getGeometry().getType().toLocaleLowerCase();
                  if (typeFeature.indexOf('polygon') >= 0) {
                    a = a.replace('polygon', 'point');
                  } else if (typeFeature.indexOf('line') >= 0) {
                    a = a.replace('line', 'point');
                  }
                }
                a = a.replace('linestring', 'line');
                if (style !== '') {
                  style += `,${a}`;
                } else {
                  style += `{${a},"version":"2"`;
                }
              }
            }

            let geoJSONFeature;
            if (projection.code !== 'EPSG:3857' && this.facadeMap_.getLayers().some((layerParam) => (layerParam.type === IDEE.layer.type.OSM || layerParam.type === IDEE.layer.type.Mapbox))) {
              geoJSONFeature = geoJSONFormat.writeFeatureObject(feature, {
                featureProjection: projection.code,
                dataProjection: 'EPSG:3857',
              });
            } else {
              geoJSONFeature = geoJSONFormat.writeFeatureObject(feature);
            }
            geoJSONFeature.properties = {
              _gx_style: styleName + styleNameText,
              name: nameFeature,
            };
            encodedFeatures.push(geoJSONFeature);
          }
        }
      }, this);

      if (style !== '') {
        style = JSON.parse(style.concat('}'));
      } else {
        style = {
          '*': {
            symbolizers: [],
          },
          version: '2',
        };
      }

      encodedLayer = {
        type: 'Vector',
        style,
        styleProperty: '_gx_style',
        geoJson: {
          type: 'FeatureCollection',
          features: encodedFeatures,
        },
        name: layerName,
        opacity: layerOpacity,
      };
    }
    return encodedLayer;
  }

  encodeMVT(layer) {
    let encodedLayer = null;
    let continuePrint = true;
    if (layer.getStyle() instanceof IDEE.style.Chart) {
      continuePrint = false;
    } else if (layer.getStyle() instanceof IDEE.style.Cluster
      && layer.getStyle().getOldStyle() instanceof IDEE.style.Chart) {
      continuePrint = false;
    }
    if (continuePrint) {
      const olLayer = layer.getImpl().getLayer();
      const features = layer.getFeatures();
      const layerName = layer.name;
      const layerOpacity = olLayer.getOpacity();
      const layerStyle = olLayer.getStyle();
      let bbox = this.facadeMap_.getBbox();
      bbox = [bbox.x.min, bbox.y.min, bbox.x.max, bbox.y.max];
      const resolution = this.facadeMap_.getMapImpl().getView().getResolution();
      const encodedFeatures = [];
      let nameFeature;
      let filter;
      let index = 1;
      let indexText = 1;
      let indexGeom = 1;
      let style = '';
      const stylesNames = {};
      const stylesNamesText = {};
      features.forEach((feature) => {
        const geometry = feature.getImpl().getOLFeature().getGeometry();
        let featureStyle;
        const fStyle = feature.getImpl().getOLFeature().getStyleFunction();
        if (!IDEE.utils.isNullOrEmpty(fStyle)) {
          featureStyle = fStyle;
        } else if (!IDEE.utils.isNullOrEmpty(layerStyle)) {
          featureStyle = layerStyle;
        }
        if (featureStyle instanceof Function) {
          featureStyle = featureStyle.call(
            featureStyle,
            feature.getImpl().getOLFeature(),
            resolution,
          );
        }
        let styleIcon = null;
        if (featureStyle instanceof Array) {
          if (featureStyle.length > 1) {
            styleIcon = !IDEE.utils.isNullOrEmpty(featureStyle[1])
              && !IDEE.utils.isNullOrEmpty(featureStyle[1].getImage())
              && featureStyle[1].getImage().getGlyph
              ? featureStyle[1].getImage() : null;
            featureStyle = (!IDEE.utils.isNullOrEmpty(featureStyle[1].getImage())
                && featureStyle[1].getImage().getSrc)
              ? featureStyle[1] : featureStyle[0];
          } else {
            featureStyle = featureStyle[0];
          }
        }
        if (!IDEE.utils.isNullOrEmpty(featureStyle)) {
          const image = featureStyle.getImage();
          const imgSize = IDEE.utils
            .isNullOrEmpty(image) ? [0, 0] : (image.getImageSize() || [24, 24]);
          let text = featureStyle.getText();
          if (IDEE.utils.isNullOrEmpty(text) && !IDEE.utils.isNullOrEmpty(featureStyle.textPath)) {
            text = featureStyle.textPath;
          }
          let parseType;
          if (geometry.getType().toLowerCase() === 'multipolygon') {
            parseType = 'polygon';
          } else if (geometry.getType().toLowerCase() === 'multipoint') {
            parseType = 'point';
          } else if (geometry.getType().toLowerCase() === 'multilinestring') {
            parseType = 'line';
          } else {
            parseType = geometry.getType().toLowerCase();
          }
          const stroke = IDEE.utils.isNullOrEmpty(image)
            ? featureStyle.getStroke() : (image.getStroke && image.getStroke());
          const fill = IDEE.utils.isNullOrEmpty(image)
            ? featureStyle.getFill() : (image.getFill && image.getFill());
          let styleText;
          const pointRadius = IDEE.utils.isNullOrEmpty(image) ? '' : (image.getRadius && image.getRadius());
          const styleGeom = {
            type: parseType,
            fillColor: IDEE.utils.isNullOrEmpty(fill) ? '#000000' : IDEE.utils.rgbaToHex(fill.getColor()).slice(0, 7),
            fillOpacity: IDEE.utils.isNullOrEmpty(fill)
              ? 0 : IDEE.utils.getOpacityFromRgba(fill.getColor()),
            strokeColor: IDEE.utils.isNullOrEmpty(stroke) ? '#000000' : IDEE.utils.rgbaToHex(stroke.getColor()),
            strokeOpacity: IDEE.utils.isNullOrEmpty(stroke)
              ? 0 : IDEE.utils.getOpacityFromRgba(stroke.getColor()),
            strokeWidth: IDEE.utils.isNullOrEmpty(stroke)
              ? 0 : (stroke.getWidth && stroke.getWidth()),
            pointRadius: IDEE.utils.isNullOrEmpty(image) ? '' : (image.getRadius && image.getRadius()),
            externalGraphic: IDEE.utils.isNullOrEmpty(image) ? '' : (image.getSrc && image.getSrc()),
            graphicHeight: imgSize[0],
            graphicWidth: imgSize[1],
          };
          if (Number.isNaN(pointRadius)) {
            styleGeom.fillOpacity = 0;
            styleGeom.strokeOpacity = 0;
            styleGeom.pointRadius = 0;
          }
          const imageIcon = !IDEE.utils.isNullOrEmpty(styleIcon)
            && styleIcon.getImage ? styleIcon.getImage() : null;
          if (!IDEE.utils.isNullOrEmpty(imageIcon)) {
            if (styleIcon.getRadius && styleIcon.getRadius()) {
              styleGeom.pointRadius = styleIcon.getRadius && styleIcon.getRadius();
            }
            if (styleIcon.getOpacity && styleIcon.getOpacity()) {
              styleGeom.graphicOpacity = styleIcon.getOpacity();
            }
            styleGeom.externalGraphic = imageIcon.toDataURL();
          }
          if (!IDEE.utils.isNullOrEmpty(text)) {
            let tAlign = text.getTextAlign();
            let tBLine = text.getTextBaseline();
            let align = '';
            if (!IDEE.utils.isNullOrEmpty(tAlign)) {
              if (tAlign === IDEE.style.align.LEFT) {
                tAlign = 'l';
              } else if (tAlign === IDEE.style.align.RIGHT) {
                tAlign = 'r';
              } else if (tAlign === IDEE.style.align.CENTER) {
                tAlign = 'c';
              } else {
                tAlign = '';
              }
            }
            if (!IDEE.utils.isNullOrEmpty(tBLine)) {
              if (tBLine === IDEE.style.baseline.BOTTOM) {
                tBLine = 'b';
              } else if (tBLine === IDEE.style.baseline.MIDDLE) {
                tBLine = 'm';
              } else if (tBLine === IDEE.style.baseline.TOP) {
                tBLine = 't';
              } else {
                tBLine = '';
              }
            }
            if (!IDEE.utils.isNullOrEmpty(tAlign) && !IDEE.utils.isNullOrEmpty(tBLine)) {
              align = tAlign.concat(tBLine);
            }
            const font = text.getFont();
            const fontWeight = !IDEE.utils.isNullOrEmpty(font) && font.indexOf('bold') > -1 ? 'bold' : 'normal';
            let fontSize = '11px';
            if (!IDEE.utils.isNullOrEmpty(font)) {
              const px = font.substr(0, font.indexOf('px'));
              if (!IDEE.utils.isNullOrEmpty(px)) {
                const space = px.lastIndexOf(' ');
                if (space > -1) {
                  fontSize = px.substr(space, px.length).trim().concat('px');
                } else {
                  fontSize = px.concat('px');
                }
              }
            }
            styleText = {
              type: 'text',
              label: text.getText() || '',
              fontColor: IDEE.utils.isNullOrEmpty(text.getFill()) ? '#000000' : IDEE.utils.rgbToHex(text.getFill().getColor()),
              fontSize,
              fontFamily: 'Helvetica, sans-serif',
              fontStyle: 'normal',
              fontWeight,
              conflictResolution: this.additionalOptsLabel_.conflictResolution,
              labelXOffset: text.getOffsetX(),
              labelYOffset: text.getOffsetY(),
              fillColor: styleGeom.fillColor || '#FF0000',
              fillOpacity: styleGeom.fillOpacity || 1,
              labelOutlineColor: IDEE.utils.isNullOrEmpty(text.getStroke()) ? '' : IDEE.utils.rgbToHex(text.getStroke().getColor() || '#FF0000'),
              labelOutlineWidth: IDEE.utils.isNullOrEmpty(text.getStroke()) ? '' : text.getStroke().getWidth(),
              labelAlign: align,
            };
            styleText = this.addAdditionalLabelOptions(styleText);
          }
          nameFeature = `draw${index}`;
          const extent = geometry.getExtent();
          if ((!IDEE.utils.isNullOrEmpty(geometry)
              && ol.extent.intersects(bbox, extent))
            || !IDEE.utils.isNullOrEmpty(text)) {
            const styleStr = JSON.stringify(styleGeom);
            const styleTextStr = JSON.stringify(styleText);
            let styleName = stylesNames[styleStr];
            let styleNameText = stylesNamesText[styleTextStr];
            if (IDEE.utils.isUndefined(styleName) || IDEE.utils.isUndefined(styleNameText)) {
              const symbolizers = [];
              let flag = 0;
              if (!IDEE.utils.isNullOrEmpty(geometry) && ol.extent.intersects(bbox, extent)
                && IDEE.utils.isUndefined(styleName)) {
                styleName = indexGeom;
                stylesNames[styleStr] = styleName;
                flag = 1;
                symbolizers.push(styleStr);
                indexGeom += 1;
                index += 1;
              }
              if (!IDEE.utils.isNullOrEmpty(text) && IDEE.utils.isUndefined(styleNameText)) {
                styleNameText = indexText;
                stylesNamesText[styleTextStr] = styleNameText;
                symbolizers.push(styleTextStr);
                indexText += 1;
                if (flag === 0) {
                  index += 1;
                  symbolizers.push(styleStr);
                }
              }
              if (styleName === undefined) {
                styleName = 0;
              }
              if (styleNameText === undefined) {
                styleNameText = 0;
              }
              filter = `"[_gx_style ='${styleName + styleNameText}']"`;
              if (!IDEE.utils.isNullOrEmpty(symbolizers)) {
                let a = ` ${filter}:{"symbolizers": [${symbolizers}]}`;
                if (layer.getStyle() instanceof IDEE.style.Proportional) {
                  const typeFeature = feature.getGeometry().getType().toLocaleLowerCase();
                  if (typeFeature.indexOf('polygon') >= 0) {
                    a = a.replace('polygon', 'point');
                  } else if (typeFeature.indexOf('line') >= 0) {
                    a = a.replace('line', 'point');
                  }
                }
                a = a.replace('linestring', 'line');
                if (style !== '') {
                  style += `,${a}`;
                } else {
                  style += `{${a},"version":"2"`;
                }
              }
            }
            let coordinates = geometry.getFlatCoordinates();
            coordinates = this.inflCoordArray(
              parseType,
              coordinates.slice(),
              0,
              geometry.getEnds(),
              2,
            );
            if (coordinates.length > 0) {
              const geoJSONFeature = {
                id: feature.getId(),
                type: 'Feature',
                geometry: {
                  type: geometry.getType(),
                  coordinates,
                },
              };
              geoJSONFeature.properties = {
                _gx_style: styleName + styleNameText,
                name: nameFeature,
              };
              encodedFeatures.push(geoJSONFeature);
            }
          }
        }
      }, this);
      if (style !== '') {
        style = JSON.parse(style.concat('}'));
      } else {
        style = {
          '*': {
            symbolizers: [],
          },
          version: '2',
        };
      }
      encodedLayer = {
        type: 'Vector',
        style,
        styleProperty: '_gx_style',
        geoJson: {
          type: 'FeatureCollection',
          features: encodedFeatures,
        },
        name: layerName,
        opacity: layerOpacity,
      };
    }
    return encodedLayer;
  }

  inflCoordinates(flatCoordinates, offset, end, stride, optCoordinates) {
    const coordinates = optCoordinates !== undefined ? optCoordinates : [];
    let i = 0;
    for (let j = offset; j < end; j += stride) {
      // eslint-disable-next-line no-plusplus
      coordinates[i++] = flatCoordinates.slice(j, j + stride);
    }
    coordinates.length = i;
    return coordinates;
  }

  inflCoordArray(parseType, flatCoordinates, offset, ends, stride, optCoordinatess) {
    let coordinatess = optCoordinatess !== undefined ? optCoordinatess : [];
    let i = 0;
    // eslint-disable-next-line no-plusplus
    for (let j = 0, jj = ends.length; j < jj; ++j) {
      const end = ends[j];
      const arrtmp = this.inflCoordinates(
        flatCoordinates,
        offset,
        end,
        stride,
        coordinatess[i],
      );
      if (parseType === 'point' || ((parseType === 'line' || parseType === 'linestring') && arrtmp.length >= 2) || (parseType === 'polygon' && arrtmp.length > 3)) {
        // eslint-disable-next-line no-plusplus
        coordinatess[i++] = arrtmp;
      }
      // eslint-disable-next-line no-param-reassign
      offset = end;
    }
    coordinatess.length = i;
    if ((parseType === 'line' || parseType === 'linestring') && coordinatess.length === 1) {
      // eslint-disable-next-line no-plusplus
      coordinatess = coordinatess[0];
    }
    return coordinatess;
  }

  inflateMultiCoordinatesArray(flatCoordinates, offset, endss, stride, optCoordinatesss) {
    const coordinatesss = optCoordinatesss !== undefined ? optCoordinatesss : [];
    let i = 0;
    // eslint-disable-next-line no-plusplus
    for (let j = 0, jj = endss.length; j < jj; ++j) {
      const ends = endss[j];
      // eslint-disable-next-line no-plusplus
      coordinatesss[i++] = this.inflCoordArray(
        flatCoordinates,
        offset,
        ends,
        stride,
        coordinatesss[i],
      );
      // eslint-disable-next-line no-param-reassign
      offset = ends[ends.length - 1];
    }
    coordinatesss.length = i;
    return coordinatesss;
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeWMTS(layer) {
    const zoom = this.facadeMap_.getZoom();
    const layerImpl = layer.getImpl();
    const olLayer = layerImpl.getLayer();
    const layerSource = olLayer.getSource();
    const tileGrid = layerSource.getTileGrid();
    const style = !IDEE.utils.isNullOrEmpty(layerSource.getStyle) ? layerSource.getStyle() : 'default';

    let layerUrl = layer.url;
    const layerName = layer.name;
    const layerOpacity = olLayer.getOpacity();
    const layerReqEncoding = layerSource.getRequestEncoding();
    const tiled = layerImpl.tiled;
    const layerExtent = olLayer.getExtent();
    const params = {};
    const matrixSet = layerSource.getMatrixSet();
    const tileSize = tileGrid.getTileSize(zoom);
    const resolutions = tileGrid.getResolutions();

    /** Ticket */
    if (IDEE.config.ticket != null && layerUrl.indexOf('&ticket') === -1) {
      layerUrl = IDEE.utils.addParameters(layerUrl, `ticket=${IDEE.config.ticket}`);
    }

    /**
     * @see http: //www.mapfish.org/doc/print/protocol.html#layers-params
     */
    return layer.getImpl().getCapabilities().then((capabilities) => {
      const matrixIdsObj = capabilities.Contents.TileMatrixSet.filter((tileMatrixSet) => {
        return (tileMatrixSet.Identifier === matrixSet);
      })[0];
      return {
        baseURL: layerUrl,
        opacity: layerOpacity,
        singleTile: !tiled,
        type: 'WMTS',
        layer: layerName,
        requestEncoding: layerReqEncoding,
        tileSize,
        style: !IDEE.utils.isNullOrEmpty(style) ? style : 'default',
        rotation: 0,
        imageFormat: 'image/png',
        dimensionParams: {},
        dimensions: [],
        params,
        version: '1.0.0',
        maxExtent: layerExtent,
        matrixSet,
        matrices: matrixIdsObj.TileMatrix.map((tileMatrix, i) => {
          return {
            identifier: tileMatrix.Identifier,
            matrixSize: [tileMatrix.MatrixWidth, tileMatrix.MatrixHeight],
            scaleDenominator: tileMatrix.ScaleDenominator,
            tileSize: [tileMatrix.TileWidth, tileMatrix.TileHeight],
            topLeftCorner: tileMatrix.TopLeftCorner,
          };
        }),
        resolutions,
      };
    });
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeOSM(layer) {
    let encodedLayer = null;

    const layerImpl = layer.getImpl();
    const olLayer = layerImpl.getLayer();
    const layerSource = olLayer.getSource();
    const tileGrid = layerSource.getTileGrid();

    const layerUrl = layer.url || 'http://tile.openstreetmap.org/';
    const layerName = layer.name;
    const layerOpacity = olLayer.getOpacity();
    const tiled = layerImpl.tiled;
    const layerExtent = tileGrid.getExtent();
    const tileSize = tileGrid.getTileSize();
    const resolutions = tileGrid.getResolutions();
    encodedLayer = {
      baseURL: layerUrl,
      opacity: layerOpacity,
      singleTile: !tiled,
      layer: layerName,
      maxExtent: layerExtent,
      tileSize: [tileSize, tileSize],
      resolutions,
      type: 'OSM',
      imageExtension: 'png',
    };
    return encodedLayer;
  }

  /**
   * This function adds the control to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the plugin
   * @param {function} template template of this control
   * @api stable
   */
  encodeMapbox(layer) {
    let encodedLayer = null;

    const layerImpl = layer.getImpl();
    const olLayer = layerImpl.getLayer();
    const layerSource = olLayer.getSource();
    const tileGrid = layerSource.getTileGrid();

    const layerUrl = IDEE.utils.concatUrlPaths([IDEE.config.MAPBOX_URL, layer.name]);
    const layerOpacity = olLayer.getOpacity();
    const layerExtent = tileGrid.getExtent();

    const tileSize = tileGrid.getTileSize();
    const resolutions = tileGrid.getResolutions();

    const customParams = {};
    customParams[IDEE.config.MAPBOX_TOKEN_NAME] = IDEE.config.MAPBOX_TOKEN_VALUE;
    encodedLayer = {
      opacity: layerOpacity,
      baseURL: layerUrl,
      customParams,
      maxExtent: layerExtent,
      tileSize: [tileSize, tileSize],
      resolutions,
      extension: IDEE.config.MAPBOX_EXTENSION,
      type: 'osm',
      path_format: '/${z}/${x}/${y}.png',
    };

    return encodedLayer;
  }

  transformExt(box, code, currProj) {
    return ol.proj.transformExtent(box, code, currProj);
  }

  /**
   * This function adds new parameters
   * for labels
   *
   * @public
   * @function
   * @param { Object } styleText style defined
   * for the label
   * @api stable
   */
  addAdditionalLabelOptions(styleText) {
    const auxStyleText = styleText;

    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.allowOverruns)) {
      auxStyleText.allowOverruns = this.additionalOptsLabel_.allowOverruns;
    }
    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.autoWrap)) {
      auxStyleText.autoWrap = this.additionalOptsLabel_.autoWrap;
    }
    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.followLine)) {
      auxStyleText.followLine = this.additionalOptsLabel_.followLine;
    }
    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.goodnessOfFit)) {
      auxStyleText.goodnessOfFit = this.additionalOptsLabel_.goodnessOfFit;
    }
    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.group)) {
      auxStyleText.group = this.additionalOptsLabel_.group;
    }
    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.maxDisplacement)) {
      auxStyleText.maxDisplacement = this.additionalOptsLabel_.maxDisplacement;
    }
    if (!IDEE.utils.isNullOrEmpty(this.additionalOptsLabel_.spaceAround)) {
      auxStyleText.spaceAround = this.additionalOptsLabel_.spaceAround;
    }

    return auxStyleText;
  }

  /**
   * This function assigns value to goodnessOfFit
   *
   * @public
   * @function
   * @param { Decimal } value value to goodnessOfFit param for label
   * for the label
   * @api stable
   */
  setGoodnessOfFit(value) {
    this.additionalOptsLabel_.goodnessOfFit = value;
  }

  /**
   * This function destroys this control, clearing the HTML
   * and unregistering all events
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    this.facadeMap_.getMapImpl().removeControl(this);
    this.facadeMap_ = null;
  }
}
