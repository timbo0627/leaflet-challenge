// Create a map centered at a specific latitude and longitude
var map = L.map('map').setView([37.7749, -122.4194], 5);

// Add a tile layer to the map (this is the background map image)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Fetch the earthquake data from the USGS API
fetch('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson')
    .then(response => response.json())
    .then(data => {
        // Function to determine marker size based on magnitude
        function markerSize(magnitude) {
            return magnitude * 4;
        }

        // Function to determine marker color based on depth
        function markerColor(depth) {
            if (depth > 90) return '#d73027';
            else if (depth > 70) return '#fc8d59';
            else if (depth > 50) return '#fee08b';
            else if (depth > 30) return '#d9ef8b';
            else if (depth > 10) return '#91cf60';
            else return '#1a9850';
        }

        // Iterate through the features (earthquake points)
        data.features.forEach(feature => {
            var coordinates = feature.geometry.coordinates;
            var magnitude = feature.properties.mag;
            var depth = coordinates[2];
            var latLng = [coordinates[1], coordinates[0]];

            // Create a circle marker
            var marker = L.circleMarker(latLng, {
                radius: markerSize(magnitude),
                fillColor: markerColor(depth),
                color: '#000',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);

            // Bind popup information to the marker
            marker.bindPopup(
                `<h3>${feature.properties.place}</h3>
                <hr>
                <p>Magnitude: ${magnitude}</p>
                <p>Depth: ${depth} km</p>
                <p>${new Date(feature.properties.time)}</p>`
            );
        });

        // Add a legend to the map
        var legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML += '<h4>Depth</h4>';
            var depths = [0, 10, 30, 50, 70, 90];
            var colors = ['#1a9850', '#91cf60', '#d9ef8b', '#fee08b', '#fc8d59', '#d73027'];

            for (var i = 0; i < depths.length; i++) {
                div.innerHTML +=
                    '<i style="background:' + colors[i] + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
                    depths[i] + (depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+');

            }
            return div;
        };

        legend.addTo(map);
    })
    .catch(error => console.error('Error fetching the earthquake data:', error));