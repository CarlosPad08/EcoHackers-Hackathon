document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([3.3665, -76.5319], 12); // Coordenadas de Cali
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sugerencias según la clasificación
    const suggestions = {
        'Baja': [
            'Disfruta actividades al aire libre sin preocupaciones.',
            'Usa protección solar mínima, como un sombrero y gafas de sol.'
        ],
        'Moderada': [
            'Las personas sensibles (niños, ancianos y personas con piel clara) deben usar protector solar.',
            'Considera usar ropa ligera que cubra la piel para reducir la exposición directa.'
        ],
        'Alta': [
            'Usa protector solar de amplio espectro con SPF 30 o más.',
            'Busca sombra durante las horas de mayor intensidad solar (10 a.m. - 4 p.m.).',
            'Usa gafas de sol que bloqueen los rayos UV.'
        ],
        'Muy alta': [
            'Limita el tiempo al aire libre, especialmente durante las horas de mayor intensidad solar.',
            'Usa protector solar de amplio espectro con SPF 50 o más.',
            'Protege tu piel con ropa, sombrero de ala ancha y gafas de sol.'
        ],
        'Extremadamente alta': [
            'Evita cualquier actividad al aire libre durante las horas de mayor intensidad solar.',
            'Usa protector solar de amplio espectro con SPF 50+ y reaplica cada 2 horas.',
            'Permanece en interiores tanto como sea posible y protege cualquier parte expuesta de la piel.'
        ]
    };
    

    // Cargar datos de sensores y clasificaciones
    Promise.all([
        fetch('sensors.json').then(response => response.json()),
        fetch('classifications_rayosUV.json').then(response => response.json())
    ])
    .then(([sensors, classifications]) => {
        // Función para obtener el color según la clasificación
        function getColor(classification) {
            switch (classification) {
                case 'Baja': return 'green';
                case 'Moderada': return 'yellow';
                case 'Alta': return 'orange';
                case 'Muy alta': return 'red';
                case 'Extremadamente alta': return 'purple';
                default: return 'lightblue';
            }
        }

        // Añadir los pines al mapa como puntos con borde azul por defecto
        sensors.forEach(sensor => {
            var classification = classifications[sensor.id] || 'unknown';

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

            // Evento para mostrar sugerencias al hacer clic en el nodo
            circleMarker.on('click', function () {
                var suggestionBox = document.getElementById('suggestions');
                var suggestionsContent = suggestions[classification] ? `<ul>${suggestions[classification].map(item => `<li>${item}</li>`).join('')}</ul>` : 'No hay sugerencias para esta clasificación.';
                suggestionBox.innerHTML = `<b>Sugerencias para clasificación ${classification}:</b><br>${suggestionsContent}`;

                // Desplazar la página al contenedor de sugerencias
                suggestionBox.scrollIntoView({ behavior: 'smooth' });
            });
        });
    })
    .catch(error => console.error('Error cargando los datos:', error));
});
