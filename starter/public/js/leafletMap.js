/* eslint-disable */

// 1. A DEFINIÇÃO da função (SEM a palavra-chave 'export')

const displayMap = (locations) => {
  // Cria o mapa no elemento #map e desativa o zoom por rolagem

  const map = L.map('map', {
    scrollWheelZoom: false, // Mantido como FALSE, conforme seu pedido

    zoomAnimation: true,

    markerZoomAnimation: true,
  });

  // Adiciona o estilo de mapa (branco e gratuito - Carto Light)

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',

    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',

      maxZoom: 18,
    },
  ).addTo(map);

  // Cria um grupo de limites para ajustar o zoom automaticamente

  const bounds = L.latLngBounds();

  // Array para armazenar os marcadores (necessário para abrir o popup depois)

  const markers = [];

  // Percorre cada localização

  locations.forEach((loc, i) => {
    // OBS: Leaflet usa [lat, lng]

    const [lng, lat] = loc.coordinates;

    // Cria o ÍCONE PERSONALIZADO (Certifique-se de que os caminhos estão corretos!)

    const markerIcon = L.icon({
      iconUrl: '/img/leaflet/marker-icon.png',

      shadowUrl: '/img/leaflet/marker-shadow.png',

      iconSize: [25, 41],

      iconAnchor: [12, 41],

      popupAnchor: [1, -34],

      shadowSize: [41, 41],
    });

    // ...existing code...

    // Cria o marcador, adiciona ao mapa e faz o BIND do Popup

    // day pode estar ausente em alguns dados; fallback para índice + 1

    const day = typeof loc.day !== 'undefined' ? loc.day : i + 1;

    const marker = L.marker([lat, lng], { icon: markerIcon })

      .addTo(map)

      .bindPopup(`<p>Day ${day}: ${loc.description}</p>`, {
        autoClose: false,

        closeOnClick: false,
      });

    // Armazena o marcador no array

    markers.push(marker);

    // Adiciona o ponto ao limite

    bounds.extend([lat, lng]);
  });

  // ...existing code...

  map.fitBounds(bounds, {
    padding: [100, 100],

    animate: true,
  });

  // Abrir os popups somente após o mapa terminar o movimento/zoom

  // Usa 'moveend' que ocorre após a animação de fitBounds

  map.once('moveend', () => {
    markers.forEach((marker) => marker.openPopup());
  });
};

// 3. A CHAMADA da função (Essa parte estava faltando)

const mapElement = document.getElementById('map');

// Verifica se o elemento #map existe na página

if (mapElement) {
  try {
    // Pega os dados JSON do atributo 'data-locations' no HTML

    const locations = JSON.parse(mapElement.dataset.locations);

    // Inicializa o mapa com os dados

    displayMap(locations);
  } catch (err) {
    // erro silencioso
  }
}
