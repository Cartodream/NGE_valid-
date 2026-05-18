const map = L.map('map').setView([46.603354, 1.888334], 6);

// Définition des différentes couches de tuiles
const tileLayers = {
    "OpenStreetMap": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }),
    "OpenStreetMap France": L.tileLayer('https://{s}.tile.openstreetmap.fr/osmfr/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap France | © OpenStreetMap contributors'
    }),
    "CartoDB Positron": L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
    }),
    "CartoDB Dark Matter": L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO'
    }),
    "OpenTopoMap": L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)'
    })
};

// Ajouter la couche par défaut
tileLayers["OpenStreetMap"].addTo(map);

// Ajouter le contrôle des couches en bas à gauche
const layerControl = L.control.layers(tileLayers, null, {
    position: 'bottomleft',
    collapsed: false
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
    iconSize: [80, 80],
    iconAnchor: [40, 40],
    popupAnchor: [0, -40]
});

const iconFerroviaire = L.icon({
    iconUrl: 'images/logo_ferroviaire.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

const markersAgence = L.markerClusterGroup();
const markersWater = L.markerClusterGroup();
const markersRevema = L.markerClusterGroup();
const markersFerroviaire = L.markerClusterGroup();

// Cluster global pour regrouper tous les types ensemble
const globalCluster = L.markerClusterGroup({
    maxClusterRadius: 55,
    disableClusteringAtZoom: 15,
    iconCreateFunction: function(cluster) {
        const childCount = cluster.getChildCount();
        let size, className;
        
        // Définir la taille en fonction du nombre d'entités
        if (childCount < 5) {
            size = 30;
            className = 'marker-cluster-small';
        } else if (childCount < 15) {
            size = 40;
            className = 'marker-cluster-medium';
        } else if (childCount < 30) {
            size = 50;
            className = 'marker-cluster-large';
        } else {
            size = 60;
            className = 'marker-cluster-xlarge';
        }
        
        return new L.DivIcon({
            html: '<div><span>' + childCount + '</span></div>',
            className: 'marker-cluster ' + className,
            iconSize: new L.Point(size, size),
            iconAnchor: new L.Point(size/2, size/2)
        });
    }
});

// Groupes de marqueurs sans cluster
const markersAgenceNoCluster = L.layerGroup();
const markersWaterNoCluster = L.layerGroup();
const markersRevemaNoCluster = L.layerGroup();
const markersFerroviaireNoCluster = L.layerGroup();

// Variables pour suivre l'état de chaque couche
let layerStates = {
    agence: { active: true, clustered: true },
    water: { active: true, clustered: true },
    revema: { active: true, clustered: true },
    ferroviaire: { active: true, clustered: true }
};

// Variable globale pour l'état des clusters
let globalClusterEnabled = true;

// Variables pour stocker les données
let agenceData = null;
let waterData = null;
let revemaData = null;
let ferroviaireData = null;

// Variables pour les filtres de type d'ouvrage
let activeWaterFilters = {
    'RCU - Réseaux de chaleur urbains': true,
    'Canalisations': true,
    'Réservoir': true,
    'STEP - Station d\'\u00e9puration': true,
    'SDEP - Station de traitement d\'eau potable': true
};

// Fonction pour mettre à jour l'affichage des couches
function updateLayerDisplay() {
    // Retirer toutes les couches
    map.removeLayer(globalCluster);
    map.removeLayer(markersAgenceNoCluster);
    map.removeLayer(markersWaterNoCluster);
    map.removeLayer(markersRevemaNoCluster);
    map.removeLayer(markersFerroviaireNoCluster);
    
    // Vider le cluster global
    globalCluster.clearLayers();
    
    // Ajouter les couches actives selon l'état global des clusters
    if (layerStates.agence.active) {
        if (globalClusterEnabled) {
            // Ajouter au cluster global
            markersAgenceNoCluster.eachLayer(layer => globalCluster.addLayer(layer));
        } else {
            // Ajouter individuellement
            map.addLayer(markersAgenceNoCluster);
        }
    }
    
    if (layerStates.water.active) {
        if (globalClusterEnabled) {
            // Ajouter au cluster global
            markersWaterNoCluster.eachLayer(layer => globalCluster.addLayer(layer));
        } else {
            // Ajouter individuellement
            map.addLayer(markersWaterNoCluster);
        }
    }
    
    if (layerStates.revema.active) {
        if (globalClusterEnabled) {
            // Ajouter au cluster global
            markersRevemaNoCluster.eachLayer(layer => globalCluster.addLayer(layer));
        } else {
            // Ajouter individuellement
            map.addLayer(markersRevemaNoCluster);
        }
    }
    
    if (layerStates.ferroviaire.active) {
        if (globalClusterEnabled) {
            // Ajouter au cluster global
            markersFerroviaireNoCluster.eachLayer(layer => globalCluster.addLayer(layer));
        } else {
            // Ajouter individuellement
            map.addLayer(markersFerroviaireNoCluster);
        }
    }
    
    // Ajouter le cluster global s'il contient des marqueurs et si les clusters sont activés
    if (globalClusterEnabled && globalCluster.getLayers().length > 0) {
        map.addLayer(globalCluster);
    }
}
// Fonction pour créer les marqueurs agences
function createAgenceMarkers(data) {
    markersAgenceNoCluster.clearLayers();
    
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
                `;
                layer.bindPopup(popupContent);
            }
            markersAgenceNoCluster.addLayer(layer);
        }
    });
}

fetch('données/agence_V1.geojson')
    .then(response => response.json())
    .then(data => {
        agenceData = data;
        createAgenceMarkers(data);
        updateLayerDisplay();
    });

// Fonction pour créer les marqueurs cycle de l'eau
function createWaterMarkers(data) {
    markersWaterNoCluster.clearLayers();
    
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
            markersWaterNoCluster.addLayer(layer);
        }
    });
}

fetch('données/cycle_eau_V1.geojson')
    .then(response => response.json())
    .then(data => {
        waterData = data;
        createWaterMarkers(data);
        updateLayerDisplay();
    });

// Gestion du bouton cluster global
document.getElementById('cluster-toggle-btn').addEventListener('click', function() {
    globalClusterEnabled = !globalClusterEnabled;
    
    // Mettre à jour le texte du bouton et sa classe CSS
    if (globalClusterEnabled) {
        this.textContent = 'Désactiver les clusters';
        this.classList.remove('disabled');
    } else {
        this.textContent = 'Activer les clusters';
        this.classList.add('disabled');
    }
    
    // Mettre à jour l'affichage
    updateLayerDisplay();
});

// Gestion des boutons on/off pour l'activation/désactivation des couches
document.getElementById('toggle-agences').addEventListener('change', function() {
    layerStates.agence.active = this.checked;
    const logoElement = document.getElementById('logoAgences');
    const img = logoElement.querySelector('img');
    
    if (this.checked) {
        img.src = 'images/logo_NGE_cmjn.svg';
        logoElement.setAttribute('data-active', 'true');
        logoElement.style.opacity = '1';
    } else {
        img.src = 'images/logo_NGE_gris.svg';
        logoElement.setAttribute('data-active', 'false');
        logoElement.style.opacity = '0.6';
    }
    updateLayerDisplay();
});

document.getElementById('toggle-water').addEventListener('change', function() {
    layerStates.water.active = this.checked;
    const logoElement = document.getElementById('logoWater');
    const img = logoElement.querySelector('img');
    
    // Mettre à jour l'apparence de la catégorie principale
    if (this.checked) {
        img.src = 'images/logo_cycle.svg';
        logoElement.setAttribute('data-active', 'true');
        logoElement.style.opacity = '1';
    } else {
        img.src = 'images/logo_cycle_gris.svg';
        logoElement.setAttribute('data-active', 'false');
        logoElement.style.opacity = '0.6';
    }
    
    // Mettre à jour l'apparence des sous-catégories
    const subCategories = ['filter-rcu', 'filter-canalisations', 'filter-reservoir', 'filter-step', 'filter-sdep'];
    subCategories.forEach(id => {
        const iconElement = document.getElementById(id).parentElement;
        const icon = iconElement.querySelector('.sub-filter-icon');
        
        if (this.checked) {
            // Si la catégorie principale est activée, restaurer l'état des mini boutons
            const miniToggleId = 'sub-toggle-' + id.replace('filter-', '');
            const miniToggle = document.getElementById(miniToggleId);
            if (miniToggle && miniToggle.checked) {
                icon.style.opacity = '1';
                icon.style.filter = 'grayscale(0%)';
            } else {
                icon.style.opacity = '0.4';
                icon.style.filter = 'grayscale(100%)';
            }
        } else {
            // Si la catégorie principale est désactivée, griser toutes les sous-catégories
            icon.style.opacity = '0.4';
            icon.style.filter = 'grayscale(100%)';
        }
    });
    
    updateLayerDisplay();
});

document.getElementById('toggle-revema').addEventListener('change', function() {
    layerStates.revema.active = this.checked;
    const logoElement = document.getElementById('logoRevema');
    const img = logoElement.querySelector('img');
    
    if (this.checked) {
        img.src = 'images/logo_revema.svg';
        logoElement.setAttribute('data-active', 'true');
        logoElement.style.opacity = '1';
    } else {
        img.src = 'images/logo_revema_gris.svg';
        logoElement.setAttribute('data-active', 'false');
        logoElement.style.opacity = '0.6';
    }
    updateLayerDisplay();
});

document.getElementById('toggle-ferroviaire').addEventListener('change', function() {
    layerStates.ferroviaire.active = this.checked;
    const logoElement = document.getElementById('logoFerroviaire');
    const img = logoElement.querySelector('img');
    
    if (this.checked) {
        img.src = 'images/logo_ferroviaire.svg';
        logoElement.setAttribute('data-active', 'true');
        logoElement.style.opacity = '1';
    } else {
        img.src = 'images/logo_ferroviaire_gris.svg';
        logoElement.setAttribute('data-active', 'false');
        logoElement.style.opacity = '0.6';
    }
    updateLayerDisplay();
});

// Gestion des logos (effets visuels supprimés)
document.getElementById('logoAgences').addEventListener('click', function() {
    // Plus d'effet visuel
});

document.getElementById('logoWater').addEventListener('click', function() {
    // Plus d'effet visuel
});
// Fonction pour créer les marqueurs Revema
function createRevemaMarkers(data) {
    markersRevemaNoCluster.clearLayers();
    
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
                `;
                layer.bindPopup(popupContent);
            }
            markersRevemaNoCluster.addLayer(layer);
        }
    });
}

