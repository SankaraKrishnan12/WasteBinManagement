// UI management for the Smart Waste Bin System

import {
  getHouseholds, createHousehold, getHouseholdById, updateHousehold, deleteHousehold,
  getBins, createBin, getBinById, updateBin, deleteBin,
  getUsers, createUser, getUserById, updateUser, deleteUser,
  getVehicles, createVehicle, getVehicleById, updateVehicle, deleteVehicle,
  getCollections, createCollection, getCollectionById, updateCollection, deleteCollection,
  getSensors, createSensor, getSensorById, updateSensor, deleteSensor,
  getMaintenance, createMaintenance, getMaintenanceById, updateMaintenance, deleteMaintenance,
  getRoutes, createRoute, getRouteById, updateRoute, deleteRoute,
  getWasteTypes, createWasteType, getWasteTypeById, updateWasteType, deleteWasteType,
  getAssignments, createAssignment, getAssignmentById, updateAssignment, deleteAssignment,
  getFarHouseholds,
  getSuggestedBins,
} from './api.js';

// Import map instance and marker function from map.js
import { 
  map, 
  addMapMarker,
  loadHouseholdMarkers,
  loadBinMarkers,
  loadVehicleMarkers,
  loadMaintenanceMarkers,
  loadRouteBins,
  clearMarkers,
  clearAllLayers
} from './map.js';

// Global state to track what we are adding
window.currentAddMode = null;

// --- MODIFIED: Map Layer Management ---
function updateMapForTab(tabName) {
  // Clear all layers
  clearAllLayers();

  // Load markers for the selected tab
  switch (tabName) {
    case 'households':
      loadHouseholdMarkers();
      break;
    case 'bins':
      loadBinMarkers();
      break;
    case 'vehicles':
      loadVehicleMarkers();
      break;
    case 'maintenance':
      loadMaintenanceMarkers();
      break;
    case 'sensors':
    case 'collections':
      loadBinMarkers(); // Show all bins for these tabs
      break;
    
    // --- THIS IS THE CHANGE ---
    case 'analysis':
      loadHouseholdMarkers(); // Show households
      loadBinMarkers();       // Show bins
      break;
    // --- END OF CHANGE ---

    // 'routes' tab now shows a clear map by default.
    // Markers are loaded when a specific route is clicked.
    case 'routes':
    case 'users':
    case 'waste-types':
    case 'assignments':
      // Do nothing, just show a clear map
      break;
  }
}


// Tab management
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      const tabName = button.getAttribute('data-tab'); // e.g., 'households'
      const tabId = tabName + '-tab';
      document.getElementById(tabId).classList.add('active');

      // Update map AND load list data
      updateMapForTab(tabName);
      
      // Load list data for the active tab
      switch (tabName) {
        case 'households':
          loadHouseholds();
          break;
        case 'bins':
          loadBins();
          break;
        case 'users':
          loadUsers();
          break;
        case 'vehicles':
          loadVehicles();
          break;
        case 'collections':
          loadCollections();
          break;
        case 'sensors':
          loadSensors();
          break;
        case 'maintenance':
          loadMaintenance();
          break;
        case 'routes':
          loadRoutes();
          break;
        case 'waste-types':
          loadWasteTypes();
          break;
        case 'assignments':
          loadAssignments();
          break;
        // 'analysis' tab has no list, so no default action
      }
    });
  });

  // Modal management
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close');

  closeBtn.onclick = () => {
    modal.style.display = 'none';
    window.currentAddMode = null; // Cancel adding if modal is closed
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
      window.currentAddMode = null; // Cancel adding if modal is closed
    }
  };

  // --- Map click handler ---
  map.on("click", (e) => {
    if (!window.currentAddMode) return;
    const { lat, lng } = e.latlng;
    if (window.currentAddMode === 'household') {
      openHouseholdAddModal(lat, lng);
    } else if (window.currentAddMode === 'bin') {
      openBinAddModal(lat, lng);
    }
    // Note: Vehicles are added via form, not map click, so they are not here
    window.currentAddMode = null;
  });

  // Load initial data for the default tab
  loadHouseholds();
  updateMapForTab('households');
});

//
// --- ALL OTHER FUNCTIONS (Utility, Households, Bins, Users, etc.) ---
// --- NO CHANGES NEEDED BELOW THIS LINE ---
//

