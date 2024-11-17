document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([3.3700, -76.5319], 12); // Coordenadas de Cali
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Cargar datos de sensores y clasificaciones
    Promise.all([
        fetch('sensors.json').then(response => response.json()),
        fetch('classifications.json').then(response => response.json())
    ])
    .then(([sensors, classifications]) => {
        // Función para obtener el color según la clasificación
        function getColor(classification) {
            switch (classification) {
                case 'Buena': return 'green';
                case 'Moderada': return 'yellow';
                case 'Dañina a la salud para algunos grupos sensibles': return 'orange';
                case 'Dañina para la salud': return 'red';
                case 'Muy dañina a la salud': return 'purple';
                case 'Peligrosa': return 'brown';
                default: return 'lightblue';
            }
        }

        // Añadir los pines al mapa como puntos con borde azul por defecto
        sensors.forEach(sensor => {
            var classification = classifications[sensor.id] || 'unknown';

            // var standardMarker = L.marker([sensor.latitude, sensor.longitude]).addTo(map);

            // Crear círculo marcador L.circleMarker
            var circleMarker = L.circleMarker([sensor.latitude, sensor.longitude], {
                color: 'blue', // Borde azul por defecto
                fillColor: 'lightblue',
                fillOpacity: 0.9,
                radius: 10
            }).addTo(map);

            // Añadir el contenido del popup con las coordenadas a ambos marcadores
            var popupContent = `
                <div style="background-color: ${getColor(classification)}; padding: 5px; border-radius: 5px;">
                    <b>${sensor.name}</b><br>
                    Clasificación: ${classification}<br>
                    Coordenadas: [${sensor.latitude}, ${sensor.longitude}]
                </div>
            `;

            // standardMarker.bindPopup(popupContent);
            circleMarker.bindPopup(popupContent);

            // Eventos para el círculo marcador
            circleMarker.on('mouseover', function () {
                this.setStyle({ color: getColor(classification), fillColor: getColor(classification) });
                this.openPopup();
            });

            circleMarker.on('mouseout', function () {
                this.setStyle({ color: 'blue', fillColor: 'lightblue', fillOpacity: 0.9 });
                this.closePopup();
            });
        });
    })
    .catch(error => console.error('Error cargando los datos:', error));
});