fetch('données/revema_V1.geojson')
    .then(response => response.json())
    .then(data => {
        revemaData = data;
        createRevemaMarkers(data);
        updateLayerDisplay();
    });

// Fonction pour créer les marqueurs Ferroviaire
function createFerroviaireMarkers(data) {
    markersFerroviaireNoCluster.clearLayers();
    
    L.geoJSON(data, {
        pointToLayer: (feature, latlng) => {
            return L.marker(latlng, { icon: iconFerroviaire });
        },
        onEachFeature: (feature, layer) => {
            if (feature.properties) {
                const props = feature.properties;
                const popupContent = `
                    <div class="popup-title">
                        ${props.communes_nom || props.Ville || 'Site Ferroviaire'}
                    </div>
                    <div class="popup-info">
                        <span class="popup-label">Projet:</span>
                        <span>${props.nom_projet || props.Nom || 'Non renseigné'}</span>
                    </div>
                `;
                layer.bindPopup(popupContent);
            }
            markersFerroviaireNoCluster.addLayer(layer);
        }
    });
}

fetch('données/ferroviaire_V1.geojson')
    .then(response => response.json())
    .then(data => {
        ferroviaireData = data;
        createFerroviaireMarkers(data);
        updateLayerDisplay();
    });

document.getElementById('logoRevema').addEventListener('click', function() {
    // Plus d'effet visuel
});

