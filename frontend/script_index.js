document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map').setView([3.3600, -76.5319], 12); // Coordenadas de Cali
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sugerencias según la clasificación
    const suggestions = {
        'Buena': [
            'Disfruta actividades al aire libre sin preocupaciones.',
            'Ventila tu hogar para mantener el aire fresco.'
        ],
        'Moderada': [
            'Las personas sensibles (niños, ancianos y personas con problemas respiratorios) deben limitar el ejercicio prolongado al aire libre.',
            'Considera cerrar las ventanas si notas algún olor o polvo.'
        ],
        'Dañina a la salud para algunos grupos sensibles': [
            'Los grupos sensibles deben evitar actividades al aire libre.',
            'Utiliza purificadores de aire en interiores.',
            'Mantén cerradas las ventanas.'
        ],
        'Dañina para la salud': [
            'Todos deben limitar el tiempo al aire libre.',
            'Usa mascarillas si debes salir.',
            'Procura permanecer en interiores con aire purificado.'
        ],
        'Muy dañina para la salud': [
            'Evita cualquier actividad al aire libre.',
            'Usa sistemas de filtración de aire en tu hogar.',
            'Considera mudarte a un lugar con mejor calidad del aire temporalmente si es posible.'
        ],
        'Peligrosa': [
            'Permanece en interiores en todo momento.',
            'Utiliza sistemas avanzados de purificación de aire.',
            'Considera abandonar la zona si la situación persiste.'
        ]
    };

    // Emoticonos según la clasificación
    const emojis = {
        'Buena': '😊',
        'Moderada': '😐',
        'Dañina a la salud para algunos grupos sensibles': '😷',
        'Dañina para la salud': '😵',
        'Muy dañina para la salud': '🤢',
        'Peligrosa': '☠️'
    };

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
                case 'Peligrosa': return 'maroon';
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

                // Mostrar el emoticono correspondiente a la clasificación
                var emojiContainer = document.getElementById('emojiContainer');
                var classificationEmoji = document.getElementById('classificationEmoji');
                var emojiText = document.createElement('p');
                emojiText.classList.add('emoji-text'); // Clase CSS para estilizar el texto del emoticono

                if (emojis[classification]) {
                    classificationEmoji.src = `./emojis/${classification}.png`; // Cambia la ruta según tus imágenes de emoticonos
                    classificationEmoji.classList.remove('d-none');
                    emojiContainer.innerHTML = ''; // Limpiar el contenido previo
                    emojiText.textContent = emojis[classification];
                    emojiContainer.appendChild(classificationEmoji);
                    emojiContainer.appendChild(emojiText);
                } else {
                    classificationEmoji.classList.add('d-none');
                    emojiText.textContent = 'No hay emoticono para esta clasificación.';
                    emojiContainer.innerHTML = '';
                    emojiContainer.appendChild(emojiText);
                }
            });
        });
    })
    .catch(error => console.error('Error cargando los datos:', error));
});
