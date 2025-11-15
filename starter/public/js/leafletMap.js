/* eslint-disable */

export const displayMap = (locations) => {
  const map = L.map('map', {
    scrollWheelZoom: false,
    zoomAnimation: true,
    markerZoomAnimation: true,
  });

  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
    }
  ).addTo(map);

  const bounds = L.latLngBounds();
  const markers = [];

  locations.forEach((loc, i) => {
    const [lng, lat] = loc.coordinates;

    const markerIcon = L.icon({
      iconUrl: '/img/leaflet/marker-icon.png',
      shadowUrl: '/img/leaflet/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    const day = typeof loc.day !== 'undefined' ? loc.day : i + 1;

    const marker = L.marker([lat, lng], { icon: markerIcon })
      .addTo(map)
      .bindPopup(`<p>Day ${day}: ${loc.description}</p>`, {
        autoClose: false,
        closeOnClick: false,
      });

    markers.push(marker);
    bounds.extend([lat, lng]);
  });

  map.fitBounds(bounds, {
    padding: [100, 100],
    animate: true,
  });

  map.once('moveend', () => {
    markers.forEach((marker) => marker.openPopup());
  });
};