document.getElementById('logoFerroviaire').addEventListener('click', function() {
    // Plus d'effet visuel
});

// Mini carte avec système de basculement
let currentMinimapPosition = 'reunion'; // 'reunion' ou 'france'

const positions = {
    reunion: {
        coords: [-21.1151, 55.5364],
        zoom: 9,
        mainMapCoords: [-21.1151, 55.5364],
        mainMapZoom: 9
    },
    france: {
        coords: [46.603354, 1.888334],
        zoom: 5,
        mainMapCoords: [46.603354, 1.888334],
        mainMapZoom: 6
    }
};

const minimapReunion = L.map('minimap-container', {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false
}).setView(positions.reunion.coords, positions.reunion.zoom);

// Ajouter la même couche que la carte principale à la minimap
let currentMinimapTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(minimapReunion);

// Écouter les changements de couche sur la carte principale
map.on('baselayerchange', function(e) {
    // Retirer l'ancienne couche de la minimap
    minimapReunion.removeLayer(currentMinimapTileLayer);
    
    // Ajouter la nouvelle couche à la minimap
    const newLayerUrl = e.layer._url;
    const newLayerOptions = {
        attribution: e.layer.options.attribution
    };
    
    currentMinimapTileLayer = L.tileLayer(newLayerUrl, newLayerOptions).addTo(minimapReunion);
});