// Utility functions
function showModal(content) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = content;
  document.getElementById('modal').style.display = 'block';
}

function createForm(fields, hiddenData = {}, defaultData = {}) {
  let formHtml = '<form id="entity-form">';
  fields.forEach(field => {
    const value = defaultData[field.name] || '';
    formHtml += `<label>${field.label}:</label>`;
    
    if (field.type === 'select') {
      formHtml += `<select name="${field.name}" ${field.required ? 'required' : ''}>`;
      field.options.forEach(option => {
        const selected = (String(value) === String(option.value)) ? 'selected' : '';
        formHtml += `<option value="${option.value}" ${selected}>${option.label}</option>`;
      });
      formHtml += '</select>';
    } else {
      const otherAttrs = ['min', 'max', 'step'].map(attr => 
        field[attr] ? `${attr}="${field[attr]}"` : ''
      ).join(' ');
      
      formHtml += `<input type="${field.type}" name="${field.name}" value="${value}" ${field.required ? 'required' : ''} ${otherAttrs}>`;
    }
  });

  for (const [key, value] of Object.entries(hiddenData)) {
    formHtml += `<input type="hidden" name="${key}" value="${value}">`;
  }

  formHtml += '<button type="submit">Submit</button></form>';
  return formHtml;
}

function displayList(containerId, items, displayFields, editCallback, deleteCallback) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item';
    let content = '';
    displayFields.forEach(field => {
      content += `<strong>${field.label}:</strong> ${item[field.name]}<br>`;
    });
    content += `<button onclick="${editCallback}(${item.id})">Edit</button> `;
    content += `<button onclick="${deleteCallback}(${item.id})">Delete</button>`;
    itemDiv.innerHTML = content;
    container.appendChild(itemDiv);
  });
}

// --- Households ---
const householdFields = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'ward', label: 'Ward', type: 'text', required: true },
  { name: 'waste_generated_per_day', label: 'Waste Generated per Day', type: 'number', required: true, step: '0.1' },
  { name: 'contact_info', label: 'Contact Info', type: 'text' },
  { name: 'household_type', label: 'Type', type: 'select', options: [
    { value: 'residential', label: 'Residential' },
    { value: 'commercial', label: 'Commercial' },
    { value: 'industrial', label: 'Industrial' }
  ]},
  { name: 'lat', label: 'Latitude', type: 'number', required: true, step: 'any' },
  { name: 'lng', label: 'Longitude', type: 'number', required: true, step: 'any' }
];

async function loadHouseholds() {
  try {
    const households = await getHouseholds();
    displayList('households-list', households, [
      { name: 'name', label: 'Name' },
      { name: 'ward', label: 'Ward' },
      { name: 'waste_generated_per_day', label: 'Waste/Day' }
    ], 'editHousehold', 'deleteHousehold');
  } catch (error) {
    console.error('Error loading households:', error);
  }
}

function addHousehold() {
  window.currentAddMode = 'household';
  alert('Click on the map to place the new household.');
}

function openHouseholdAddModal(lat, lng) {
  const addFields = householdFields.filter(f => f.name !== 'lat' && f.name !== 'lng');
  const formHtml = createForm(addFields, { lat, lng });
  
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitHouseholdAddForm);
}

async function submitHouseholdAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  
  try {
    const newHousehold = await createHousehold(data); 
    alert('Household saved successfully!');
    const markerData = { ...newHousehold, ...data };
    addMapMarker('household', markerData);
    document.getElementById('modal').style.display = 'none';
    loadHouseholds();
  } catch (err) {
    console.error('Error saving household:', err);
    alert(`Error saving household: ${err.message}`);
  }
}

window.editHousehold = async (id) => {
  try {
    const household = await getHouseholdById(id);
    if (household.location) {
      const { coordinates } = JSON.parse(household.location); // [lng, lat]
      household.lng = coordinates[0];
      household.lat = coordinates[1];
    }
    openHouseholdEditModal(id, household);
  } catch (err) {
    console.error('Error fetching household:', err);
    alert('Could not load household data for editing.');
  }
}

function openHouseholdEditModal(id, data) {
  const formHtml = createForm(householdFields, {}, data);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', (e) => submitHouseholdEditForm(e, id));
}

