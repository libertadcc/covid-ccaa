import * as ccaa from './ccaa.js';
import * as covid from './latest.js';

const dataCCAA = ccaa.data.features;
const dataCovid = covid.data;

let covidGeometry;
function addFeatures() {
  covidGeometry = dataCovid.map(comunidad => {
    dataCCAA.map(com => {
      if (comunidad.ccaa === com.properties.Nombre) {
        comunidad.geometria = com.geometry;
      }
    });
    return comunidad;
  });
};

addFeatures();
console.log('covidGeometry', covidGeometry);

