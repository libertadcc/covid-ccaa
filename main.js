// import * as ccaa from './ccaageo.js';

import * as ccaa from './ccaa10210.js'; //https://services1.arcgis.com/nCKYwcSONQTkPA4K/ArcGIS/rest/services/CCAA_wgs1984_wm/FeatureServer/0
import * as covid from './latest.js';

require([
  "esri/Map",
  "esri/views/MapView",
  "esri/layers/FeatureLayer",
  "esri/geometry/Polygon",
  "esri/Graphic",
  "esri/request"
], function(Map, MapView, FeatureLayer, Polygon, Graphic, esriRequest) {

  const dataCCAA = ccaa.data.features; 
  let dataCovid = covid.data;
    
  
  var fields = [
    {
      name: "ObjectID",
      alias: "ObjectID",
      type: "oid"
    },
    {
      name: "ccaa",
      alias: "ccaa",
      type: "string"
    },
    { 
      name: "dosisAdministradas",
      alias: "dosisAdministradas",
      type: "double"
    },
    { 
      name: "dosisEntregadas",
      alias: "dosisEntregadas",
      type: "double"
    },
    { 
      name: "dosisEntregadasModerna",
      alias: "dosisEntregadasModerna",
      type: "double"
    },
    { 
      name: "dosisEntregadasPfizer",
      alias: "dosisEntregadasPfizer",
      type: "double"
    },
    { 
      name: "porcentajeEntregadas",
      alias: "porcentajeEntregadas",
      type: "double"
    },
    { 
      name: "porcentajePoblacionAdministradas",
      alias: "porcentajePoblacionAdministradas",
      type: "double"
    },
    { 
      name: "porcentajePoblacionCompletas",
      alias: "porcentajePoblacionCompletas",
      type: "double"
    }
  ];
  
  
  map = new Map({
    basemap: "dark-gray-vector"
  });

  var view = new MapView({
    container: "viewDiv",
    map: map,
    center: [-3.7197, 40.41304],
    zoom: 5,
    spatialReference: {
      wkid: 102100
    },
  });

  let vaccineRenderer =  {
    type: "simple",  // error with simple-fill
    color: "yellow",
    outline: {  // autocasts as new SimpleLineSymbol()
      color: [255, 255 , 0, 1],
      width: "0.5px"
    }
  };

  view.when(function() {
    getData()
      .then(addGeometryCovidData)
      .then(createLayer)
      .then(addToView)
      .catch(function (e) {
        console.error("Creating FeatureLayer failed", e);
      });
  });
  
  function getData() {
    var url = 'https://covid-vacuna.app/data/latest.json';
    return esriRequest(url, { //fetch
      responseType: "json"
    });

    // fetch('https://covid-vacuna.app/data/latest.json')
    //   .then(response => response.json())
  }


  function addGeometryCovidData(response) {
    let covidGeometry = [];
    dataCovid = response.data;
    console.log(dataCovid);
    console.log('dataCCAA', dataCCAA)
    dataCovid.map(comunidad => {
        dataCCAA.map(com => {
          if (comunidad.ccaa === com.attributes.Nombre) {
            return comunidad = new Graphic({
              attributes: {
                ObjectId: com.attributes.cod_CCAA,
                ccaa: comunidad.ccaa,
                dosisAdministradas: comunidad.dosisAdministradas,
                dosisEntregadas: comunidad.dosisEntregadas,
                dosisEntregadasModerna: comunidad.dosisEntregadasModerna,
                dosisEntregadasPfizer: comunidad.dosisEntregadasPfizer,
                dosisPautaCompletada: comunidad.dosisPautaCompletada,
                porcentajeEntregadas: comunidad.porcentajeEntregadas,
                porcentajePoblacionAdministradas: comunidad.porcentajePoblacionAdministradas,
                porcentajePoblacionCompletas: comunidad.porcentajePoblacionCompletas,
              }, 
              // geometry: com.geometry // error sobre el tipo
              geometry: {
                type: "polygon",
                rings: com.geometry.rings
              }
            });
          }
        });
        covidGeometry.push(comunidad);
      });  
     
    return covidGeometry
  }

  // let layer;
  function createLayer(graphics) {
    console.log('createLayer', graphics);
    return new FeatureLayer({
      source: graphics,
      fields: fields, // This is required when creating a layer from Graphics
      objectIdField: "ObjectID", // This must be defined when creating a layer from Graphics
      renderer: vaccineRenderer, // set the visualization on the layer
      popupTemplate: {                     // autocasts as new PopupTemplate()
        title: "HOLA"
      },
    });    

  }

  function addToView(layer) { //https://developers.arcgis.com/javascript/latest/sample-code/sandbox/index.html?sample=layers-featurelayer-collection
    console.log('addToView', layer)
    view.map.add(layer);
    map.layers.add(layer); // https://developers.arcgis.com/javascript/latest/guide/layers-and-data/
  }

});




