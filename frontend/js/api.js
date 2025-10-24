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

// --- Users ---

export async function getUsers() {
  const res = await fetch(`${BASE_URL}/users`);
  return res.json();
}

export async function getUserById(id) {
  const res = await fetch(`${BASE_URL}/users/${id}`);
  return res.json();
}

export async function createUser(userData) {
  // Note: Password should be hashed on the server, not here.
  return requestData(`${BASE_URL}/users`, 'POST', userData);
}

export async function updateUser(id, userData) {
  // Be careful about sending password hashes
  return requestData(`${BASE_URL}/users/${id}`, 'PUT', userData);
}

export async function deleteUser(id) {
  return requestData(`${BASE_URL}/users/${id}`, 'DELETE');
}

// --- Vehicles ---

export async function getVehicles() {
  const res = await fetch(`${BASE_URL}/vehicles`);
  return res.json();
}

export async function getVehicleById(id) {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`);
  return res.json();
}

export async function createVehicle(vehicleData) {
  const dataToSave = {
    ...vehicleData,
    lat: parseFloat(vehicleData.lat),
    lng: parseFloat(vehicleData.lng),
    capacity: parseFloat(vehicleData.capacity)
  };
  return requestData(`${BASE_URL}/vehicles`, 'POST', dataToSave);
}

export async function updateVehicle(id, vehicleData) {
  const dataToSave = {
    ...vehicleData,
    lat: parseFloat(vehicleData.lat),
    lng: parseFloat(vehicleData.lng),
    capacity: parseFloat(vehicleData.capacity)
  };
  return requestData(`${BASE_URL}/vehicles/${id}`, 'PUT', dataToSave);
}

export async function deleteVehicle(id) {
  return requestData(`${BASE_URL}/vehicles/${id}`, 'DELETE');
}

// --- Collections ---

export async function getCollections() {
  const res = await fetch(`${BASE_URL}/collections`);
  return res.json();
}

export async function getCollectionById(id) {
  const res = await fetch(`${BASE_URL}/collections/${id}`);
  return res.json();
}

export async function createCollection(collectionData) {
  const dataToSave = {
    ...collectionData,
    bin_id: parseInt(collectionData.bin_id),
    vehicle_id: parseInt(collectionData.vehicle_id),
    waste_amount_collected: parseFloat(collectionData.waste_amount_collected),
    waste_type_id: collectionData.waste_type_id ? parseInt(collectionData.waste_type_id) : null
  };
  return requestData(`${BASE_URL}/collections`, 'POST', dataToSave);
}

export async function updateCollection(id, collectionData) {
  const dataToSave = {
    ...collectionData,
    bin_id: parseInt(collectionData.bin_id),
    vehicle_id: parseInt(collectionData.vehicle_id),
    waste_amount_collected: parseFloat(collectionData.waste_amount_collected),
    waste_type_id: collectionData.waste_type_id ? parseInt(collectionData.waste_type_id) : null
  };
  return requestData(`${BASE_URL}/collections/${id}`, 'PUT', dataToSave);
}

export async function deleteCollection(id) {
  return requestData(`${BASE_URL}/collections/${id}`, 'DELETE');
}

// --- Sensors ---

export async function getSensors() {
  const res = await fetch(`${BASE_URL}/sensors`);
  return res.json();
}

export async function getSensorById(id) {
  const res = await fetch(`${BASE_URL}/sensors/${id}`);
  return res.json();
}

export async function createSensor(sensorData) {
  const dataToSave = {
    ...sensorData,
    bin_id: parseInt(sensorData.bin_id)
  };
  return requestData(`${BASE_URL}/sensors`, 'POST', dataToSave);
}

export async function updateSensor(id, sensorData) {
  const dataToSave = {
    ...sensorData,
    bin_id: parseInt(sensorData.bin_id)
  };
  return requestData(`${BASE_URL}/sensors/${id}`, 'PUT', dataToSave);
}

export async function deleteSensor(id) {
  return requestData(`${BASE_URL}/sensors/${id}`, 'DELETE');
}

// --- Maintenance ---

export async function getMaintenance() {
  const res = await fetch(`${BASE_URL}/maintenance`);
  return res.json();
}

export async function getMaintenanceById(id) {
  const res = await fetch(`${BASE_URL}/maintenance/${id}`);
  return res.json();
}

export async function createMaintenance(maintenanceData) {
  const dataToSave = {
    ...maintenanceData,
    bin_id: parseInt(maintenanceData.bin_id),
    cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : null
  };
  return requestData(`${BASE_URL}/maintenance`, 'POST', dataToSave);
}

export async function updateMaintenance(id, maintenanceData) {
  const dataToSave = {
    ...maintenanceData,
    bin_id: parseInt(maintenanceData.bin_id),
    cost: maintenanceData.cost ? parseFloat(maintenanceData.cost) : null
  };
  return requestData(`${BASE_URL}/maintenance/${id}`, 'PUT', dataToSave);
}

export async function deleteMaintenance(id) {
  return requestData(`${BASE_URL}/maintenance/${id}`, 'DELETE');
}

// --- Routes ---

export async function getRoutes() {
  const res = await fetch(`${BASE_URL}/routes`);
  return res.json();
}

export async function getRouteById(id) {
  const res = await fetch(`${BASE_URL}/routes/${id}`);
  return res.json();
}

export async function createRoute(routeData) {
  return requestData(`${BASE_URL}/routes`, 'POST', routeData);
}

export async function updateRoute(id, routeData) {
  return requestData(`${BASE_URL}/routes/${id}`, 'PUT', routeData);
}

export async function deleteRoute(id) {
  return requestData(`${BASE_URL}/routes/${id}`, 'DELETE');
}

// --- NEW FUNCTION ---
export async function getBinsForRoute(routeId) {
  const res = await fetch(`${BASE_URL}/routes/${routeId}/bins`);
  if (!res.ok) {
    throw new Error(`Failed to fetch bins for route ${routeId}`);
  }
  return res.json();
}
// --- Waste Types ---

export async function getWasteTypes() {
  const res = await fetch(`${BASE_URL}/waste-types`);
  return res.json();
}

export async function getWasteTypeById(id) {
  const res = await fetch(`${BASE_URL}/waste-types/${id}`);
  return res.json();
}

export async function createWasteType(wasteTypeData) {
  const dataToSave = {
    ...wasteTypeData,
    recyclable: wasteTypeData.recyclable === 'true'
  };
  return requestData(`${BASE_URL}/waste-types`, 'POST', dataToSave);
}

export async function updateWasteType(id, wasteTypeData) {
  const dataToSave = {
    ...wasteTypeData,
    recyclable: wasteTypeData.recyclable === 'true'
  };
  return requestData(`${BASE_URL}/waste-types/${id}`, 'PUT', dataToSave);
}

export async function deleteWasteType(id) {
  return requestData(`${BASE_URL}/waste-types/${id}`, 'DELETE');
}

// --- Assignments ---

export async function getAssignments() {
  const res = await fetch(`${BASE_URL}/assignments`);
  return res.json();
}

export async function getAssignmentById(id) {
  const res = await fetch(`${BASE_URL}/assignments/${id}`);
  return res.json();
}

export async function createAssignment(assignmentData) {
  const dataToSave = {
    ...assignmentData,
    household_id: parseInt(assignmentData.household_id),
    bin_id: parseInt(assignmentData.bin_id),
    priority: assignmentData.priority ? parseInt(assignmentData.priority) : null
  };
  return requestData(`${BASE_URL}/assignments`, 'POST', dataToSave);
}

export async function updateAssignment(id, assignmentData) {
  const dataToSave = {
    ...assignmentData,
    household_id: parseInt(assignmentData.household_id),
    bin_id: parseInt(assignmentData.bin_id),
    priority: assignmentData.priority ? parseInt(assignmentData.priority) : null
  };
  return requestData(`${BASE_URL}/assignments/${id}`, 'PUT', dataToSave);
}

export async function deleteAssignment(id) {
  return requestData(`${BASE_URL}/assignments/${id}`, 'DELETE');
}


// --- Analysis ---

export async function getFarHouseholds() {
  const res = await fetch(`${BASE_URL}/analysis/far-households`);
  return res.json();
}

export async function suggestBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggest`, { method: "POST" });
  return res.json();
}

export async function getSuggestedBins() {
  const res = await fetch(`${BASE_URL}/analysis/suggested`);
  return res.json();
}