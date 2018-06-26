// DATA LINKS

// Assign link with earthquake data from last 7 days to variable
var earthquakes_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Assign link with tectonic plates to variable
var plate_faults_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// DEFINE BASE MAP STYLES
 var satellite_map = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
 	id: 'mapbox.satellite',
 	accessToken: 'YOUR_API_KEY',
 	maxZoom: 18,
 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
 })
 var outdoors_map = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
 	id: 'mapbox.outdoors',
 	accessToken: 'YOUR_API_KEY',
 	maxZoom: 18,
 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
 })
 var light_map = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
 	id: 'mapbox.light',
 	accessToken: 'YOUR_API_KEY',
 	maxZoom: 18,
 	attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
 })

// Perform a GET request to the earthquakes URL
var earthquakes
d3.json(earthquakes_url, function(data) {
    
    earthquakes = L.geoJSON(data.features, {
        pointToLayer: function (feature, latlng) {
        return new L.circle(latlng,
            {radius: 20000*(feature.properties.mag), // 20000 -> adjust circle size based on magnitude
            fillColor: marker_color(feature.properties.mag),
            fillOpacity: .7,
            stroke: true,
            color: "black",
            weight: .5
        })
        },
        onEachFeature: function (feature, layer){
        layer.bindPopup("<h4>" + feature.properties.place +
                        "</h4><hr><p>" + new Date(feature.properties.time) + "</p>" +
                        "</h4><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        }
    });
    

    // Perform a GET request to the plate faults URL
    d3.json(plate_faults_url, function(data){
        var styling = {
            "fillOpacity": 0
        };
        var plate_faults = L.geoJSON(data.features, {
            style: function(){
                return styling
            }
        });

        createMap(earthquakes, plate_faults)
    });
});



// CREATE BASE MAPS
function createMap(earthquakes, plate_faults){
  // Define a baseMaps object to hold our base layers
  var baseMaps = {
   "Outdoors": outdoors_map,
   "Grayscale": light_map,
   "Satellite": satellite_map
 };

// Create object holding overlay layers
var overlayMaps = {
  "Earthquakes": earthquakes,
  "Fault Lines": plate_faults
  
};

// Create map and initially show satellite and earthquakes layers
var myMap = L.map("map", {
    center: [
      37.09, -95.71
    ],
    zoom: 4,
    layers: [outdoors_map, earthquakes]
});

// Create a layer control
// Pass in our baseMaps and overlayMaps
// Add the layer control to the map
L.control.layers(baseMaps, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Create legend
var legend = L.control({position: 'bottomright'});

// Add legend
legend.onAdd = function () {

    var div = L.DomUtil.create('div', 'info legend');
            labels = ['<strong>Magnitude</strong>'],
            magnitude = [1,2,3,4,5];

    // generate legend by looping through colors and assign to magnitude interval
    for (var i = 0; i < magnitude.length; i++) {
        div.innerHTML +=
        labels.push(
            '<i class = "circle" style="background:' + marker_color(magnitude[i]+1) + '"></i> ' +
            (magnitude[i] ? magnitude[i] : '+'));
        }
        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(myMap);
}

// Assign colors to magnitude ranges
function marker_color(magnitude) {
  if (magnitude > 5) {
      return 'red'
  } else if (magnitude > 4) {
      return 'orangered'
  } else if (magnitude > 3) {
      return 'orange'
  } else if (magnitude > 2) {
      return 'yellow'
  } else if (magnitude > 1) {
      return 'greenyellow'
  } else {
      return 'green'
  }
};