async function submitHouseholdEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await updateHousehold(id, data);
    alert('Household updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadHouseholds();     // Reload list
    loadHouseholdMarkers(); // Reload map
  } catch (err) {
    console.error('Error updating household:', err);
    alert(`Error updating household: ${err.message}`);
  }
}

window.deleteHousehold = async (id) => {
  if (!confirm('Are you sure you want to delete this household?')) return;
  try {
    await deleteHousehold(id);
    alert('Household deleted successfully.');
    loadHouseholds();     // Reload list
    loadHouseholdMarkers(); // Reload map
  } catch (err) {
    console.error('Error deleting household:', err);
    alert(`Error deleting household: ${err.message}`);
  }
}

// --- Bins ---
const binFields = [
  { name: 'capacity', label: 'Capacity (kg)', type: 'number', required: true },
  { name: 'bin_type', label: 'Type', type: 'select', options: [
    { value: 'standard', label: 'Standard' },
    { value: 'large', label: 'Large' },
    { value: 'small', label: 'Small' }
  ]},
  { name: 'fill_level', label: 'Fill Level (%)', type: 'number', required: false, min: 0, max: 100 },
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'full', label: 'Full' },
    { value: 'inactive', label: 'Inactive' }
  ]},
  { name: 'lat', label: 'Latitude', type: 'number', required: true, step: 'any' },
  { name: 'lng', label: 'Longitude', type: 'number', required: true, step: 'any' }
];

async function loadBins() {
  try {
    const bins = await getBins();
    displayList('bins-list', bins, [
      { name: 'id', label: 'ID' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'fill_level', label: 'Fill Level' },
      { name: 'status', label: 'Status' }
    ], 'editBin', 'deleteBin');
  } catch (error) {
    console.error('Error loading bins:', error);
  }
}

function addBin() {
  window.currentAddMode = 'bin';
  alert('Click on the map to place the new bin.');
}

function openBinAddModal(lat, lng) {
  const addFields = binFields.filter(f => f.name !== 'lat' && f.name !== 'lng');
  const defaults = { fill_level: 0, status: 'active' };
  const formHtml = createForm(addFields, { lat, lng }, defaults);
  
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitBinAddForm);
}

async function submitBinAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    const newBin = await createBin(data); 
    alert('Bin saved successfully!');
    const markerData = { ...newBin, ...data };
    addMapMarker('bin', markerData);
    document.getElementById('modal').style.display = 'none';
    loadBins();
  } catch (err) {
    console.error('Error saving bin:', err);
    alert(`Error saving bin: ${err.message}`);
  }
}

window.editBin = async (id) => {
  try {
    const bin = await getBinById(id);
    if (bin.location) {
      const { coordinates } = JSON.parse(bin.location); // [lng, lat]
      bin.lng = coordinates[0];
      bin.lat = coordinates[1];
    }
    openBinEditModal(id, bin);
  } catch (err) {
    console.error('Error fetching bin:', err);
    alert('Could not load bin data for editing.');
  }
}

function openBinEditModal(id, data) {
  const formHtml = createForm(binFields, {}, data);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', (e) => submitBinEditForm(e, id));
}

async function submitBinEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);

  try {
    await updateBin(id, data);
    alert('Bin updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadBins();       // Reload list
    loadBinMarkers(); // Reload map
  } catch (err) {
    console.error('Error updating bin:', err);
    alert(`Error updating bin: ${err.message}`);
  }
}

window.deleteBin = async (id) => {
  if (!confirm('Are you sure you want to delete this bin?')) return;
  try {
    await deleteBin(id);
    alert('Bin deleted successfully.');
    loadBins();       // Reload list
    loadBinMarkers(); // Reload map
  } catch (err) {
    console.error('Error deleting bin:', err);
    alert(`Error deleting bin: ${err.message}`);
  }
}

// --- Users ---
const userFields = [
  { name: 'username', label: 'Username', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'role', label: 'Role', type: 'select', options: [
    { value: 'admin', label: 'Admin' },
    { value: 'collector', label: 'Collector' },
    { value: 'manager', label: 'Manager' }
  ], required: true }
];

const userAddFields = [
  ...userFields,
  { name: 'password_hash', label: 'Password', type: 'password', required: true }
];

