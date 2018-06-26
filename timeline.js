// Create initial map
var timelineMap = L.map('timeline', {
    center: [
        37.09, -95.71
      ],
      zoom: 4,
      //layers: [satellite_map, earthquakes]
});

var earthquakes_timeline = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    maxZoom: 18,
    id: 'mapbox.outdoors',
    accessToken: 'YOUR_API_KEY'
}).addTo(timelineMap);

d3.json(earthquakes_url, function(data){
    var timeline = L.timeline(data, {
        getInterval: function(feature) {
            return {
                start: feature.properties.time,
                end:   feature.properties.time + 1000000000 // -> 1000000000 how long should feature be visible (seconds)
              };
        },
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
        /* onEachFeature: function (feature, layer){
        layer.bindPopup("<h4>" + feature.properties.place +
                        "</h4><hr><p>" + new Date(feature.properties.time) + "</p>" +
                        "</h4><hr><p>Magnitude: " + feature.properties.mag + "</p>");
        } */
    });

    // Perform a GET request to the earthquakes URL (url is defined in logic.js) 
    d3.json(earthquakes_url, function(data){
    
        /* var styling = {
            "fillOpacity": 0
        };

        L.geoJSON(data.features, {
            style: function(){
                return styling
            }
        }).addTo(timelineMap) */

        var timelineControl = L.timelineSliderControl({
                formatOutput: function(date) {
                return new Date(date).toString(); // convert UNIX date/time to local date/time string
                },
                duration: 60000,
                showTicks: false
            });

            timelineControl.addTo(timelineMap).addTimelines(timeline);
            timeline.addTo(timelineMap);
        })
});

// Create legend
var legend = L.control({position: 'bottomright'});

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

legend.addTo(timelineMap);