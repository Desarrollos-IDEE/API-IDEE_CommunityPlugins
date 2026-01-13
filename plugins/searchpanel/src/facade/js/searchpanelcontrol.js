/**
 * @module M/control/SearchpanelControl
 */

import SearchpanelImplControl from 'impl/searchpanelcontrol';
import template from 'templates/searchpanel';

export default class SearchpanelControl extends IDEE.Control {
  /**
   * @classdesc
   * Main constructor of the class. Creates a PluginControl
   * control
   *
   * @constructor
   * @extends {IDEE.Control}
   * @api stable
   */
  constructor(config) {
    // 1. checks if the implementation can create PluginControl
    if (IDEE.utils.isUndefined(SearchpanelImplControl)) {
      IDEE.exception('La implementación usada no puede crear controles SearchpanelControl');
    }
    // 2. implementation of this control
    const impl = new SearchpanelImplControl();
    super(impl, 'Searchpanel');
    this.config = config;
    this.maxResults = this.config.maxResults;
    this.title = this.config.title;
    this.fields = this.config.fields;
    this.infofields = this.config.infoFields;
    this.geosearchUrl = `${this.config.geosearchUrl}q=`;
    this.otherParameters = `&rows=${this.maxResults}&start=0&srs=EPSG%3A25830`;
    this.maxRecordsPage = 8;
    this.totalRecords = null;
    this.pageNumber = 1;
    this.pageTotal = null;
    this.dataList = [];
    this.capaGeoJSON = null;
    this.wktFormatter = new ol.format.WKT();
    this.selectedFeatures = null;
    this.arrayFeaturesMapeaGeoJSON = null;

    this.stylePoint = new IDEE.style.Point({
      radius: 5,
      fill: {
        color: '#00796b',
        opacity: 0.7,
      },
      stroke: {
        color: '#00796b',
      },
    });
    this.stylePolygon = new IDEE.style.Polygon({
      radius: 5,
      fill: {
        color: '#00796b',
        opacity: 0.7,
      },
      stroke: {
        color: '#00796b',
      },
    });

    this.styleLine = new IDEE.style.Line({
      radius: 5,
      fill: {
        color: '#00796b',
        opacity: 0.7,
      },
      stroke: {
        color: '#00796b',
      },
    });
  }

  /**
   * This function creates the view
   *
   * @public
   * @function
   * @param {IDEE.Map} map to add the control
   * @api stable
   */
  createView(map) {
    const templateVars = { vars: { title: this.title, fields: this.fields } };

    return new Promise((success, fail) => {
      const html = IDEE.template.compileSync(template, templateVars);
      this.element = html;
      this.addEvents(html, this.fields);
      success(html);
    });
  }

  /**
   * This function is called on the control activation
   *
   * @public
   * @function
   * @api stable
   */
  activate() {
    // calls super to manage de/activation
    super.activate();
    this.getImpl().activate(this.map_);
  }

  /**
   * This function is called on the control deactivation
   *
   * @public
   * @function
   * @api stable
   */
  deactivate() {
    // calls super to manage de/activation
    super.deactivate();
    this.getImpl().deactivate(this.map_);
  }

  /**
   * This function gets activation button
   *
   * @public
   * @function
   * @param {HTML} html of control
   * @api stable
   */
  getActivationButton(html) {
    return html.querySelector('.m-searchpanel button');
  }

  /**
   * This function compares controls
   *
   * @public
   * @function
   * @param {IDEE.Control} control to compare
   * @api stable
   */
  equals(control) {
    return control instanceof SearchpanelControl;
  }

  // Add your own functions