async function loadUsers() {
  try {
    const users = await getUsers();
    displayList('users-list', users, [
      { name: 'username', label: 'Username' },
      { name: 'email', label: 'Email' },
      { name: 'role', label: 'Role' }
    ], 'editUser', 'deleteUser');
  } catch (error) {
    console.error('Error loading users:', error);
  }
}

function addUser() {
  const formHtml = createForm(userAddFields);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitUserAddForm);
}

async function submitUserAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createUser(data);
    alert('User created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadUsers();
  } catch (err) {
    console.error('Error creating user:', err);
    alert(`Error creating user: ${err.message}`);
  }
}

window.editUser = async (id) => {
  try {
    const user = await getUserById(id);
    const formHtml = createForm(userFields, {}, user);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitUserEditForm(e, id));
  } catch (err) {
    console.error('Error fetching user:', err);
    alert('Could not load user data for editing.');
  }
};

async function submitUserEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateUser(id, data);
    alert('User updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadUsers();
  } catch (err) {
    console.error('Error updating user:', err);
    alert(`Error updating user: ${err.message}`);
  }
}

window.deleteUser = async (id) => {
  if (!confirm('Are you sure you want to delete this user?')) return;
  try {
    await deleteUser(id);
    alert('User deleted successfully.');
    loadUsers();
  } catch (err) {
    console.error('Error deleting user:', err);
    alert(`Error deleting user: ${err.message}`);
  }
};

// --- Vehicles ---
const vehicleFields = [
  { name: 'license_plate', label: 'License Plate', type: 'text', required: true },
  { name: 'capacity', label: 'Capacity (kg)', type: 'number', required: true, step: '10' },
  { name: 'vehicle_type', label: 'Type', type: 'select', options: [
    { value: 'Truck', label: 'Truck' },
    { value: 'Van', label: 'Van' },
    { value: 'Cart', label: 'Cart' }
  ]},
  { name: 'status', label: 'Status', type: 'select', options: [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'inactive', label: 'Inactive' }
  ]},
  { name: 'lat', label: 'Latitude', type: 'number', required: true, step: 'any' },
  { name: 'lng', label: 'Longitude', type: 'number', required: true, step: 'any' }
];

async function loadVehicles() {
  try {
    const vehicles = await getVehicles();
    displayList('vehicles-list', vehicles, [
      { name: 'license_plate', label: 'License Plate' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'vehicle_type', label: 'Type' },
      { name: 'status', label: 'Status' }
    ], 'editVehicle', 'deleteVehicle');
  } catch (error) {
    console.error('Error loading vehicles:', error);
  }
}

function addVehicle() {
  const formHtml = createForm(vehicleFields, {}, { status: 'active', lat: 13.0827, lng: 80.2707 });
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitVehicleAddForm);
}

async function submitVehicleAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    const newVehicle = await createVehicle(data);
    alert('Vehicle created successfully!');
    const markerData = { ...newVehicle, ...data };
    addMapMarker('vehicle', markerData);
    document.getElementById('modal').style.display = 'none';
    loadVehicles();
  } catch (err) {
    console.error('Error creating vehicle:', err);
    alert(`Error creating vehicle: ${err.message}`);
  }
}

window.editVehicle = async (id) => {
  try {
    const vehicle = await getVehicleById(id);
    if (vehicle.location) {
      const { coordinates } = JSON.parse(vehicle.location); // [lng, lat]
      vehicle.lng = coordinates[0];
      vehicle.lat = coordinates[1];
    } else {
      vehicle.lat = 13.0827;
      vehicle.lng = 80.2707;
    }
    
    const formHtml = createForm(vehicleFields, {}, vehicle);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitVehicleEditForm(e, id));
  } catch (err) {
    console.error('Error fetching vehicle:', err);
    alert('Could not load vehicle data for editing.');
  }
};

async function submitVehicleEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateVehicle(id, data);
    alert('Vehicle updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadVehicles();
    loadVehicleMarkers(); // Reload map
  } catch (err) {
    console.error('Error updating vehicle:', err);
    alert(`Error updating vehicle: ${err.message}`);
  }
}

window.deleteVehicle = async (id) => {
  if (!confirm('Are you sure you want to delete this vehicle?')) return;
  try {
    await deleteVehicle(id);
    alert('Vehicle deleted successfully.');
    loadVehicles();
    loadVehicleMarkers(); // Reload map
  } catch (err) {
    console.error('Error deleting vehicle:', err);
    alert(`Error deleting vehicle: ${err.message}`);
  }
};

