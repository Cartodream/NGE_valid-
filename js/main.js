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

// Groupes de marqueurs sans cluster
const markersAgenceNoCluster = L.layerGroup();
const markersWaterNoCluster = L.layerGroup();
const markersRevemaNoCluster = L.layerGroup();

// Variables pour stocker les données
let agenceData = null;
let waterData = null;
let revemaData = null;

// Variables pour les filtres de type d'ouvrage
let activeWaterFilters = {
    'RCU - Réseaux de chaleur urbains': true,
    'Canalisations': true,
    'Réservoir': true,
    'STEP - Station d\'\u00e9puration': true,
    'SDEP - Station de traitement d\'eau potable': true
};

// Fonction pour créer les marqueurs agences
function createAgenceMarkers(data, useCluster = true) {
    const group = useCluster ? markersAgence : markersAgenceNoCluster;
    group.clearLayers();
    
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
            group.addLayer(layer);
        }
    });
}

fetch('données/agence_V1.geojson')
    .then(response => response.json())
    .then(data => {
        agenceData = data;
        createAgenceMarkers(data, true);
        createAgenceMarkers(data, false);
        map.addLayer(markersAgence);
    });

// Fonction pour créer les marqueurs cycle de l'eau
function createWaterMarkers(data, useCluster = true) {
    const group = useCluster ? markersWater : markersWaterNoCluster;
    group.clearLayers();
    
    L.geoJSON(data, {
        filter: (feature) => {
            const typeOuvrage = feature.properties.Type_ouvrage;
            return activeWaterFilters[typeOuvrage] || false;
        },
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
            group.addLayer(layer);
        }
    });
}

fetch('données/cycle_eau_V1.geojson')
    .then(response => response.json())
    .then(data => {
        waterData = data;
        createWaterMarkers(data, true);
        createWaterMarkers(data, false);
        map.addLayer(markersWater);
    });

// Gestion des boutons à bascule pour le clustering
document.getElementById('toggle-agences').addEventListener('change', function() {
    const isChecked = this.checked;
    const logoFilter = document.getElementById('logoAgences');
    const isActive = logoFilter.getAttribute('data-active') === 'true';
    
    if (isActive) {
        map.removeLayer(markersAgence);
        map.removeLayer(markersAgenceNoCluster);
        
        if (isChecked) {
            map.addLayer(markersAgence);
        } else {
            map.addLayer(markersAgenceNoCluster);
        }
    }
});

document.getElementById('toggle-water').addEventListener('change', function() {
    const isChecked = this.checked;
    const logoFilter = document.getElementById('logoWater');
    const isActive = logoFilter.getAttribute('data-active') === 'true';
    
    if (isActive) {
        map.removeLayer(markersWater);
        map.removeLayer(markersWaterNoCluster);
        
        if (isChecked) {
            map.addLayer(markersWater);
        } else {
            map.addLayer(markersWaterNoCluster);
        }
    }
});

document.getElementById('toggle-revema').addEventListener('change', function() {
    const isChecked = this.checked;
    const logoFilter = document.getElementById('logoRevema');
    const isActive = logoFilter.getAttribute('data-active') === 'true';
    
    if (isActive) {
        map.removeLayer(markersRevema);
        map.removeLayer(markersRevemaNoCluster);
        
        if (isChecked) {
            map.addLayer(markersRevema);
        } else {
            map.addLayer(markersRevemaNoCluster);
        }
    }
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
        map.removeLayer(markersAgenceNoCluster);
        img.src = 'images/logo_NGE_gris.svg';
        this.setAttribute('data-active', 'false');
        this.style.opacity = '0.6';
    } else {
        const toggleChecked = document.getElementById('toggle-agences').checked;
        if (toggleChecked) {
            map.addLayer(markersAgence);
        } else {
            map.addLayer(markersAgenceNoCluster);
        }
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
        map.removeLayer(markersWaterNoCluster);
        img.src = 'images/logo_cycle_gris.svg';
        this.setAttribute('data-active', 'false');
        this.style.opacity = '0.6';
    } else {
        const toggleChecked = document.getElementById('toggle-water').checked;
        if (toggleChecked) {
            map.addLayer(markersWater);
        } else {
            map.addLayer(markersWaterNoCluster);
        }
        img.src = 'images/logo_cycle.svg';
        this.setAttribute('data-active', 'true');
        this.style.opacity = '1';
    }
});
// Fonction pour créer les marqueurs Revema
function createRevemaMarkers(data, useCluster = true) {
    const group = useCluster ? markersRevema : markersRevemaNoCluster;
    group.clearLayers();
    
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
            group.addLayer(layer);
        }
    });
}