// Fonction pour basculer entre les positions
function switchMinimapPosition() {
    const currentPos = positions[currentMinimapPosition];
    
    // FlyTo sur la carte principale
    map.flyTo(currentPos.mainMapCoords, currentPos.mainMapZoom);
    
    // Nettoyer les layers avant de basculer
    minimapReunion.removeLayer(minimapClusters);
    
    // Basculer vers l'autre position
    currentMinimapPosition = currentMinimapPosition === 'reunion' ? 'france' : 'reunion';
    const newPos = positions[currentMinimapPosition];
    
    // Mettre à jour la minimap
    minimapReunion.setView(newPos.coords, newPos.zoom);
    
    // Recharger les marqueurs pour la nouvelle position
    loadMinimapMarkers();
}

// Ajouter l'événement de clic
minimapReunion.on('click', switchMinimapPosition);

// Ajouter l'événement de clic sur l'overlay HTML
document.getElementById('minimap-overlay').addEventListener('click', switchMinimapPosition);

// Groupe de marqueurs pour la minimap
let minimapMarkers = L.layerGroup().addTo(minimapReunion);
let minimapClusters = L.markerClusterGroup({
    maxClusterRadius: 50,
    zoomToBoundsOnClick: false,
    showCoverageOnHover: false
});

// Fonction pour charger les marqueurs selon la position actuelle
const loadMinimapMarkers = () => {
    minimapMarkers.clearLayers();
    minimapClusters.clearLayers();
    
    const isReunion = currentMinimapPosition === 'reunion';
    
    // Marqueurs Agences (seulement les agences dans la minimap)
    fetch('données/agence_V1.geojson')
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                filter: (feature) => {
                    const coords = feature.geometry.coordinates;
                    if (isReunion) {
                        return coords[0] >= 55.2 && coords[0] <= 55.8 && coords[1] >= -21.4 && coords[1] <= -20.8;
                    } else {
                        return coords[0] >= -5 && coords[0] <= 10 && coords[1] >= 41 && coords[1] <= 52;
                    }
                },
                pointToLayer: (feature, latlng) => {
                    return L.marker(latlng, { 
                        icon: iconAgence,
                        interactive: false
                    });
                },
                onEachFeature: (feature, layer) => {
                    if (isReunion) {
                        minimapMarkers.addLayer(layer);
                    } else {
                        layer.options.interactive = false;
                        minimapClusters.addLayer(layer);
                    }
                }
            });
            
            if (!isReunion) {
                minimapReunion.addLayer(minimapClusters);
            }
        });
};

// Charger les marqueurs initiaux (Réunion avec tous les marqueurs)
loadMinimapMarkers();