  addEvents(html) {
    // Query Selector
    this.loadButton = html.querySelector('button#m-searchpanel-loadButton');
    this.clearButton = html.querySelector('button#m-searchpanel-clearButton');
    this.searchOptions = html.querySelectorAll('input[type=text]');
    this.searchPanel = html.querySelector('div#m-searchpanel-content');
    this.resultPanel = html.querySelector('div#m-searchpanel-result-content');
    this.results = html.querySelector('div#results');
    this.resultPagination = html.querySelector('div#m-searchpanel-result-pagination');
    this.previusPage = html.querySelector('td#previusPage');
    this.nextPage = html.querySelector('td#nextPage');
    this.recordsTotal = html.querySelector('span#recordsTotal');
    this.recordsNumber = html.querySelector('span#recordsNumber');

    // Add Event Listener
    this.loadButton.addEventListener('click', () => this.load());
    this.clearButton.addEventListener('click', () => this.clear());
    this.previusPage.addEventListener('click', () => this.showPreviusPage());
    this.nextPage.addEventListener('click', () => this.showNextPage());
    // listener para input textbox
    for (let i = 0; i < this.searchOptions.length; i += 1) {
      this.searchOptions[i].addEventListener('change', () => this.enableButtons(html));
    }
    this.results.addEventListener('click', (event) => {
      this.map_.removeLayers(this.capaGeoJSON);
      this.selectedFeatures = [];
      const record = event.target.closest('table');
      let find = false;
      do {
        for (let i = 0; i < this.arrayFeaturesMapeaGeoJSON.length; i += 1) {
          if (this.arrayFeaturesMapeaGeoJSON[i].id === record.id) {
            this.selectedFeatures.push(this.arrayFeaturesMapeaGeoJSON[i]);
            find = true;
          }
        }
      } while (!find);

      const style = this.setStyle(this.selectedFeatures[0].geometry.type);

      this.capaGeoJSON = new IDEE.layer.GeoJSON({
        extract: false,
        source: {
          crs: { properties: { name: 'EPSG:25830' }, type: 'name' },
          features: this.selectedFeatures,
          type: 'FeatureCollection',
        },
        name: 'result',
      });
      this.capaGeoJSON.setStyle(style);
      this.map_.addLayers(this.capaGeoJSON);
      this.capaGeoJSON.displayInLayerSwitcher = false;
      this.capaGeoJSON.calculateMaxExtent().then((res) => {
        this.map_.setBbox(res);
      });
    });
  }

  setStyle(geometryType) {
    let style = null;
    switch (geometryType) {
      case 'Point':
        style = this.stylePoint;
        break;
      case 'MultiPoint':
        style = this.stylePoint;
        break;
      case 'LineString':
        style = this.styleLine;
        break;
      case 'MultiLineString':
        style = this.styleLine;
        break;
      case 'Polygon':
        style = this.stylePolygon;
        break;
      case 'MultiPolygon':
        style = this.stylePolygon;
        break;
      default:
        style = null;
        break;
    }
    return style;
  }

  load() {
    let query = '';
    const fieldList = [];
    this.arrayFeaturesMapeaGeoJSON = [];
    for (let i = 0; i < this.searchOptions.length; i += 1) {
      fieldList.push(`${this.searchOptions[i].id}:"${this.searchOptions[i].value}"`);
    }
    for (let i = 0; i < fieldList.length; i += 1) {
      if (i === fieldList.length - 1) {
        query += fieldList[i];
      } else {
        query += `${fieldList[i]} and `;
      }
    }
    const projection = this.map_.getProjection().code;
    const wktFormatter = this.wktFormatter;
    IDEE.remote.get(this.geosearchUrl + encodeURI(query) + this.otherParameters).then((res) => {
      const resposeGeosearch = JSON.parse(res.text);
      resposeGeosearch.response.docs.forEach((element) => {
        const feature = wktFormatter.readFeature(element.geom, {
          dataProjection: projection,
        });
        feature.setId(element.solrid);
        feature.setProperties(element);
        const featureMapea = IDEE.impl.Feature.olFeature2Facade(feature);
        this.arrayFeaturesMapeaGeoJSON.push(featureMapea.getGeoJSON());
      });
      this.showResults(this.arrayFeaturesMapeaGeoJSON);
    });
  }

  clear() {
    this.pageNumber = 1;
    for (let i = 0; i < this.searchOptions.length; i += 1) {
      this.searchOptions[i].value = '';
    }
    this.searchPanel.style.display = 'block';
    this.resultPanel.style.display = 'none';
    this.resultPagination.style.display = 'none';
    this.loadButton.disabled = true;
    this.clearButton.disabled = true;
  }

  enableButtons() {
    this.loadButton.disabled = false;
    this.clearButton.disabled = false;
  }

  paginate(array) {
    return array.slice(
      (this.pageNumber - 1) * this.maxRecordsPage,
      this.pageNumber * this.maxRecordsPage,
    );
  }

  createResultContent(dataList) {
    let htmlResult = '';
    for (let x = 0; x < dataList.length; x += 1) {
      htmlResult += this.recordInfoTable(dataList[x]);
    }
    return htmlResult;
  }

