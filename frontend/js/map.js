import {
  getHouseholds,
  getBins,
  getVehicles,
  getFarHouseholds,
  getSuggestedBins,
  getBinsForRoute,
} from "./api.js";

// Initialize map and EXPORT it so ui.js can use it
export const map = L.map("map").setView([13.0827, 80.2707], 14);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "© OpenStreetMap contributors",
}).addTo(map);

// Marker storage
const markers = {
  households: [],
  bins: [],
  vehicles: [],
  maintenance: [],
  routeBins: [], // ADDED for maintenance bins
  farHouseholds: [],
  suggested: [],
};

// Helper to clear markers - NOW EXPORTED
export function clearMarkers(type) {
  if (markers[type]) {
    markers[type].forEach((m) => map.removeLayer(m));
    markers[type] = [];
  } else {
    console.warn(`Marker type "${type}" does not exist to clear.`);
  }
}
// --- NEW FUNCTION to clear all layers ---
export function clearAllLayers() {
  Object.keys(markers).forEach(type => {
    clearMarkers(type);
  });
}

// --- NEW FUNCTION ---
// Loads and displays the bins for a specific route
export async function loadRouteBins(routeId) {
  clearAllLayers(); // Clear everything from the map
  
  try {
    const bins = await getBinsForRoute(routeId);
    if (!bins || bins.length === 0) {
      alert('This route has no bins assigned.');
      return;
    }

    const markerGroup = []; // To calculate bounds
    bins.forEach(bin => {
      if (bin.location) {
        try {
          const { coordinates } = JSON.parse(bin.location);
          // Create a custom numbered icon
          const icon = L.divIcon({
            className: 'route-bin-icon',
            html: `<span>${bin.sequence_order}</span>`, // Show sequence number
          });

          const marker = L.marker([coordinates[1], coordinates[0]], {
            icon: icon,
          }).bindPopup(`<b>Sequence: ${bin.sequence_order}</b><br>Bin ID: ${bin.bin_id}<br>Status: ${bin.status}`);
          
          marker.addTo(map);
          markers.routeBins.push(marker);
          markerGroup.push([coordinates[1], coordinates[0]]);
        } catch (e) {
          console.error("Invalid bin location format:", bin.location);
        }
      }
    });

    // Zoom the map to fit all bins in the route
    if (markerGroup.length > 0) {
      map.fitBounds(markerGroup);
    }

  } catch (err) {
    console.error(`Error loading route bins: ${err.message}`);
    alert(`Could not load bins for route ${routeId}.`);
  }
}
// Load households
export async function loadHouseholdMarkers() {
  clearMarkers("households");
  const households = await getHouseholds();

  households.forEach((h) => {
    if (h.location) {
      try {
        const { coordinates } = JSON.parse(h.location);
        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
          color: "blue",
          radius: 5,
        }).bindPopup(`<b>House:</b> ${h.name}<br><b>Ward:</b> ${h.ward}`);
        marker.addTo(map);
        markers.households.push(marker);
      } catch (e) {
        console.error("Invalid household location format:", h.location);
      }
    }
  });
}

// Load bins
export async function loadBinMarkers() {
  clearMarkers("bins");
  const bins = await getBins();

  bins.forEach((b) => {
    if (b.location) {
      try {
        const { coordinates } = JSON.parse(b.location);
        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
          color: "green", // Standard bin color
          radius: 7,
        }).bindPopup(`<b>Bin:</b> ${b.id}<br>Capacity: ${b.capacity}<br>Status: ${b.status}`);
        marker.addTo(map);
        markers.bins.push(marker);
      } catch (e) {
        console.error("Invalid bin location format:", b.location);
      }
    }
  });
}

