require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/layers/GraphicsLayer",
], function(Map, MapView, FeatureLayer, Graphic, GraphicsLayer) {

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
        zoom: 5,
        constraints: {
          rotationEnabled: false
        }
    });
    let layer ;
    view.when(function() {
        fetch('./data/vaccines_latest.js')
        .then(response => response.json())
        .then(data => {
            let geodata = geolocateCovidData(data).filter(data => data != undefined);
            layer = new FeatureLayer({
                source: geodata,
                fields: fields,
                objectIdField: "ObjectID"
            });
            map.add(layer);
            return layer;
        })
        .then((layer) => {
            canaryView.on("pointer-move", function(event) {  
                return highlightFeature(layer, canaryView.toMap(event));
            });
            view.on("pointer-move", function(event) {  
                return highlightFeature(layer, view.toMap(event));
            });
            
        });
    });

    var canaryView = new MapView({
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
        },
        constraints: {
          rotationEnabled: false
        }
    });
    view.ui.add("canaryDiv", "bottom-left");


    view.when(disableZooming);
    canaryView.when(disableZooming);

    function disableZooming(view) {

        view.popup.actions = [];
        function stopEvtPropagation(event) {
          event.stopPropagation();
        }

        view.on("mouse-wheel", stopEvtPropagation);
        view.on("double-click", stopEvtPropagation);
        view.on("double-click", ["Control"], stopEvtPropagation);
        view.on("drag", stopEvtPropagation);
        view.on("drag", ["Shift"], stopEvtPropagation);
        view.on("drag", ["Shift", "Control"], stopEvtPropagation);
        view.on("key-down", function(event) {
          const prohibitedKeys = ["+", "-", "Shift", "_", "=", "ArrowUp", "ArrowDown", "ArrowRight", "ArrowLeft"];
          const keyPressed = event.key;
          if (prohibitedKeys.indexOf(keyPressed) !== -1) {
            event.stopPropagation();
          }
        });
        return view;
    };

    const graphicsLayer = new GraphicsLayer({
        title: "layer"
    });

    map.add(graphicsLayer);


    function highlightFeature(lview, mappoint) {
        const query = {
            geometry: mappoint,
            returnGeometry: true,
            outFields: ["*"]
        };

        lview.queryFeatures(query).then((response) => {
            graphicsLayer.graphics.removeAll();
           

            if(response.features.length > 0) {
                const symbol = {
                  type: "simple-fill",
                  color: "rgba(0, 255, 255, 1)",
                  outline: null
                };
                var feature = response.features[0];
                feature.symbol = symbol;
                graphicsLayer.graphics.add(feature);
                feature.popupTemplate = {
                    "title": "{ccaa}",
                    "content": `<b>Dosis entregadas:</b> {dosisEntregadas}<br>
                                <b>Dosis entregadas Pfizer:</b> {dosisEntregadasPfizer}<br>
                                <b>Dosis entregadas Moderna:</b> {dosisEntregadasModerna}<br>
                                <b>Dosis administratadas:</b> {dosisAdministradas}<br>
                                <b>Porcentaje entregadas:</b> {porcentajeEntregadas}<br>
                                <b>Dosis pauta completada:</b> {dosisPautaCompletada}<br>
                                <b>Porcentaje población totalmente vacunada:</b> {porcentajePoblacionCompletas}<br>`
                };
                if (feature.attributes.ccaa === "Canarias") {      
                    view.popup.close();  
                    canaryView.popup.open({
                        features:response.features,
                        location:mappoint
                    });
                    
                } else {
                    canaryView.popup.close();
                    view.popup.open({
                        features:response.features,
                        location:mappoint
                    });
                    
                }
            }
        });        
    };

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
