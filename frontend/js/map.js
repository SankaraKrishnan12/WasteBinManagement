import {
  getHouseholds,
  getBins,
  getFarHouseholds,
  getSuggestedBins,
  // These imports are no longer needed here, but in ui.js
  // getUsers,
  // getVehicles,
  // ...etc
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
  farHouseholds: [],
  suggested: [],
};

// Helper to clear markers
function clearMarkers(type) {
  markers[type].forEach((m) => map.removeLayer(m));
  markers[type] = [];
}

// Load households and bins
async function loadData() {
  clearMarkers("households");
  clearMarkers("bins");

  const [households, bins] = await Promise.all([getHouseholds(), getBins()]);

  households.forEach((h) => {
    // Check if location exists and is valid JSON
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

  bins.forEach((b) => {
    // Check if location exists and is valid JSON
    if (b.location) {
      try {
        const { coordinates } = JSON.parse(b.location);
        const marker = L.circleMarker([coordinates[1], coordinates[0]], {
          color: "green",
          radius: 7,
        }).bindPopup(`<b>Bin:</b> ${b.id}<br>Capacity: ${b.capacity}`);
        marker.addTo(map);
        markers.bins.push(marker);
      } catch (e) {
        console.error("Invalid bin location format:", b.location);
      }
    }
  });
}

// Highlight far households
async function showFarHouseholds() {
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

async function suggestNewBins() {
  clearMarkers("suggested");

  const suggestions = await getSuggestedBins();

  suggestions.forEach((s) => {
    if (!s.location) return; // skip if location is null

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

// --- NEW: Exportable function to add a single marker ---
/**
 * Adds a new marker to the map.
 * @param {'household' | 'bin'} type The type of entity to add.
 * @param {object} entity The entity object (must have lat, lng, name/id, etc.)
 */
export function addMapMarker(type, entity) {
  let marker;
  // Note: entity.lat and entity.lng come from the form's hidden fields
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
  }
}


// -----------------------
// REMOVED Dynamic Add Bin Feature
// -----------------------
// This logic is now handled entirely in ui.js
// let addingBin = false;
// function startAddingBin() { ... }
// map.on("click", ...);


// Export functions for use in ui.js
window.loadData = loadData;
window.showFarHouseholds = showFarHouseholds;
window.suggestNewBins = suggestNewBins;
// window.startAddingBin = startAddingBin; // REMOVED

// Initial load
loadData();