// --- Collections ---
const collectionFields = [
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'vehicle_id', label: 'Vehicle ID', type: 'number', required: true },
    { name: 'collector_id', label: 'Collector ID', type: 'number', required: true },
    { name: 'waste_amount_collected', label: 'Waste Amount (kg)', type: 'number', required: true, step: '0.1' },
    { name: 'waste_type_id', label: 'Waste Type ID', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'text' }
];

async function loadCollections() {
  try {
    const collections = await getCollections();
    displayList('collections-list', collections, [
      { name: 'id', label: 'ID' },
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'vehicle_id', label: 'Vehicle ID' },
      { name: 'collector', label: 'Collector' },
      { name: 'waste_amount_collected', label: 'Waste Amount' },
      { name: 'collected_at', label: 'Collected At' }
    ], 'editCollection', 'deleteCollection');
  } catch (error) {
    console.error('Error loading collections:', error);
  }
}

function addCollection() {
  const formHtml = createForm(collectionFields);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitCollectionAddForm);
}

async function submitCollectionAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createCollection(data);
    alert('Collection created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadCollections();
  } catch (err) {
    console.error('Error creating collection:', err);
    alert(`Error creating collection: ${err.message}`);
  }
}

window.editCollection = async (id) => {
  try {
    const collection = await getCollectionById(id);
    const formHtml = createForm(collectionFields, {}, collection);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitCollectionEditForm(e, id));
  } catch (err) {
    console.error('Error fetching collection:', err);
    alert('Could not load collection data for editing.');
  }
};

async function submitCollectionEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateCollection(id, data);
    alert('Collection updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadCollections();
  } catch (err) {
    console.error('Error updating collection:', err);
    alert(`Error updating collection: ${err.message}`);
  }
}

window.deleteCollection = async (id) => {
  if (!confirm('Are you sure you want to delete this collection?')) return;
  try {
    await deleteCollection(id);
    alert('Collection deleted successfully.');
    loadCollections();
  } catch (err) {
    console.error('Error deleting collection:', err);
    alert(`Error deleting collection: ${err.message}`);
  }
};

// --- Sensors ---
const sensorFields = [
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'sensor_type', label: 'Type', type: 'select', options: [
      { value: 'Fill Level', label: 'Fill Level' },
      { value: 'Weight', label: 'Weight' },
      { value: 'Lid', label: 'Lid Status' }
    ], required: true },
    { name: 'last_reading', label: 'Last Reading', type: 'text' },
    { name: 'battery_level', label: 'Battery (%)', type: 'number', min: 0, max: 100 },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'active', label: 'Active' },
      { value: 'faulty', label: 'Faulty' },
      { value: 'inactive', label: 'Inactive' }
    ]}
];

async function loadSensors() {
  try {
    const sensors = await getSensors();
    displayList('sensors-list', sensors, [
      { name: 'id', label: 'ID' },
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'sensor_type', label: 'Type' },
      { name: 'last_reading', label: 'Last Reading' },
      { name: 'battery_level', label: 'Battery' }
    ], 'editSensor', 'deleteSensor');
  } catch (error) {
    console.error('Error loading sensors:', error);
  }
}

function addSensor() {
  const formHtml = createForm(sensorFields, {}, { battery_level: 100, status: 'active' });
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitSensorAddForm);
}

async function submitSensorAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createSensor(data);
    alert('Sensor created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadSensors();
  } catch (err) {
    console.error('Error creating sensor:', err);
    alert(`Error creating sensor: ${err.message}`);
  }
}

window.editSensor = async (id) => {
  try {
    const sensor = await getSensorById(id);
    const formHtml = createForm(sensorFields, {}, sensor);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitSensorEditForm(e, id));
  } catch (err) {
    console.error('Error fetching sensor:', err);
    alert('Could not load sensor data for editing.');
  }
};

async function submitSensorEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateSensor(id, data);
    alert('Sensor updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadSensors();
  } catch (err) {
    console.error('Error updating sensor:', err);
    alert(`Error updating sensor: ${err.message}`);
  }
}

