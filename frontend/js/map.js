import {
  getHouseholds,
  getBins,
  getFarHouseholds,
  suggestBins,
  getUsers,
  getVehicles,
  getCollections,
  getSensors,
  getMaintenance,
  getRoutes,
  getWasteTypes,
  getAssignments,
  getSuggestedBins,
} from "./api.js";

// Initialize map
const map = L.map("map").setView([13.0827, 80.2707], 14);

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
    const { coordinates } = JSON.parse(h.location);
    const marker = L.circleMarker([coordinates[1], coordinates[0]], {
      color: "blue",
      radius: 5,
    }).bindPopup(`<b>House:</b> ${h.name}<br><b>Ward:</b> ${h.ward}`);
    marker.addTo(map);
    markers.households.push(marker);
  });

  bins.forEach((b) => {
    const { coordinates } = JSON.parse(b.location);
    const marker = L.circleMarker([coordinates[1], coordinates[0]], {
      color: "green",
      radius: 7,
    }).bindPopup(`<b>Bin:</b> ${b.id}<br>Capacity: ${b.capacity}`);
    marker.addTo(map);
    markers.bins.push(marker);
  });
}

// Highlight far households
async function showFarHouseholds() {
  clearMarkers("farHouseholds");
  const far = await getFarHouseholds();
  far.forEach((h) => {
    const { coordinates } = JSON.parse(h.location);
    const marker = L.circleMarker([coordinates[1], coordinates[0]], {
      color: "red",
      radius: 6,
    }).bindPopup(`<b>Far Household:</b> ${h.name}`);
    marker.addTo(map);
    markers.farHouseholds.push(marker);
  });
}

async function suggestNewBins() {
  clearMarkers("suggested");

  const suggestions = await getSuggestedBins();

  suggestions.forEach((s) => {
    if (!s.location) return; // skip if location is null

    const { coordinates } = JSON.parse(s.location);
    const marker = L.marker([coordinates[1], coordinates[0]])
      .addTo(map)
      .bindPopup(`<b>Suggested Bin</b><br>Reason: ${s.reason}`);
    markers.suggested.push(marker);
  });
}

// -----------------------
// Dynamic Add Bin Feature
// -----------------------
let addingBin = false;

function startAddingBin() {
  addingBin = !addingBin;
  alert(
    addingBin
      ? "Click on the map to add a new bin."
      : "Bin adding canceled."
  );
}

map.on("click", async (e) => {
  if (!addingBin) return;

  const { lat, lng } = e.latlng;

  const capacity = prompt("Enter bin capacity (kg):", "100");
  if (!capacity) return;

  try {
    const res = await fetch("http://localhost:5000/api/bins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, capacity: parseInt(capacity) }),
    });
    const newBin = await res.json();

    // Add marker on map
    const marker = L.circleMarker([lat, lng], {
      color: "green",
      radius: 7,
    }).bindPopup(`<b>Bin:</b> ${newBin.id}<br>Capacity: ${newBin.capacity}`);
    marker.addTo(map);
    markers.bins.push(marker);

    alert("Bin added successfully!");

    // Optional: recalc far households automatically
    showFarHouseholds();

  } catch (err) {
    console.error(err);
    alert("Error adding bin.");
  }

  addingBin = false; // Stop adding after one click
});

// Export functions for use in other modules
window.loadData = loadData;
window.showFarHouseholds = showFarHouseholds;
window.suggestNewBins = suggestNewBins;
window.startAddingBin = startAddingBin;

// Initial load
loadData();
