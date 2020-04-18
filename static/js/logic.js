//store api into a variable
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";
var API_KEY = "pk.eyJ1Ijoiamp3dTEwMTkiLCJhIjoiY2s3d2d3Z2tzMDI0bDNna2Iwa29ic25kbSJ9.bNbzCqX5wB3ISKgoQCfrEg"

d3.json(queryUrl, function(data) {
  //console.log(data.features);
  //run function that create features base on our data
  createFeatures(data.features);
});

//creat a function that graph the features
function createFeatures(earthquakeData) {

  
  //give each feature a popup describing the place, time, and magnitude of the earthquake
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>"
      + "Magnitude: " + feature.properties.mag + "</p>");
  }

  //a function that makes circle heat map base on the magnitude.
  function createHeatMap(feature, latlng) {
    //get color and size base on magnitude
    function getColor(i) {
      return i > 5 ? '#F30' :
      i > 4  ? '#F60' :
      i > 3  ? '#F90' :
      i > 2  ? '#FC0' :
      i > 1   ? '#FF0' :
                '#9F3';
    }
    function getSize(i) {
      return i > 5 ? '14' :
      i > 4  ? '12' :
      i > 3  ? '10' :
      i > 2  ? '8' :
      i > 1   ? '6' :
                '4';
    }
    var circlecolor = getColor(feature.properties.mag);
    var circlesize = parseInt(getSize(feature.properties.mag))

    var geojsonMarkerOptions = {
      radius: circlesize,
      color: circlecolor,
      weight: 1,
      opacity: 0.7,
      fillOpacity: 0.7
  };

    return L.circleMarker(latlng, geojsonMarkerOptions);
  
  }
  

  //create a geoJson layer with the features
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: createHeatMap
  });

  //pass earthquakes layer to the createMap function
  createMap(earthquakes);
}

function createMap(earthquakes) {

  //street map and dark map
  var streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 8,
    id: "mapbox.streets",
    accessToken: API_KEY
  });

  var lightmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.light",
    accessToken: API_KEY

  });

  //define a baseMaps object to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Light Map": lightmap
  };

  //create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  //create our map, with the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  //layer control
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  //create legends
  var legend = L.control({position: 'bottomright'});
  legend.onAdd = function (myMap) {
  var div = L.DomUtil.create('div', 'info legend'),
              grades = [0, 1, 2, 3, 4, 5];
  //loop through density intervals and generate a label with a colored square for each interval
  for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
          '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
          grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  return div;
  };
  legend.addTo(myMap);  

  function getColor(i) {
    return i > 5 ? '#F30' :
    i > 4  ? '#F60' :
    i > 3  ? '#F90' :
    i > 2  ? '#FC0' :
    i > 1   ? '#FF0' :
              '#9F3';
  }  
}