window.deleteSensor = async (id) => {
  if (!confirm('Are you sure you want to delete this sensor?')) return;
  try {
    await deleteSensor(id);
    alert('Sensor deleted successfully.');
    loadSensors();
  } catch (err) {
    console.error('Error deleting sensor:', err);
    alert(`Error deleting sensor: ${err.message}`);
  }
};

// --- Maintenance ---
const maintenanceFields = [
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'maintenance_type', label: 'Type', type: 'select', options: [
      { value: 'Repair', label: 'Repair' },
      { value: 'Cleaning', label: 'Cleaning' },
      { value: 'Replacement', label: 'Replacement' },
      { value: 'Battery Replacement', label: 'Battery Replacement' },
      { value: 'Calibration', label: 'Calibration' },
      { value: 'Painting', label: 'Painting' }
    ], required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'scheduled_date', label: 'Scheduled Date', type: 'datetime-local', required: true },
    { name: 'technician_id', label: 'Technician ID', type: 'number' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'scheduled', label: 'Scheduled' },
      { value: 'in_progress', label: 'In Progress' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]},
    { name: 'cost', label: 'Cost ($)', type: 'number', step: '0.01' }
];

async function loadMaintenance() {
  try {
    const maintenance = await getMaintenance();
    displayList('maintenance-list', maintenance, [
      { name: 'id', label: 'ID' },
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'maintenance_type', label: 'Type' },
      { name: 'technician', label: 'Technician' },
      { name: 'status', label: 'Status' }
    ], 'editMaintenance', 'deleteMaintenance');
  } catch (error) {
    console.error('Error loading maintenance:', error);
  }
}

function addMaintenance() {
  const formHtml = createForm(maintenanceFields, {}, { status: 'scheduled' });
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitMaintenanceAddForm);
}

async function submitMaintenanceAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createMaintenance(data);
    alert('Maintenance task created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadMaintenance();
  } catch (err) {
    console.error('Error creating maintenance:', err);
    alert(`Error creating maintenance: ${err.message}`);
  }
}

window.editMaintenance = async (id) => {
  try {
    const task = await getMaintenanceById(id);
    // Format dates for datetime-local input
    if (task.scheduled_date) {
        task.scheduled_date = new Date(task.scheduled_date).toISOString().slice(0, 16);
    }
    if (task.completed_date) {
        task.completed_date = new Date(task.completed_date).toISOString().slice(0, 16);
    }
    const editFields = [ ...maintenanceFields, { name: 'completed_date', label: 'Completed Date', type: 'datetime-local' }];
    const formHtml = createForm(editFields, {}, task);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitMaintenanceEditForm(e, id));
  } catch (err) {
    console.error('Error fetching maintenance:', err);
    alert('Could not load maintenance data for editing.');
  }
};

async function submitMaintenanceEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateMaintenance(id, data);
    alert('Maintenance task updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadMaintenance();
  } catch (err) {
    console.error('Error updating maintenance:', err);
    alert(`Error updating maintenance: ${err.message}`);
  }
}

window.deleteMaintenance = async (id) => {
  if (!confirm('Are you sure you want to delete this maintenance task?')) return;
  try {
    await deleteMaintenance(id);
    alert('Maintenance task deleted successfully.');
    loadMaintenance();
  } catch (err) {
    console.error('Error deleting maintenance:', err);
    alert(`Error deleting maintenance: ${err.message}`);
  }
};

// --- Routes ---
const routeFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'created_by', label: 'Creator ID', type: 'number' },
    { name: 'estimated_duration', label: 'Est. Duration (e.g., 2 hours)', type: 'text' },
    { name: 'status', label: 'Status', type: 'select', options: [
      { value: 'planned', label: 'Planned' },
      { value: 'active', label: 'Active' },
      { value: 'completed', label: 'Completed' },
      { value: 'cancelled', label: 'Cancelled' }
    ]}
];

