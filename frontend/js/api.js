const BASE_URL = "http://localhost:5000/api";

// Helper function for POST, PUT, DELETE
async function requestData(url = '', method = 'POST', data = {}) {
  const config = {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },
  };

  if (method !== 'DELETE') {
    config.body = JSON.stringify(data);
  }

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Server responded with ${response.status}`);
  }

  // DELETE requests might not return JSON, handle that
  if (method === 'DELETE') {
    return { success: true };
  }
  
  return response.json();
}

// --- Households ---

export async function getHouseholds() {
  const res = await fetch(`${BASE_URL}/households`);
  return res.json();
}

export async function getHouseholdById(id) {
  const res = await fetch(`${BASE_URL}/households/${id}`);
  return res.json();
}

export async function createHousehold(householdData) {
  const dataToSave = {
    ...householdData,
    lat: parseFloat(householdData.lat),
    lng: parseFloat(householdData.lng),
    waste_generated_per_day: parseFloat(householdData.waste_generated_per_day)
  };
  return requestData(`${BASE_URL}/households`, 'POST', dataToSave);
}

export async function updateHousehold(id, householdData) {
  const dataToSave = {
    ...householdData,
    lat: parseFloat(householdData.lat),
    lng: parseFloat(householdData.lng),
    waste_generated_per_day: parseFloat(householdData.waste_generated_per_day)
  };
  return requestData(`${BASE_URL}/households/${id}`, 'PUT', dataToSave);
}

export async function deleteHousehold(id) {
  return requestData(`${BASE_URL}/households/${id}`, 'DELETE');
}

// --- Bins ---

export async function getBins() {
  const res = await fetch(`${BASE_URL}/bins`);
  return res.json();
}

export async function getBinById(id) {
  const res = await fetch(`${BASE_URL}/bins/${id}`);
  return res.json();
}

export async function createBin(binData) {
  const dataToSave = {
    ...binData,
    lat: parseFloat(binData.lat),
    lng: parseFloat(binData.lng),
    capacity: parseInt(binData.capacity),
    fill_level: binData.fill_level ? parseInt(binData.fill_level) : 0
  };
  return requestData(`${BASE_URL}/bins`, 'POST', dataToSave);
}

export async function updateBin(id, binData) {
  const dataToSave = {
    ...binData,
    lat: parseFloat(binData.lat),
    lng: parseFloat(binData.lng),
    capacity: parseInt(binData.capacity),
    fill_level: binData.fill_level ? parseInt(binData.fill_level) : 0
  };
  return requestData(`${BASE_URL}/bins/${id}`, 'PUT', dataToSave);
}

export async function deleteBin(id) {
  return requestData(`${BASE_URL}/bins/${id}`, 'DELETE');
}

// --- Other Entities ---

export async function getFarHouseholds() {
  const res = await fetch(`${BASE_URL}/analysis/far-households`);
  return res.json();
}

export async function suggestBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggest`, { method: "POST" });
  return res.json();
}

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