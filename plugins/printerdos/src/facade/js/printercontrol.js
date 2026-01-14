/**
 * @module IDEE/control/PrinterControl
 */
/* eslint-disable no-underscore-dangle */
import PrinterControlImpl from '../../impl/ol/js/printercontrol';
import printerHTML from '../../templates/printer.html';

/**
 * Time in secods
 * @const
 */
const DEFAULT_CONNECTION_TIMEOUT = 15;
const NO_LOAD_TITLE = 'Error de conexión';
const NO_LOAD_MSG = 'No se ha podido conectar con el servicio de impresión';
const LOADING_TITLE = 'Servicio cargando';
const LOADING_MSG = 'El servicio aún no ha cargado';

export default class PrinterControl extends IDEE.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a WMCSelector
   * control to provides a way to select an specific WMC
   *
   * @constructor
   * @extends {IDEE.Control}
   * @api stable
   */

  constructor(url, params, options) {
    // implementation of this control
    const impl = new PrinterControlImpl(options);

    super(impl, PrinterControl.NAME);

    // checks if the implementation can manage this control
    if (IDEE.utils.isUndefined(PrinterControlImpl)) {
      IDEE.exception('La implementación usada no puede crear controles Printer');
    }

    if (IDEE.utils.isUndefined(PrinterControlImpl.prototype.encodeLayer)) {
      IDEE.exception('La implementación usada no posee el método encodeLayer');
    }

    if (IDEE.utils.isUndefined(PrinterControlImpl.prototype.encodeLegend)) {
      IDEE.exception('La implementación usada no posee el método encodeLegend');
    }

    if (IDEE.utils.isUndefined(IDEE.config.geoprint)) {
      IDEE.config('geoprint', {
        'URL': 'https://geoprint-sigc.juntadeandalucia.es/geoprint/pdf',
        'DPI': 120,
        'FORMAT': 'pdf',
        'TEMPLATE': 'A4 landscape (SIGC)',
        'FORCE_SCALE': false,
        'LEGEND': true,
      });
    }

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.url_ = url;

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.ref_ = null;

    /**
     * Facade of the map
     * Este atributo se pone a true cuando se está realizando la impresión
     * Se pone a false cuando le damos al botón de cancelar impresión
     * @private
     * @type {IDEE.Map}
     */
    this.printing_ = false;

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.inputTitle_ = null;

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.areaDescription_ = null;

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.layout_ = null;

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.format_ = null;

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.dpi_ = null;

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.forceScale_ = null;

    /**
     * Text wrap for labels
     * @private
     * @type {Decimal}
     */
    this.textWrap_ = null;

    /**
     * Facade of the map
     * @private
     * @type {Promise}
     */
    this.params_ = params || {};

    /**
     * Facade of the map
     * @private
     * @type {HTMLElement}
     */
    this.queueContainer_ = null;

    /**
     * Facade of the map
     * @private
     * @type {Promise}
     */
    this.capabilitiesPromise_ = null;

    /**
     * Connection timeout in seconds
     * @private
     * @type {number}
     */
    this.connectionTimeout_ = options.connectionTimeout || DEFAULT_CONNECTION_TIMEOUT;

    /**
     * Flag loading service
     * @private
     * @type {bool}
     */
    this.loadingService = true;

    /**
     * Flag error service
     * @private
     * @type {bool}
     */
    this.errorService = false;

    /**
     * Output formats
     * @private
     * @type {array<string>}
     */
    this.outputFormats_ = Array.isArray(options.outputFormats)
      ? options.outputFormats : ['pdf', 'png', 'jpg'];

    /**
     * Facade of the map
     * @private
     * @type {IDEE.Map}
     */
    this.options_ = options || {};
    // gets default values
    // layout
    if (IDEE.utils.isNullOrEmpty(this.options_.layout)) {
      this.options_.layout = IDEE.config.geoprint.TEMPLATE;
    }
    // dpi
    if (IDEE.utils.isNullOrEmpty(this.options_.dpi)) {
      this.options_.dpi = IDEE.config.geoprint.DPI;
    }
    // format
    if (IDEE.utils.isNullOrEmpty(this.options_.format)) {
      this.options_.format = IDEE.config.geoprint.FORMAT;
    }
    // force scale
    if (IDEE.utils.isNullOrEmpty(this.options_.forceScale)) {
      this.options_.forceScale = IDEE.config.geoprint.FORCE_SCALE;
    }
    // legend
    if (IDEE.utils.isNullOrEmpty(this.options_.legend)) {
      this.options_.legend = IDEE.config.geoprint.LEGEND;
    }
    // text wrap
    if (IDEE.utils.isNullOrEmpty(this.options_.labeling)) {
      this.options_.labeling = {
        goodnessOfFit: 0.9,
      };
    } else if (IDEE.utils.isNullOrEmpty(this.options_.labeling.goodnessOfFit)) {
      this.options_.labeling.goodnessOfFit = 0.9;
    }
  }

  /**
   * Este método sirve para comprobar el estado de la impresión del mapa.
   * Se envía la petición cada 1 segundo.
   * @param {*} url es la url que se le envía a la petición get para
   * comprobar el estado de la impresión
   * @param {*} callback quita el icono LOADING
   */
  getStatus(url, callback) {
    IDEE.remote.get(url).then((response) => {
      const statusJson = JSON.parse(response.text);
      const { status } = statusJson;
      if (status === 'finished') {
        callback();
      } else if (status === 'error') {
        callback();
        IDEE.dialog.error('Se ha producido un error en la impresión');
      } else if (this.printing_ === false) {
        IDEE.dialog.error('Se ha cancelado la impresión');

        this.queueContainer_.lastChild.remove();
      } else {
        setTimeout(() => this.getStatus(url, callback), 1000);
      }
    });
  }

  open() {
    if (this.loadingService) {
      IDEE.dialog.error(LOADING_MSG, LOADING_TITLE);
    } else if (this.errorService) {
      IDEE.dialog.error(NO_LOAD_MSG, NO_LOAD_TITLE);
    } else {
      const html = this.getPanel().getTemplatePanel();
      const buttonPanel = this.getPanel().getButtonPanel();
      html.classList.remove('collapsed');
      buttonPanel.classList.remove('g-cartografia-impresora');
      html.classList.add('opened');
      buttonPanel.classList.add('g-cartografia-flecha-derecha');
      this.getPanel().setCollapsed(false);
      this.getPanel().fire(IDEE.evt.SHOW);
    }
  }

  /**
   * This function creates the view to the specified map.
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the control
   * @api stabletrue
   */
  createView(map) {
    this.getPanel().open = this.open.bind(this);
    const promise = new Promise((success, fail) => {
      this.getCapabilities().then((capabilitiesParam) => {
        const capabilities = capabilitiesParam;
        let i = 0;
        let ilen;
        // default layout
        capabilities.layouts = capabilities.layouts.filter((l) => {
          return !l.name.endsWith('jpg');
        });
        for (i = 0, ilen = capabilities.layouts.length; i < ilen; i += 1) {
          const layout = capabilities.layouts[i];
          if (layout.name === this.options_.layout) {
            layout.default = true;
            break;
          }
        }
        capabilities.dpis = [];
        let attribute;
        // default dpi
        // este for busca qué atributo tiene la lista de los DPI recomendados
        for (i = 0, ilen = capabilities.layouts[0].attributes.length; i < ilen; i += 1) {
          if (capabilities.layouts[0].attributes[i].clientInfo != null) {
            attribute = capabilities.layouts[0].attributes[i];
          }
        }
        for (i = 0, ilen = attribute.clientInfo.dpiSuggestions.length; i < ilen; i += 1) {
          const dpi = attribute.clientInfo.dpiSuggestions[i];
          const object = { value: dpi };
          if (dpi === this.options_.dpi) {
            object.default = true;
          }
          capabilities.dpis.push(object);
        }

        // default outputFormat
        if (Array.isArray(capabilities.formats)) {
          this.outputFormats_ = capabilities.formats;
        }
        capabilities.format = this.outputFormats_.map((format) => {
          const obj = { name: format };
          if (format === this.options_.format) {
            obj.default = true;
          }
          return obj;
        });

        if (!IDEE.template.compileSync) { // JGL: retrocompatibilidad Mapea4
          IDEE.template.compileSync = (string, options) => {
            let templateCompiled;
            let templateVars = {};
            let parseToHtml;
            if (!IDEE.utils.isUndefined(options)) {
              templateVars = IDEE.utils.extends(templateVars, options.vars);
              parseToHtml = options.parseToHtml;
            }
            const templateFn = Handlebars.compile(string);
            const htmlText = templateFn(templateVars);
            if (parseToHtml !== false) {
              templateCompiled = IDEE.utils.stringToHtml(htmlText);
            } else {
              templateCompiled = htmlText;
            }
            return templateCompiled;
          };
        }

        // forceScale
        capabilities.forceScale = this.options_.forceScale;
        // textWrap
        capabilities.textWrap = this.options_.labeling.goodnessOfFit;
        const html = IDEE.template.compileSync(printerHTML, { jsonp: true, vars: capabilities });
        this.addEvents(html);
        this.loadingService = false;
        success(html);
      }).catch((e) => {
        this.loadingService = false;
        this.errorService = true;
        IDEE.dialog.error(NO_LOAD_MSG, NO_LOAD_TITLE);
      });
    });
    return promise;
  }

  /**
   * This function creates the view to the specified map
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the control
   * @api stable
   */
  addEvents(html) {
    this.element_ = html;

    // title
    this.inputTitle_ = this.element_.querySelector('.form div.title > input');

    // description
    this.areaDescription_ = this.element_.querySelector('.form div.description > textarea');

    // layout
    const selectLayout = this.element_.querySelector('.form div.layout > select');
    selectLayout.addEventListener('change', (event) => {
      const layoutValue = selectLayout.value;
      this.setLayout({
        value: layoutValue,
        name: layoutValue,
      });
    });

    const layoutValue = selectLayout.value;
    this.setLayout({
      value: layoutValue,
      name: layoutValue,
    });

    // dpi
    const selectDpi = this.element_.querySelector('.form div.dpi > select');
    selectDpi.addEventListener('change', (event) => {
      const dpiValue = selectDpi.value;
      this.setDpi({
        value: dpiValue,
        name: dpiValue,
      });
    });

    const dpiValue = selectDpi.value;
    this.setDpi({
      value: dpiValue,
      name: dpiValue,
    });

    // format
    const selectFormat = this.element_.querySelector('.form div.format > select');
    selectFormat.addEventListener('change', (event) => {
      this.setFormat(selectFormat.value);
    });
    this.setFormat(selectFormat.value);

    // force scale
    const checkboxForceScale = this.element_.querySelector('.form div.forcescale > input');
    checkboxForceScale.addEventListener('click', (event) => {
      this.setForceScale(checkboxForceScale.checked === true);
    });
    this.setForceScale(checkboxForceScale.checked === true);

    // text wrap
    const inputTextWrap = this.element_.querySelector('.form div.textwrap > input');
    inputTextWrap.addEventListener('change', (event) => {
      this.setTextWrap(parseFloat(inputTextWrap.value));
    });

    // print button
    const printBtn = this.element_.querySelector('.button > button.print');
    printBtn.addEventListener('click', this.printClick_.bind(this));

    // cancel button
    const cancelBtn = this.element_.querySelector('.button > button.cancel');
    cancelBtn.addEventListener('click', this.cancelClick_.bind(this));

    // clean button
    const cleanBtn = this.element_.querySelector('.button > button.remove');
    cleanBtn.addEventListener('click', (event) => {
      event.preventDefault();

      // resets values
      this.inputTitle_.value = '';
      this.areaDescription_.value = '';
      selectLayout.value = this.options_.layout;
      selectDpi.value = this.options_.dpi;
      selectFormat.value = this.options_.format;
      checkboxForceScale.checked = this.options_.forceScale;
      inputTextWrap.value = this.options_.labeling.textWrap;

      // Create events and init
      const changeEvent = document.createEvent('HTMLEvents');
      changeEvent.initEvent('change');
      const clickEvent = document.createEvent('HTMLEvents');
      // Fire listeners
      clickEvent.initEvent('click');
      selectLayout.dispatchEvent(changeEvent);
      selectDpi.dispatchEvent(changeEvent);
      selectFormat.dispatchEvent(changeEvent);
      checkboxForceScale.dispatchEvent(clickEvent);
      inputTextWrap.dispatchEvent(changeEvent);

      // clean queue
      Array.prototype.forEach.apply(this.queueContainer_.children, [(child) => {
        // unlisten events
        child.removeEventListener('click', this.dowloadPrint);
      }, this]);

      this.queueContainer_.innerHTML = '';
    });

    // queue
    this.queueContainer_ = this.element_.querySelector('.queue > ul.queue-container');
    IDEE.utils.enableTouchScroll(this.queueContainer_);
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  setLayout(layout) {
    this.layout_ = layout;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  setFormat(format) {
    this.format_ = format;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  setDpi(dpi) {
    this.dpi_ = dpi;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  setForceScale(forceScale) {
    this.forceScale_ = forceScale;
  }

  /**
   * This function set text wrap
   *
   * @private
   * @function
   */
  setTextWrap(textWrap) {
    this.textwrap_ = textWrap;
    this.getImpl().setGoodnessOfFit(textWrap);
    const template = this.getPanel().getTemplatePanel();
    const label = template.querySelector('#label');
    const input = template.querySelector('#inputRange');
    label.innerHTML = input.value;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  printClick_(evt) {
    evt.preventDefault();

    this.getPrintData().then((printData) => {
      let printUrl = IDEE.utils.concatUrlPaths([this.url_, `report.${printData.outputFormat}`]);

      // append child
      const queueEl = this.createQueueElement();
      this.queueContainer_.appendChild(queueEl);
      queueEl.classList.add(PrinterControl.LOADING_CLASS);
      printUrl = IDEE.utils.addParameters(printUrl, 'mapeaop=geoprint');
      // IDEE.proxy(false);
      IDEE.remote.post(printUrl, printData).then((responseParam) => {
        let response = responseParam;
        const responseStatusURL = JSON.parse(response.text);
        this.ref_ = responseStatusURL.ref;
        const statusURL = IDEE.utils.concatUrlPaths([this.params_.urlApplication, 'print/status', `${this.ref_}.json`]);
        // Borra el símbolo loading cuando ha terminado la impresión del mapa,
        // o borra el botón de la impresión si se ha cancelado
        this.printing_ = true;
        this.getStatus(statusURL, () => queueEl.classList.remove(PrinterControl.LOADING_CLASS));

        if (response.code === 200) {
          let downloadUrl;
          try {
            response = JSON.parse(response.text);
            // poner la url en una variable
            const serverId = response.downloadURL.split('@')[1];
            const url = response.downloadURL.substring(response.downloadURL.indexOf('/print'), response.downloadURL.length);
            downloadUrl = IDEE.utils.concatUrlPaths([this.params_.urlApplication, `${url};GEOPRID=.${serverId}`]);
          } catch (err) {
            IDEE.exception(err);
          }
          // sets the download URL
          queueEl.setAttribute(PrinterControl.DOWNLOAD_ATTR_NAME, downloadUrl);
          queueEl.addEventListener('click', this.dowloadPrint);
        } else {
          IDEE.dialog.error('Se ha producido un error en la impresión');
        }
      });
    });
  }

  /**
   * Cancela la petición de impresión.
   * De momento no se puede hacer una petición Delete con Mapea,
   * simplemente se deja de preguntar por la impresión y se borra el contenedor de la misma.
   * @public
   * @function
   * @param {IDEE.Map} map to add the control
   * @api stable
   */
  cancelClick_(evt) {
    evt.preventDefault();
    this.printing_ = false;
    // TODO: Pendiente de hacer peticiones DELETE.
  }

  /**
   * Obtiene el capabilities (.yaml)
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the control
   * @api stable
   */
  getCapabilities() {
    if (IDEE.utils.isNullOrEmpty(this.capabilitiesPromise_)) {
      this.capabilitiesPromise_ = new Promise((success, fail) => {
        setTimeout(() => {
          const err = new Error('CONNECTION TIMEOUT');
          fail(err);
        }, this.connectionTimeout_ * 1000);
        const capabilitiesUrl = IDEE.utils.concatUrlPaths([this.url_, 'capabilities.json']);
        IDEE.remote.get(capabilitiesUrl).then((response) => {
          let capabilities = {};
          try {
            capabilities = JSON.parse(response.text);
          } catch (err) {
            IDEE.exception(err);
          }
          success(capabilities);
        });
      });
    }
    return this.capabilitiesPromise_;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  getPrintData() {
    const title = this.inputTitle_.value;
    const description = this.areaDescription_.value;
    const projection = this.map_.getProjection().code;
    let layout = this.layout_.name;
    const dpi = this.dpi_.value;
    const outputFormat = this.format_;
    const center = this.map_.getCenter();
    const parameters = this.params_.parameters;
    const legend = this.options_.legend;

    // Al elegir el formato jpg, cambiamos la plantilla por su copia
    // para poder imprimir en este formato
    if (outputFormat === 'jpg') {
      layout += ' jpg';
    }

    const printData = IDEE.utils.extend({
      layout,
      outputFormat,
      attributes: {
        title,
        description,
        epsg: projection,
        map: {
          useAdjustBounds: true,
          projection,
          dpi,
        },
      },
    }, this.params_.layout);

    return this.encodeLayers().then((encodedLayers) => {
      printData.attributes.map.layers = encodedLayers;
      printData.attributes = Object.assign(printData.attributes, parameters);
      // Se añade la leyenda
      if (legend) {
        const legends = [];
        const leyenda = this.encodeLegends();
        for (let i = 0, ilen = leyenda.length; i < ilen; i += 1) {
          if (!IDEE.utils.isNullOrEmpty(leyenda[i].classes[0])) {
            const a = {
              name: leyenda[i].classes[0].name,
              icons: leyenda[i].classes[0].icons,
            };
            legends.push(a);
          }
        }
        printData.attributes.legend = {
          classes: legends,
        };
      }

      if (projection !== 'EPSG:3857' && this.map_.getLayers().some((layer) => (layer.type === IDEE.layer.type.OSM || layer.type === IDEE.layer.type.Mapbox))) {
        printData.attributes.map.projection = 'EPSG:3857';
      }
      if (this.forceScale_ === false) {
        const bbox = this.map_.getBbox();
        printData.attributes.map.bbox = [bbox.x.min, bbox.y.min, bbox.x.max, bbox.y.max];
        if (projection !== 'EPSG:3857' && this.map_.getLayers().some((layer) => (layer.type === IDEE.layer.type.OSM || layer.type === IDEE.layer.type.Mapbox))) {
          printData.attributes.map.bbox = this.getImpl().transformExt(printData.attributes.map.bbox, projection, 'EPSG:3857');
        }
      } else if (this.forceScale_ === true) {
        printData.attributes.map.center = [center.x, center.y];
        printData.attributes.map.scale = this.map_.getScale();
      }
      return printData;
    });
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  encodeLayers() {
    const layers = this.map_.getLayers().filter((layer) => {
      return ((layer.isVisible() === true) && (layer.inRange() === true)
        && IDEE.utils.isString(layer.name) && !layer.name.startsWith('cluster_cover'));
    });

    return (new Promise((success, fail) => {
      const encodedLayers = [];
      const promises = layers.map((layer, index) => {
        return this.getImpl().encodeLayer(layer).then((encodedLayer) => {
          // añade la capa y comprueba si es vector. Las capas que sean vector
          // tienen que quedar en último lugar para que no sean tapadas
          if (!IDEE.utils.isNullOrEmpty(encodedLayer) && encodedLayer.type !== 'Vector') {
            encodedLayers[index] = encodedLayer;
          } else {
            // Se comprueba que las capas vectoriales estén en el rango del mapa.
            const resolution = this.map_.getMapImpl().getView().getResolution();
            const maxResolution = layer.getImpl().getOL3Layer().getMaxResolution();
            const minResolution = layer.getImpl().getOL3Layer().getMinResolution();
            if (((resolution >= minResolution) && (resolution <= maxResolution))) {
              encodedLayers[index] = encodedLayer;
            }
          }
        });
      });
      // Use Promise.all to wait for all the promises to resolve
      Promise.all(promises)
        .then(() => {
        // Once all promises are resolved, reverse the order and resolve the main promise

          // se usa reverse() para invertir el orden de las capas, así la capa base queda abajo
          // y se visualiza el mapa correctamente.
          success(encodedLayers.filter((layer) => layer !== undefined).reverse());
        })
        .catch(fail); // Handle any errors that occur during the encoding process
    }));
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @private
   * @function
   */
  encodeLegends() {
    const encodedLegends = [];

    const layers = this.map_.getLayers();
    layers.forEach((layer) => {
      if ((layer.isVisible() === true) && (layer.inRange() === true)) {
        const encodedLegend = this.getImpl().encodeLegend(layer);
        if (encodedLegend !== null) {
          encodedLegends.push(encodedLegend);
        }
      }
    }, this);
    return encodedLegends;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @public
   * @function
   * @api stable
   */
  createQueueElement() {
    const queueElem = document.createElement('li');
    let title = this.inputTitle_.value;
    if (IDEE.utils.isNullOrEmpty(title)) {
      title = PrinterControl.NO_TITLE;
    }
    queueElem.innerHTML = title;
    return queueElem;
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @public
   * @function
   * @api stable
   */
  dowloadPrint(event) {
    event.preventDefault();

    const downloadUrl = this.getAttribute(PrinterControl.DOWNLOAD_ATTR_NAME);
    if (!IDEE.utils.isNullOrEmpty(downloadUrl)) {
      window.open(downloadUrl, '_blank');
    }
  }

  /**
   * This function checks if an object is equals
   * to this control
   *
   * @function
   * @api stable
   */
  equals(obj) {
    let equals = false;
    if (obj instanceof PrinterControl) {
      equals = (this.name === obj.name);
    }
    return equals;
  }
}

/**
 * Name for this controls
 * @const
 * @type {string}
 * @public
 * @api stable
 */
PrinterControl.NAME = 'printercontrol';

/**
 * IDEE.template for this controls
 * @const
 * @type {string}
 * @public
 * @api stable
 */
PrinterControl.TEMPLATE = 'printer.html';

/**
 * IDEE.template for this controls
 * @const
 * @type {string}
 * @public
 * @api stable
 */
PrinterControl.LOADING_CLASS = 'printing';

/**
 * IDEE.template for this controls
 * @const
 * @type {string}
 * @public
 * @api stable
 */
PrinterControl.DOWNLOAD_ATTR_NAME = 'data-donwload-url-print';

/**
 * IDEE.template for this controls
 * @const
 * @type {string}
 * @public
 * @api stable
 */
PrinterControl.NO_TITLE = '(Sin título)';