// --- NEW: Custom display function for routes ---
function displayRoutesList(items, editCallback, deleteCallback) {
  const container = document.getElementById('routes-list');
  container.innerHTML = '';
  
  // Clear any existing "active" class
  const clearActive = () => {
    container.querySelectorAll('.list-item').forEach(el => el.classList.remove('active-route'));
  };

  items.forEach(item => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'list-item route-list-item'; // Add a new class
    itemDiv.dataset.routeId = item.id;

    let content = `
      <strong>Name:</strong> ${item.name}<br>
      <strong>Creator:</strong> ${item.creator || 'N/A'}<br>
      <strong>Bins:</strong> ${item.bins_in_route}<br>
      <strong>Status:</strong> ${item.status}
    `;
    
    // Create a view button
    const viewBtn = document.createElement('button');
    viewBtn.innerText = 'View on Map';
    viewBtn.onclick = (e) => {
      e.stopPropagation(); // Stop click from bubbling to edit/delete
      clearActive();
      itemDiv.classList.add('active-route');
      loadRouteBins(item.id); // Load this route's bins
    };

    // Create edit/delete buttons
    const editBtn = document.createElement('button');
    editBtn.innerText = 'Edit';
    editBtn.onclick = (e) => {
      e.stopPropagation();
      window[editCallback](item.id);
    };

    const deleteBtn = document.createElement('button');
    deleteBtn.innerText = 'Delete';
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      window[deleteCallback](item.id);
    };
    
    itemDiv.innerHTML = content;
    itemDiv.appendChild(viewBtn);
    itemDiv.appendChild(editBtn);
    itemDiv.appendChild(deleteBtn);
    container.appendChild(itemDiv);
  });
}

// --- MODIFIED: loadRoutes ---
async function loadRoutes() {
  try {
    const routes = await getRoutes();
    // Use the new custom display function
    displayRoutesList(routes, 'editRoute', 'deleteRoute');
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

function addRoute() {
  const formHtml = createForm(routeFields, {}, { status: 'planned' });
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitRouteAddForm);
}

async function submitRouteAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createRoute(data);
    alert('Route created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadRoutes();
  } catch (err) {
    console.error('Error creating route:', err);
    alert(`Error creating route: ${err.message}`);
  }
}

window.editRoute = async (id) => {
  try {
    const route = await getRouteById(id);
    const formHtml = createForm(routeFields, {}, route);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitRouteEditForm(e, id));
  } catch (err) {
    console.error('Error fetching route:', err);
    alert('Could not load route data for editing.');
  }
};

async function submitRouteEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateRoute(id, data);
    alert('Route updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadRoutes();
  } catch (err) {
    console.error('Error updating route:', err);
    alert(`Error updating route: ${err.message}`);
  }
}

window.deleteRoute = async (id) => {
  if (!confirm('Are you sure you want to delete this route?')) return;
  try {
    await deleteRoute(id);
    alert('Route deleted successfully.');
    loadRoutes();
  } catch (err) {
    console.error('Error deleting route:', err);
    alert(`Error deleting route: ${err.message}`);
  }
};

// --- Waste Types ---
const wasteTypeFields = [
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'recyclable', label: 'Recyclable', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
];

async function loadWasteTypes() {
  try {
    const wasteTypes = await getWasteTypes();
    displayList('waste-types-list', wasteTypes, [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Description' },
      { name: 'recyclable', label: 'Recyclable' }
    ], 'editWasteType', 'deleteWasteType');
  } catch (error) {
    console.error('Error loading waste types:', error);
  }
}

function addWasteType() {
  const formHtml = createForm(wasteTypeFields, {}, { recyclable: 'false' });
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitWasteTypeAddForm);
}

async function submitWasteTypeAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createWasteType(data);
    alert('Waste type created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadWasteTypes();
  } catch (err) {
    console.error('Error creating waste type:', err);
    alert(`Error creating waste type: ${err.message}`);
  }
}

window.editWasteType = async (id) => {
  try {
    const wasteType = await getWasteTypeById(id);
    const formHtml = createForm(wasteTypeFields, {}, wasteType);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitWasteTypeEditForm(e, id));
  } catch (err) {
    console.error('Error fetching waste type:', err);
    alert('Could not load waste type data for editing.');
  }
};

async function submitWasteTypeEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateWasteType(id, data);
    alert('Waste type updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadWasteTypes();
  } catch (err) {
    console.error('Error updating waste type:', err);
    alert(`Error updating waste type: ${err.message}`);
  }
}

window.deleteWasteType = async (id) => {
  if (!confirm('Are you sure you want to delete this waste type?')) return;
  try {
    await deleteWasteType(id);
    alert('Waste type deleted successfully.');
    loadWasteTypes();
  } catch (err) {
    console.error('Error deleting waste type:', err);
    alert(`Error deleting waste type: ${err.message}`);
  }
};