// --- NEW FUNCTION ---
// Load ONLY bins that are marked for maintenance
export async function loadMaintenanceMarkers() {
  clearMarkers("maintenance");
  const allBins = await getBins(); // Get all bins
  
  // Filter for bins in maintenance
  const maintBins = allBins.filter(b => b.status === 'maintenance'); 

  maintBins.forEach((b) => {
    if (b.location) {
      try {
        const { coordinates } = JSON.parse(b.location);
        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
          color: "orange", // Use orange for maintenance
          fillColor: "#ffA500",
          fillOpacity: 0.8,
          radius: 7,
        }).bindPopup(`<b>Bin (Maintenance):</b> ${b.id}<br>Status: ${b.status}`);
        marker.addTo(map);
        markers.maintenance.push(marker);
      } catch (e) {
        console.error("Invalid bin location format:", b.location);
      }
    }
  });
}


// Load vehicles
export async function loadVehicleMarkers() {
  clearMarkers("vehicles");
  const vehicles = await getVehicles();

  vehicles.forEach((v) => {
    // Check for the location property
    if (v.location) {
      try {
        const { coordinates } = JSON.parse(v.location);
        // Using a different marker for vehicles
        const icon = L.divIcon({ className: 'vehicle-icon', html: '🚚' });
        const marker = L.marker([coordinates[1], coordinates[0]], {
          icon: icon,
        }).bindPopup(`<b>Vehicle:</b> ${v.license_plate}<br>Status: ${v.status}`);
        marker.addTo(map);
        markers.vehicles.push(marker);
      } catch (e) {
        console.error("Invalid vehicle location format:", v.location);
      }
    }
  });
}


// Highlight far households
export async function showFarHouseholds() {
  clearMarkers("farHouseholds");
  const far = await getFarHouseholds();
  far.forEach((h) => {
    if (h.location) {
      try {
        const { coordinates } = JSON.parse(h.location);
        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
          color: "red",
          radius: 6,
        }).bindPopup(`<b>Far Household:</b> ${h.name}`);
        marker.addTo(map);
        markers.farHouseholds.push(marker);
      } catch (e) {
        console.error("Invalid far household location:", h.location);
      }
    }
  });
}

// Suggest new bins
export async function suggestNewBins() {
  clearMarkers("suggested");
  const suggestions = await getSuggestedBins();

  suggestions.forEach((s) => {
    if (!s.location) return; 

    try {
      const { coordinates } = JSON.parse(s.location);
      const marker = L.marker([coordinates[1], coordinates[0]])
        .addTo(map)
        .bindPopup(`<b>Suggested Bin</b><br>Reason: ${s.reason}`);
      markers.suggested.push(marker);
    } catch (e) {
      console.error("Invalid suggested bin location:", s.location);
    }
  });
}

/**
 * Adds a new marker to the map.
 * @param {'household' | 'bin' | 'vehicle'} type The type of entity to add.
 * @param {object} entity The entity object (must have lat, lng, name/id, etc.)
 */
export function addMapMarker(type, entity) {
  let marker;
  const lat = parseFloat(entity.lat);
  const lng = parseFloat(entity.lng);

  if (isNaN(lat) || isNaN(lng)) {
    console.error("Invalid lat/lng for new marker:", entity);
    return;
  }

  if (type === 'household') {
    marker = L.circleMarker([lat, lng], {
      color: "blue",
      radius: 5,
    }).bindPopup(`<b>House:</b> ${entity.name}<br><b>Ward:</b> ${entity.ward}`);
    marker.addTo(map);
    markers.households.push(marker);
  } else if (type === 'bin') {
    marker = L.circleMarker([lat, lng], {
      color: "green",
      radius: 7,
    }).bindPopup(`<b>Bin:</b> ${entity.id}<br>Capacity: ${entity.capacity}`);
    marker.addTo(map);
    markers.bins.push(marker);
  } else if (type === 'vehicle') {
    const icon = L.divIcon({ className: 'vehicle-icon', html: '🚚' });
    marker = L.marker([lat, lng], {
      icon: icon,
    }).bindPopup(`<b>Vehicle:</b> ${entity.license_plate}<br>Status: ${entity.status}`);
    marker.addTo(map);
    markers.vehicles.push(marker);
  }
}

// Export functions for use in ui.js
window.showFarHouseholds = showFarHouseholds;
window.suggestNewBins = suggestNewBins;