fetch('données/revema_V1.geojson')
    .then(response => response.json())
    .then(data => {
        revemaData = data;
        createRevemaMarkers(data, true);
        createRevemaMarkers(data, false);
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
        map.removeLayer(markersRevemaNoCluster);
        img.src = 'images/logo_revema_gris.svg';
        this.setAttribute('data-active', 'false');
        this.style.opacity = '0.6';
    } else {
        const toggleChecked = document.getElementById('toggle-revema').checked;
        if (toggleChecked) {
            map.addLayer(markersRevema);
        } else {
            map.addLayer(markersRevemaNoCluster);
        }
        img.src = 'images/logo_revema.svg';
        this.setAttribute('data-active', 'true');
        this.style.opacity = '1';
    }
});

// Mini carte de la Réunion
const minimapReunion = L.map('minimap-container', {
    zoomControl: false,
    attributionControl: false,
    dragging: true,
    touchZoom: true,
    doubleClickZoom: true,
    scrollWheelZoom: true,
    boxZoom: false,
    keyboard: true
}).setView([-21.1151, 55.5364], 9);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(minimapReunion);

// Ajouter les marqueurs de la Réunion à la mini carte
const addReunionMarkers = () => {
    // Marqueurs Agences pour la Réunion
    fetch('données/agence_V1.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                filter: (feature) => {
                    const coords = feature.geometry.coordinates;
                    return coords[0] >= 55.2 && coords[0] <= 55.8 && coords[1] >= -21.4 && coords[1] <= -20.8;
                },
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
                        `;
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(minimapReunion);
        });

    // Marqueurs Cycle de l'eau pour la Réunion
    fetch('données/cycle_eau_V1.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                filter: (feature) => {
                    const coords = feature.geometry.coordinates;
                    return coords[0] >= 55.2 && coords[0] <= 55.8 && coords[1] >= -21.4 && coords[1] <= -20.8;
                },
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, { icon: iconWater });
                },
                onEachFeature: (feature, layer) => {
                    if (feature.properties) {
                        const props = feature.properties;
                        const popupContent = `
                            <div class="popup-title">
                                ${props.communes_nom || 'Ouvrage'}
                            </div>
                            <div class="popup-info">
                                <span class="popup-label">Type:</span>
                                <span>${props.Type_ouvrage}</span>
                            </div>
                        `;
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(minimapReunion);
        });

    // Marqueurs Revema pour la Réunion
    fetch('données/revema_V1.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                filter: (feature) => {
                    const coords = feature.geometry.coordinates;
                    return coords[0] >= 55.2 && coords[0] <= 55.8 && coords[1] >= -21.4 && coords[1] <= -20.8;
                },
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
                                <span class="popup-label">Type:</span>
                                <span>${props.Type_ouvrage || 'Non renseigné'}</span>
                            </div>
                        `;
                        layer.bindPopup(popupContent);
                    }
                }
            }).addTo(minimapReunion);
        });
};

addReunionMarkers();

// Gestion des sous-filtres pour le cycle de l'eau
document.getElementById('filter-rcu').addEventListener('change', function() {
    activeWaterFilters['RCU - Réseaux de chaleur urbains'] = this.checked;
    updateWaterMarkers();
});

document.getElementById('filter-canalisations').addEventListener('change', function() {
    activeWaterFilters['Canalisations'] = this.checked;
    updateWaterMarkers();
});

document.getElementById('filter-reservoir').addEventListener('change', function() {
    activeWaterFilters['Réservoir'] = this.checked;
    updateWaterMarkers();
});

document.getElementById('filter-step').addEventListener('change', function() {
    activeWaterFilters['STEP - Station d\'\u00e9puration'] = this.checked;
    updateWaterMarkers();
});

document.getElementById('filter-sdep').addEventListener('change', function() {
    activeWaterFilters['SDEP - Station de traitement d\'eau potable'] = this.checked;
    updateWaterMarkers();
});

// Fonction pour mettre à jour les marqueurs cycle de l'eau
function updateWaterMarkers() {
    if (waterData) {
        const logoFilter = document.getElementById('logoWater');
        const isActive = logoFilter.getAttribute('data-active') === 'true';
        const useCluster = document.getElementById('toggle-water').checked;
        
        if (isActive) {
            map.removeLayer(markersWater);
            map.removeLayer(markersWaterNoCluster);
            
            createWaterMarkers(waterData, true);
            createWaterMarkers(waterData, false);
            
            if (useCluster) {
                map.addLayer(markersWater);
            } else {
                map.addLayer(markersWaterNoCluster);
            }
        }
    }
}

// Gestion de l'expansion/réduction des sous-filtres
document.getElementById('water-expand-arrow').addEventListener('click', function(e) {
    e.stopPropagation(); // Empêche le clic de se propager au filtre parent
    
    const subFilters = document.getElementById('water-sub-filters');
    const arrow = this;
    
    if (subFilters.classList.contains('collapsed')) {
        // Ouvrir
        subFilters.classList.remove('collapsed');
        arrow.classList.remove('collapsed');
        arrow.querySelector('span').innerHTML = '▼';
    } else {
        // Fermer
        subFilters.classList.add('collapsed');
        arrow.classList.add('collapsed');
        arrow.querySelector('span').innerHTML = '▶';
    }
});