// --- Assignments ---
const assignmentFields = [
    { name: 'household_id', label: 'Household ID', type: 'number', required: true },
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'priority', label: 'Priority', type: 'number', min: 1, max: 5 }
];

async function loadAssignments() {
  try {
    const assignments = await getAssignments();
    displayList('assignments-list', assignments, [
      { name: 'id', label: 'ID' },
      { name: 'household_name', label: 'Household' },
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'priority', label: 'Priority' }
    ], 'editAssignment', 'deleteAssignment');
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

function addAssignment() {
  const formHtml = createForm(assignmentFields, {}, { priority: 1 });
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitAssignmentAddForm);
}

async function submitAssignmentAddForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await createAssignment(data);
    alert('Assignment created successfully!');
    document.getElementById('modal').style.display = 'none';
    loadAssignments();
  } catch (err) {
    console.error('Error creating assignment:', err);
    alert(`Error creating assignment: ${err.message}`);
  }
}

window.editAssignment = async (id) => {
  try {
    const assignment = await getAssignmentById(id);
    const formHtml = createForm(assignmentFields, {}, assignment);
    showModal(formHtml);
    document.getElementById('entity-form').addEventListener('submit', (e) => submitAssignmentEditForm(e, id));
  } catch (err) {
    console.error('Error fetching assignment:', err);
    alert('Could not load assignment data for editing.');
  }
};

async function submitAssignmentEditForm(event, id) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  try {
    await updateAssignment(id, data);
    alert('Assignment updated successfully!');
    document.getElementById('modal').style.display = 'none';
    loadAssignments();
  } catch (err) {
    console.error('Error updating assignment:', err);
    alert(`Error updating assignment: ${err.message}`);
  }
}

window.deleteAssignment = async (id) => {
  if (!confirm('Are you sure you want to delete this assignment?')) return;
  try {
    await deleteAssignment(id);
    alert('Assignment deleted successfully.');
    loadAssignments();
  } catch (err) {
    console.error('Error deleting assignment:', err);
    alert(`Error deleting assignment: ${err.message}`);
  }
};


// --- Analysis ---
async function findFarHouseholds() {
  try {
    // This function will now ADD red markers on top
    await window.showFarHouseholds(); 
  } catch (error) {
    console.error('Error finding far households:', error);
  }
}

async function suggestNewBinsUI() {
  try {
    // This function will now ADD suggested markers on top
    await window.suggestNewBins();
  } catch (error) {
    console.error('Error suggesting bins:', error);
  }
}

// Event listeners
document.getElementById('loadHouseholds').addEventListener('click', loadHouseholds);
document.getElementById('addHouseholdBtn').addEventListener('click', addHousehold);
document.getElementById('loadBins').addEventListener('click', loadBins);
document.getElementById('addBinBtn').addEventListener('click', addBin);
document.getElementById('loadUsers').addEventListener('click', loadUsers);
document.getElementById('addUserBtn').addEventListener('click', addUser);
document.getElementById('loadVehicles').addEventListener('click', loadVehicles);
document.getElementById('addVehicleBtn').addEventListener('click', addVehicle);
document.getElementById('loadCollections').addEventListener('click', loadCollections);
document.getElementById('addCollectionBtn').addEventListener('click', addCollection);
document.getElementById('loadSensors').addEventListener('click', loadSensors);
document.getElementById('addSensorBtn').addEventListener('click', addSensor);
document.getElementById('loadMaintenance').addEventListener('click', loadMaintenance);
document.getElementById('addMaintenanceBtn').addEventListener('click', addMaintenance);
document.getElementById('loadRoutes').addEventListener('click', loadRoutes);
document.getElementById('addRouteBtn').addEventListener('click', addRoute);
document.getElementById('loadWasteTypes').addEventListener('click', loadWasteTypes);
document.getElementById('addWasteTypeBtn').addEventListener('click', addWasteType);
document.getElementById('loadAssignments').addEventListener('click', loadAssignments);
document.getElementById('addAssignmentBtn').addEventListener('click', addAssignment);
document.getElementById('findFar').addEventListener('click', findFarHouseholds);
document.getElementById('suggestBins').addEventListener('click', suggestNewBinsUI);