// Gestion des mini boutons on/off pour les sous-catégories du cycle de l'eau
document.getElementById('sub-toggle-rcu').addEventListener('change', function() {
    activeWaterFilters['RCU - Réseaux de chaleur urbains'] = this.checked;
    const iconElement = document.getElementById('filter-rcu').parentElement;
    const icon = iconElement.querySelector('.sub-filter-icon');
    
    if (this.checked) {
        icon.style.opacity = '1';
        icon.style.filter = 'grayscale(0%)';
    } else {
        icon.style.opacity = '0.4';
        icon.style.filter = 'grayscale(100%)';
    }
    updateWaterMarkers();
});

document.getElementById('sub-toggle-canalisations').addEventListener('change', function() {
    activeWaterFilters['Canalisations'] = this.checked;
    const iconElement = document.getElementById('filter-canalisations').parentElement;
    const icon = iconElement.querySelector('.sub-filter-icon');
    
    if (this.checked) {
        icon.style.opacity = '1';
        icon.style.filter = 'grayscale(0%)';
    } else {
        icon.style.opacity = '0.4';
        icon.style.filter = 'grayscale(100%)';
    }
    updateWaterMarkers();
});

document.getElementById('sub-toggle-reservoir').addEventListener('change', function() {
    activeWaterFilters['Réservoir'] = this.checked;
    const iconElement = document.getElementById('filter-reservoir').parentElement;
    const icon = iconElement.querySelector('.sub-filter-icon');
    
    if (this.checked) {
        icon.style.opacity = '1';
        icon.style.filter = 'grayscale(0%)';
    } else {
        icon.style.opacity = '0.4';
        icon.style.filter = 'grayscale(100%)';
    }
    updateWaterMarkers();
});

document.getElementById('sub-toggle-step').addEventListener('change', function() {
    activeWaterFilters['STEP - Station d\'\u00e9puration'] = this.checked;
    const iconElement = document.getElementById('filter-step').parentElement;
    const icon = iconElement.querySelector('.sub-filter-icon');
    
    if (this.checked) {
        icon.style.opacity = '1';
        icon.style.filter = 'grayscale(0%)';
    } else {
        icon.style.opacity = '0.4';
        icon.style.filter = 'grayscale(100%)';
    }
    updateWaterMarkers();
});

document.getElementById('sub-toggle-sdep').addEventListener('change', function() {
    activeWaterFilters['SDEP - Station de traitement d\'eau potable'] = this.checked;
    const iconElement = document.getElementById('filter-sdep').parentElement;
    const icon = iconElement.querySelector('.sub-filter-icon');
    
    if (this.checked) {
        icon.style.opacity = '1';
        icon.style.filter = 'grayscale(0%)';
    } else {
        icon.style.opacity = '0.4';
        icon.style.filter = 'grayscale(100%)';
    }
    updateWaterMarkers();
});

// Gestion des sous-filtres pour le cycle de l'eau (anciens boutons - désactivés)
// Gestion des sous-filtres pour le cycle de l'eau (anciens boutons - désactivés)
document.getElementById('filter-rcu').addEventListener('change', function() {
    // Fonctionnalité transférée aux mini boutons on/off - plus d'effet visuel
});

document.getElementById('filter-canalisations').addEventListener('change', function() {
    // Fonctionnalité transférée aux mini boutons on/off - plus d'effet visuel
});

document.getElementById('filter-reservoir').addEventListener('change', function() {
    // Fonctionnalité transférée aux mini boutons on/off - plus d'effet visuel
});

document.getElementById('filter-step').addEventListener('change', function() {
    // Fonctionnalité transférée aux mini boutons on/off - plus d'effet visuel
});

document.getElementById('filter-sdep').addEventListener('change', function() {
    // Fonctionnalité transférée aux mini boutons on/off - plus d'effet visuel
});

// Fonction pour mettre à jour les marqueurs cycle de l'eau
function updateWaterMarkers() {
    if (waterData) {
        createWaterMarkers(waterData);
        updateLayerDisplay();
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