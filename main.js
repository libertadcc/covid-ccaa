require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/Graphic",
    "esri/layers/GraphicsLayer"
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
            type: "string"
        },
        {
            name: "dosisEntregadas",
            alias: "dosisEntregadas",
            type: "string"
        },
        {
            name: "dosisEntregadasModerna",
            alias: "dosisEntregadasModerna",
            type: "string"
        },
        {
            name: "dosisEntregadasPfizer",
            alias: "dosisEntregadasPfizer",
            type: "string"
        },
        {
            name: "dosisPautaCompletada",
            alias: "dosisPautaCompletada",
            type: "string"
        },
        {
            name: "porcentajeEntregadas",
            alias: "porcentajeEntregadas",
            type: "string"
        },
        {
            name: "porcentajePoblacionAdministradas",
            alias: "porcentajePoblacionAdministradas",
            type: "string"
        },
        {
            name: "porcentajePoblacionCompletas",
            alias: "porcentajePoblacionCompletas",
            type: "string"
        }
    ];

    const less10 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.1],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
    
    const less20 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.2],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
  
    const less30 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.3],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
  
    const less40 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.4],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
  
    const less50 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.5],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
  
    const less60 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.6],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
  
    const less70 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.7],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };

    const more70 = {
        type: "simple-fill", 
        color: [0, 145, 255, 0.9],
        style: "solid",
        outline: {
            width: 0.6,
            color: [27, 116, 228, 1]
        }
    };
  
    const renderer = {
        type: "class-breaks",
        field: "porcentajePoblacionCompletas",
        defaultSymbol: {
            type: "simple-fill", 
            color: "black",
            style: "backward-diagonal",
            outline: {
                width: 0.5,
                color: [50, 50, 50, 0.6]
            }
        },
        defaultLabel: "no data",
        classBreakInfos: [
            {
                minValue: 0,
                maxValue: 0.0999,
                symbol: less10
            },{
                minValue: 0.1,
                maxValue: 0.1999,
                symbol: less20
            },{
                minValue: 0.2,
                maxValue: 0.2999,
                symbol: less30
            },{
                minValue: 0.3,
                maxValue: 0.3999,
                symbol: less40
            },{
                minValue: 0.4,
                maxValue: 0.4999,
                symbol: less50
            },{
                minValue: 0.5,
                maxValue: 0.5999,
                symbol: less60
            },{
                minValue: 0.6,
                maxValue: 0.6999,
                symbol: less70
            },{
              minValue: 0.7,
                maxValue: 1.0,
                symbol: more70
            }
        ]
    };

    const map = new Map({
        basemap: "gray-vector"
    });

    const view = new MapView({
        container: "viewDiv",
        map: map,
        center: [-3.947902885389234, 39.465869757459394],
        zoom: 5,
        constraints: {
          rotationEnabled: false
        },
        ui: {
            components: ['attribution']
        },
    });

    let layer ;
    view.when(function() {
        fetch('https://covid-vacuna.app/data/latest.json')
        .then(response => response.json())
        .then(data => {
            let geodata = geolocateCovidData(data).filter(data => data != undefined);
            layer = new FeatureLayer({
                source: geodata,
                fields: fields,
                objectIdField: "ObjectID",
                renderer: renderer
            });
            map.add(layer);
            document.querySelector('.esri-attribution__powered-by a').innerHTML = `<a href="https://developers.arcgis.com/" target="_blank">ArcGIS</a>`

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

    function highlightFeature(layerView, mappoint) {
        const query = {
            geometry: mappoint,
            returnGeometry: true,
            outFields: ["*"]
        };
    
        layerView.queryFeatures(query).then((response) => {
            graphicsLayer.graphics.removeAll();

            if(response.features.length > 0) {
                const symbol = {
                  type: "simple-fill",
                  color: null,
                  outline: "rgba(0, 255, 255, 1)"
                };
                var feature = response.features[0];
                feature.symbol = symbol;
                graphicsLayer.graphics.add(feature);
                feature.popupTemplate = {
                    "title": "{ccaa}",
                    "content": 
                       `<b>Población totalmente vacunada:</b> {porcentajePoblacionCompletas} %<br>
                        <b>Dosis entregadas:</b> {dosisEntregadas}<br>
                        <b>Dosis entregadas Pfizer:</b> {dosisEntregadasPfizer}<br>
                        <b>Dosis entregadas Moderna:</b> {dosisEntregadasModerna}<br>
                        <b>Dosis administradas:</b> {dosisAdministradas}<br>
                        <b>Porcentaje entregadas:</b> {porcentajeEntregadas} %<br>
                        <b>Dosis pauta completada:</b> {dosisPautaCompletada}<br>`
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
            } else {
                view.popup.close();  
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
                        dosisAdministradas: dosis_ccaa.dosisAdministradas.toString().replace(/\d(?=(?:\d{3})+$)/g, '$&.'),
                        dosisEntregadas: dosis_ccaa.dosisEntregadas.toString().replace(/\d(?=(?:\d{3})+$)/g, '$&.'),
                        dosisEntregadasModerna: dosis_ccaa.dosisEntregadasModerna.toString().replace(/\d(?=(?:\d{3})+$)/g, '$&.'),
                        dosisEntregadasPfizer: dosis_ccaa.dosisEntregadasPfizer.toString().replace(/\d(?=(?:\d{3})+$)/g, '$&.'),
                        dosisPautaCompletada: dosis_ccaa.dosisPautaCompletada.toString().replace(/\d(?=(?:\d{3})+$)/g, '$&.'),
                        porcentajeEntregadas: dosis_ccaa.porcentajeEntregadas.toFixed(4),
                        porcentajePoblacionAdministradas: dosis_ccaa.porcentajePoblacionAdministradas.toFixed(4),
                        porcentajePoblacionCompletas: dosis_ccaa.porcentajePoblacionCompletas.toFixed(4),
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
