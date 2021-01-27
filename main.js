require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Graphic"
], function(Map, MapView, FeatureLayer, Graphic) {

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

    view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-3.7197, 40.41304],
        zoom: 5
    });

    view.when(function() {
        fetch('./data/vaccines_latest.js')
        .then(response => response.json())
        .then(data => {
            let geodata = geolocateCovidData(data).filter(data => data != undefined);

            let layer = new FeatureLayer({
                source: geodata,
                fields: fields,
                objectIdField: "ObjectID",
                popupTemplate: {
                    title: "HOLA"
                },
            });
            map.add(layer);
        });
    });

    
    var canaryDiv = new MapView({
        container: "canaryDiv",
        map: map,
        extent: {
            xmax: -1477772.795519894,
            xmin: -2064809.1727500185,
            ymax: 3446020.306026007,
            ymin: 3149750.3843926787,
            spatialReference: {
                wkid: 102100
            }
        },
        ui: {
          components: []
        }
    });
    view.ui.add("canaryDiv", "bottom-left");

    function geolocateCovidData(data) {

        const esriJson = {
            properties: 'attributes',
            coordinates: 'rings'
        };
        const geoJSON = {
            properties: 'properties',
            coordinates: 'coordinates'
        };

        let attributes = esriJson;
        let covidGeometry = data.map(dosis_ccaa => {

            let finder = function(ccaa) {
               return ccaa[attributes['properties']].Nombre == this.ccaa
            }

            ccaaGeometry = dataCCAA.features.find(finder, {ccaa: dosis_ccaa.ccaa});

            if(ccaaGeometry && ccaaGeometry[attributes['properties']].cod_CCAA){
                return new Graphic({
                    attributes: {
                        ObjectId: ccaaGeometry[attributes['properties']].cod_CCAA,
                        ccaa: dosis_ccaa.ccaa,
                        dosisAdministradas: dosis_ccaa.dosisAdministradas,
                        dosisEntregadas: dosis_ccaa.dosisEntregadas,
                        dosisEntregadasModerna: dosis_ccaa.dosisEntregadasModerna,
                        dosisEntregadasPfizer: dosis_ccaa.dosisEntregadasPfizer,
                        dosisPautaCompletada: dosis_ccaa.dosisPautaCompletada,
                        porcentajeEntregadas: dosis_ccaa.porcentajeEntregadas,
                        porcentajePoblacionAdministradas: dosis_ccaa.porcentajePoblacionAdministradas,
                        porcentajePoblacionCompletas: dosis_ccaa.porcentajePoblacionCompletas,
                    },
                    geometry: {
                        type: 'polygon',
                        rings: ccaaGeometry.geometry[attributes['coordinates']]
                    }
                });
            }
        });
        return covidGeometry
    }
});
