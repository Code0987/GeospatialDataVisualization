declare let d3: any;
declare let L: any;

function gdvForWeatherAlerts() {

  function renderMap() {

    function createMap(allLayer, timelineLayer) {
      let baseMaps = {
        "Outdoors": L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoiY29kZTA5ODciLCJhIjoiY2ptYXd6bHhxMDBhbzN3bWZmczRneXBvaCJ9.IQnHF2lcNcMs9V7CRfIixA"),
        "Satellite": L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoiY29kZTA5ODciLCJhIjoiY2ptYXd6bHhxMDBhbzN3bWZmczRneXBvaCJ9.IQnHF2lcNcMs9V7CRfIixA"),
        "Light Map": L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoiY29kZTA5ODciLCJhIjoiY2ptYXd6bHhxMDBhbzN3bWZmczRneXBvaCJ9.IQnHF2lcNcMs9V7CRfIixA"),
      };

      let overlayMaps = {
        "All": allLayer
      };

      let map = L.map("map", {
        center: [37, -95],
        zoom: 5,
        layers: [baseMaps["Light Map"]],
        scrollWheelZoom: true
      });

      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);

      let timelineControl = L.timelineSliderControl({
        formatOutput: function (date) {
          return new Date(date).toLocaleString();
        }
      });
      timelineControl.addTo(map);
      timelineControl.addTimelines(timelineLayer);
      timelineLayer.addTo(map);
    }

    function createFeatures(allData) {

      function onEach(feature, layer) {
        layer.bindPopup("<h4>" + feature.properties.headline + "</h4><hr><p>" + new Date(feature.properties.effective).toLocaleString() + "</p><hr><p>Area: " + feature.properties.areaDesc + "</p>");
      }

      let allLayer = L.geoJSON(allData, {
        onEachFeature: onEach,
        filter: function (feature, layer) {
          return feature.geometry != undefined;
        }
      });

      let timelineLayer = L.timeline(allData, {
        style: function (data) {
          return {
            stroke: false,
            color: "red",
            fillOpacity: 0.6
          };
        },
        getInterval: function (feature) {
          return {
            start: (new Date(feature.properties.sent).getTime()),
            end: (new Date(feature.properties.expires).getTime())
          };
        },
        onEachFeature: onEach,
        waitToUpdateMap: true,
        filter: function (feature, layer) {
          return feature.geometry != undefined;
        }
      });

      createMap(allLayer, timelineLayer);
    }

    d3.json("https://api.weather.gov/alerts?limit=499", function (data) {
      createFeatures(data);
    });

  }

  renderMap();

}

function gdvForEarthquakes() {

  function renderMap(earthquakeURL, faultLinesURL) {

    function getMarkerColor(mag) {
      return d3.interpolateRgb("yellow", "red")((mag - 4.99) / (10.0 - 5.0));
    }

    function createMap(earthquakesAll, earthquakesNonGreen, faultLines, timelineLayer) {
      let baseMaps = {
        "Outdoors": L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v10/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoiY29kZTA5ODciLCJhIjoiY2ptYXd6bHhxMDBhbzN3bWZmczRneXBvaCJ9.IQnHF2lcNcMs9V7CRfIixA"),
        "Satellite": L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoiY29kZTA5ODciLCJhIjoiY2ptYXd6bHhxMDBhbzN3bWZmczRneXBvaCJ9.IQnHF2lcNcMs9V7CRfIixA"),
        "Dark Map": L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/256/{z}/{x}/{y}?" +
          "access_token=pk.eyJ1IjoiY29kZTA5ODciLCJhIjoiY2ptYXd6bHhxMDBhbzN3bWZmczRneXBvaCJ9.IQnHF2lcNcMs9V7CRfIixA"),
      };

      let overlayMaps = {
        "All Earthquakes": earthquakesAll,
        "Alert Earthquakes": earthquakesNonGreen,
        "Fault Lines": faultLines
      };

      let map = L.map("map", {
        center: [8, 34],
        zoom: 2,
        layers: [baseMaps["Dark Map"], faultLines, earthquakesNonGreen],
        scrollWheelZoom: true
      });

      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);

      let legend = L.control({ position: "bottomright" });
      legend.onAdd = function (map) {
        let div = L.DomUtil.create("div", "info legend");

        for (let i = 5; i < 10; i++) {
          div.innerHTML += "<i style=\"background:" + getMarkerColor(i + 0.0) + "\"></i> " + (i) + "+<br>";
        }

        return div;
      };
      legend.addTo(map);

      let timelineControl = L.timelineSliderControl({
        formatOutput: function (date) {
          return new Date(date).toLocaleDateString();
        },
        steps: 10000
      });
      timelineControl.addTo(map);
      timelineControl.addTimelines(timelineLayer);
      timelineLayer.addTo(map);
    }

    function createFeatures(earthquakeData, faultLineData) {
      function getMarkerSize(mag, f) {
        return mag * mag / f;
      }

      function onEachEarthquake(feature, layer) {
        layer.bindPopup("<h4>" + feature.properties.place + "</h4><hr><p>" + new Date(feature.properties.time).toLocaleString() + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p><hr><p>More: <a href=\"" + feature.properties.url + "\" target=\"_blank\">" + feature.properties.url + "</a></p>");
      }

      let earthquakesAll = L.geoJSON(earthquakeData, {
        onEachFeature: onEachEarthquake,
        pointToLayer: function (feature, layer) {
          return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: 0.3,
            fillColor: getMarkerColor(feature.properties.mag),
            radius: getMarkerSize(feature.properties.mag, 5),
            stroke: false
          });
        }
      });

      let earthquakesNonGreen = L.geoJSON(earthquakeData, {
        onEachFeature: onEachEarthquake,
        pointToLayer: function onEachEarthquakeLayer(feature, layer) {
          return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: 0.3,
            fillColor: getMarkerColor(feature.properties.mag),
            radius: getMarkerSize(feature.properties.mag, 4),
            stroke: false
          });
        },
        filter: function (feature, layer) {
          return feature.properties.alert != "green";
        }
      });

      let faultLines = L.geoJSON(faultLineData, {
        onEachFeature: function (feature, layer) {
          L.polyline(feature.geometry.coordinates);
        },
        style: {
          weight: 2,
          color: "rgba(255, 0, 0, 0.4)"
        }
      });

      let timelineLayer = L.timeline(earthquakeData, {
        getInterval: function (feature) {
          return {
            start: feature.properties.time,
            end: feature.properties.time + (feature.properties.mag * 4.32e+7) + 82800000
          };
        },
        onEachFeature: onEachEarthquake,
        pointToLayer: function (feature, layer) {
          return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: 0.8,
            color: getMarkerColor(feature.properties.mag),
            fillColor: getMarkerColor(feature.properties.mag),
            radius: getMarkerSize(feature.properties.mag, 2.1)
          });
        }
      });

      createMap(earthquakesAll, earthquakesNonGreen, faultLines, timelineLayer);
    }

    d3.json(earthquakeURL, function (data) {
      console.log(earthquakeURL);

      let earthquakeData = data;

      d3.json(faultLinesURL, function (data) {
        let faultLineData = data;

        createFeatures(earthquakeData, faultLineData);
      });
    });

  }

  renderMap("/data/earthquakes.json", "/data/boundaries.json");

}