  recordInfoTable(record) {
    let recordTable = `<table id="${record.properties.solrid}" class="record-result">\n`
      + '<tbody class="pointer-none">\n<tr class="rowResult" >\n';
    for (let y = 0; y < this.infofields.length; y += 1) {
      recordTable += `<td class="key">${this.infofields[y].alias}</td>\n`
        + `<td class="value">${record.properties[this.infofields[y].field]}</td>\n</tr>`;
    }
    recordTable += '\n</tbody>\n</table>\n';
    return recordTable;
  }

  showResults(data) {
    this.dataList = data;
    if (this.dataList.length > 0) {
      this.totalRecords = this.dataList.length;
      if (this.dataList.length % this.maxRecordsPage === 0) {
        this.pageTotal = this.dataList.length / this.maxRecordsPage;
      } else {
        this.pageTotal = Math.floor(this.dataList.length / this.maxRecordsPage) + 1;
      }
      const paginatedRecords = this.paginate(this.dataList);
      const resultContent = this.createResultContent(paginatedRecords);
      this.createResultPagination();
      this.results.innerHTML = resultContent;
      this.loadButton.disabled = true;
    } else {
      this.results.innerHTML = '<table class="center">\n'
        + '<tbody>\n'
        + '<tr>\n'
        + '<th class="noResults" colspan="2">\n'
        + '<p>No se ha encontrado ningún resultado</p>\n'
        + '</th>\n'
        + '</tr>\n'
        + '</tbody>\n'
        + '</table>';
      this.recordsNumber.textContent = '0';
      this.recordsTotal.textContent = '0';
      this.previusPage.style.visibility = 'hidden';
      this.nextPage.style.visibility = 'hidden';
    }
    this.resultPagination.style.display = 'block';
    this.resultPanel.style.display = 'block';
    this.searchPanel.style.display = 'none';
  }

  createResultPagination() {
    this.recordsTotal.textContent = this.totalRecords;
    if (this.totalRecords < this.maxRecordsPage) {
      this.recordsNumber.textContent = this.totalRecords;
      this.previusPage.style.visibility = 'hidden';
      this.nextPage.style.visibility = 'hidden';
    } else {
      this.recordsNumber.textContent = `1 - ${this.maxRecordsPage}`;
    }

    if (this.pageNumber === 1 & (this.totalRecords > this.maxRecordsPage)) {
      this.previusPage.style.visibility = 'hidden';
      this.nextPage.style.visibility = 'visible';
    } else if (this.pageNumber === 1 & (this.totalRecords <= this.maxRecordsPage)) {
      this.previusPage.style.visibility = 'hidden';
      this.nextPage.style.visibility = 'hidden';
    } else {
      this.previusPage.style.visibility = 'visible';
      this.nextPage.style.visibility = 'visible';
    }
  }

  showPreviusPage() {
    this.pageNumber -= 1;
    const paginatedRecords = this.paginate(this.dataList);
    const htmlRecords = this.createResultContent(paginatedRecords);
    this.results.innerHTML = htmlRecords;
    if (this.pageNumber === 1) {
      this.recordsNumber.textContent = `1 - ${this.pageNumber * this.maxRecordsPage}`;
      this.previusPage.style.visibility = 'hidden';
      this.nextPage.style.visibility = 'visible';
    } else {
      this.recordsNumber.textContent = `${(this.pageNumber * this.maxRecordsPage) - (this.maxRecordsPage - 1)} - ${this.pageNumber * this.maxRecordsPage}`;
      this.previusPage.style.visibility = 'visible';
      this.nextPage.style.visibility = 'visible';
    }
  }

  showNextPage() {
    this.pageNumber += 1;
    const paginatedRecords = this.paginate(this.dataList);
    const htmlRecords = this.createResultContent(paginatedRecords);
    this.results.innerHTML = htmlRecords;
    if (this.pageNumber === this.pageTotal) {
      this.recordsNumber.textContent = `${this.totalRecords - paginatedRecords.length} - ${this.totalRecords}`;
      this.previusPage.style.visibility = 'visible';
      this.nextPage.style.visibility = 'hidden';
    } else {
      this.recordsNumber.textContent = `${(this.pageNumber * this.maxRecordsPage) - (this.maxRecordsPage - 1)} - ${this.pageNumber * this.maxRecordsPage}`;
      this.previusPage.style.visibility = 'visible';
      this.nextPage.style.visibility = 'visible';
    }
  }

  /**
   * This function destroys this control
   *
   * @public
   * @function
   * @api stable
   */
  destroy() {
    if (this.capaGeoJSON) {
      this.map_.removeLayers(this.capaGeoJSON);
    }
    super.destroy();
  }
}
