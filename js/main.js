const map = L.map('map').setView([46.603354, 1.888334], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

const iconAgence = L.icon({
    iconUrl: 'images/logo_NGE_cmjn.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

const iconWater = L.icon({
    iconUrl: 'images/logo_cycle.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

const iconRevema = L.icon({
    iconUrl: 'images/logo_revema.svg',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

const markersAgence = L.markerClusterGroup();
const markersWater = L.markerClusterGroup();
const markersRevema = L.markerClusterGroup();

fetch('données/agence_V1.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, { icon: iconAgence });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    const props = feature.properties;
                    const popupContent = `
                        <div class="popup-title">
                            ${props.Ville || 'Agence'}
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">Adresse:</span>
                            <span>${props.Adresse || 'Non renseigné'}</span>
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">Code postal:</span>
                            <span>${props.CP || 'Non renseigné'}</span>
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                }
                markersAgence.addLayer(layer);
            }
        });
        map.addLayer(markersAgence);
    });

fetch('données/cycle_eau_V1.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, { icon: iconWater });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties && feature.properties.Type_ouvrage) {
                    const props = feature.properties;
                    const popupContent = `
                        <div class="popup-title">
                            ${props.communes_nom || 'Ouvrage'}
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">Projet:</span>
                            <span>${props.nom_projet || 'Non renseigné'}</span>
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">Type:</span>
                            <span>${props.Type_ouvrage}</span>
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                }
                markersWater.addLayer(layer);
            }
        });
        map.addLayer(markersWater);
    });

// Gestion des filtres avec animations
document.getElementById('logoAgences').addEventListener('click', function() {
    const isActive = this.getAttribute('data-active') === 'true';
    const img = this.querySelector('img');
    
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
    
    if (isActive) {
        map.removeLayer(markersAgence);
        img.src = 'images/logo_NGE_gris.svg';
        this.setAttribute('data-active', 'false');
        this.style.opacity = '0.6';
    } else {
        map.addLayer(markersAgence);
        img.src = 'images/logo_NGE_cmjn.svg';
        this.setAttribute('data-active', 'true');
        this.style.opacity = '1';
    }
});

document.getElementById('logoWater').addEventListener('click', function() {
    const isActive = this.getAttribute('data-active') === 'true';
    const img = this.querySelector('img');
    
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
    
    if (isActive) {
        map.removeLayer(markersWater);
        img.src = 'images/logo_cycle_gris.svg';
        this.setAttribute('data-active', 'false');
        this.style.opacity = '0.6';
    } else {
        map.addLayer(markersWater);
        img.src = 'images/logo_cycle.svg';
        this.setAttribute('data-active', 'true');
        this.style.opacity = '1';
    }
});
fetch('données/revema_V1.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJSON(data, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, { icon: iconRevema });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    const props = feature.properties;
                    const popupContent = `
                        <div class="popup-title">
                            ${props.communes_nom || 'Site Revema'}
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">Projet:</span>
                            <span>${props.nom_projet || 'Non renseigné'}</span>
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">Type:</span>
                            <span>${props.Type_ouvrage || 'Non renseigné'}</span>
                        </div>
                        <div class="popup-info">
                            <span class="popup-label">ID Projet:</span>
                            <span>${props.ID_Projet || 'Non renseigné'}</span>
                        </div>
                    `;
                    layer.bindPopup(popupContent);
                }
                markersRevema.addLayer(layer);
            }
        });
        map.addLayer(markersRevema);
    });

document.getElementById('logoRevema').addEventListener('click', function() {
    const isActive = this.getAttribute('data-active') === 'true';
    const img = this.querySelector('img');
    
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
    
    if (isActive) {
        map.removeLayer(markersRevema);
        img.src = 'images/logo_revema_gris.svg';
        this.setAttribute('data-active', 'false');
        this.style.opacity = '0.6';
    } else {
        map.addLayer(markersRevema);
        img.src = 'images/logo_revema.svg';
        this.setAttribute('data-active', 'true');
        this.style.opacity = '1';
    }
});