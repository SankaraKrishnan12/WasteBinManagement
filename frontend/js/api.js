const BASE_URL = "http://localhost:5000/api";

// Helper function for POST requests
async function postData(url = '', data = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server responded with ${response.status}`);
  }
  return response.json();
}

export async function getHouseholds() {
  const res = await fetch(`${BASE_URL}/households`);
  return res.json();
}

// Sends a flat object matching the model
export async function createHousehold(householdData) {
  // Data is already flat from the form.
  // We just ensure the types are correct.
  const dataToSave = {
    ...householdData,
    lat: parseFloat(householdData.lat),
    lng: parseFloat(householdData.lng),
    waste_generated_per_day: parseFloat(householdData.waste_generated_per_day)
  };
  return postData(`${BASE_URL}/households`, dataToSave);
}

export async function getBins() {
  const res = await fetch(`${BASE_URL}/bins`);
  return res.json();
}

// Sends a flat object matching the model
export async function createBin(binData) {
  // Data is already flat from the form.
  // We just ensure the types are correct.
  const dataToSave = {
    ...binData,
    lat: parseFloat(binData.lat),
    lng: parseFloat(binData.lng),
    capacity: parseInt(binData.capacity)
  };
  return postData(`${BASE_URL}/bins`, dataToSave);
}

export async function getFarHouseholds() {
  const res = await fetch(`${BASE_URL}/analysis/far-households`);
  return res.json();
}

export async function suggestBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggest`, { method: "POST" });
  return res.json();
}

// New API functions for enriched entities
export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

export async function getVehicles() {
  const res = await fetch(`${BASE_URL}/vehicles`);
  return res.json();
}

export async function getCollections() {
  const res = await fetch(`${BASE_URL}/collections`);
  return res.json();
}

export async function getSensors() {
  const res = await fetch(`${BASE_URL}/sensors`);
  return res.json();
}

export async function getMaintenance() {
  const res = await fetch(`${BASE_URL}/maintenance`);
  return res.json();
}

export async function getRoutes() {
  const res = await fetch(`${BASE_URL}/routes`);
  return res.json();
}

export async function getWasteTypes() {
  const res = await fetch(`${BASE_URL}/waste-types`);
  return res.json();
}

export async function getAssignments() {
  const res = await fetch(`${BASE_URL}/assignments`);
  return res.json();
}

export async function getSuggestedBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggested`);
  return res.json();
}