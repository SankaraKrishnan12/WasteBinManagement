// UI management for the Smart Waste Bin System

import {
  getHouseholds,
  createHousehold,
  getHouseholdById,
  updateHousehold,
  deleteHousehold,
  getBins,
  createBin,
  getBinById,
  updateBin,
  deleteBin,
  getUsers,
  getVehicles,
  getCollections,
  getSensors,
  getMaintenance,
  getRoutes,
  getWasteTypes,
  getAssignments,
  getFarHouseholds,
  getSuggestedBins,
} from './api.js';

// Import map instance and marker function from map.js
import { map, addMapMarker } from './map.js';

// Global state to track what we are adding
window.currentAddMode = null;

// Tab management
document.addEventListener('DOMContentLoaded', () => {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      const tabId = button.getAttribute('data-tab') + '-tab';
      document.getElementById(tabId).classList.add('active');
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
    window.currentAddMode = null;
  });

  // Load initial data
  loadHouseholds();
  loadBins();
});

// Utility functions
function showModal(content) {
  const modalBody = document.getElementById('modal-body');
  modalBody.innerHTML = content;
  document.getElementById('modal').style.display = 'block';
}

// MODIFIED: createForm now accepts defaultData to pre-fill forms
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
      // Add min, max, step attributes if they exist
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
    // Use item.id which is returned from the database
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

// ADD workflow
function addHousehold() {
  window.currentAddMode = 'household';
  alert('Click on the map to place the new household.');
}

function openHouseholdAddModal(lat, lng) {
  // For ADD, we remove lat/lng from visible fields and add as hidden
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
    console.log('Submitting household:', data);
    const newHousehold = await createHousehold(data); 
    console.log('Saved household:', newHousehold);
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

// EDIT workflow
window.editHousehold = async (id) => {
  try {
    const household = await getHouseholdById(id);
    // Parse location from GeoJSON
    const { coordinates } = JSON.parse(household.location); // [lng, lat]
    household.lng = coordinates[0];
    household.lat = coordinates[1];
    
    openHouseholdEditModal(id, household);
  } catch (err) {
    console.error('Error fetching household:', err);
    alert('Could not load household data for editing.');
  }
}

function openHouseholdEditModal(id, data) {
  // For EDIT, lat/lng are visible, editable fields
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
    loadHouseholds(); // Reload list
    window.loadData();    // Reload map
  } catch (err) {
    console.error('Error updating household:', err);
    alert(`Error updating household: ${err.message}`);
  }
}

// DELETE workflow
window.deleteHousehold = async (id) => {
  if (!confirm('Are you sure you want to delete this household?')) {
    return;
  }
  try {
    await deleteHousehold(id);
    alert('Household deleted successfully.');
    loadHouseholds(); // Reload list
    window.loadData();    // Reload map
  } catch (err) {
    console.error('Error deleting household:', err);
    alert(`Error deleting household: ${err.message}`);
  }
}

// --- Bins ---
// MODIFIED: Added fill_level and status
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

// ADD workflow
function addBin() {
  window.currentAddMode = 'bin';
  alert('Click on the map to place the new bin.');
}

function openBinAddModal(lat, lng) {
  const addFields = binFields.filter(f => f.name !== 'lat' && f.name !== 'lng');
  // Set default values for add form
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

// EDIT workflow
window.editBin = async (id) => {
  try {
    const bin = await getBinById(id);
    const { coordinates } = JSON.parse(bin.location); // [lng, lat]
    bin.lng = coordinates[0];
    bin.lat = coordinates[1];
    
    openBinEditModal(id, bin);
  } catch (err) {
    console.error('Error fetching bin:', err);
    alert('Could not load bin data for editing.');
  }
}

function openBinEditModal(id, data) {
  // Pass the full bin data (including fill_level and status) to pre-fill
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
    window.loadData();    // Reload map
  } catch (err) {
    console.error('Error updating bin:', err);
    alert(`Error updating bin: ${err.message}`);
  }
}

// DELETE workflow
window.deleteBin = async (id) => {
  if (!confirm('Are you sure you want to delete this bin?')) {
    return;
  }
  try {
    await deleteBin(id);
    alert('Bin deleted successfully.');
    loadBins();       // Reload list
    window.loadData();    // Reload map
  } catch (err) {
    console.error('Error deleting bin:', err);
    alert(`Error deleting bin: ${err.message}`);
  }
}

// --- (The rest of the file for Users, Vehicles, etc. remains the same) ---
// ... (all other functions from loadUsers to deleteAssignment) ...

// --- Users ---
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
  const formHtml = createForm([
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'email', label: 'Email', type: 'email', required: true },
    { name: 'password_hash', label: 'Password', type: 'password', required: true },
    { name: 'role', label: 'Role', type: 'select', options: [
      { value: 'admin', label: 'Admin' },
      { value: 'collector', label: 'Collector' },
      { value: 'manager', label: 'Manager' }
    ], required: true }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitUserForm);
}

async function submitUserForm(event) {
  event.preventDefault();
  // ... submit logic ...
  console.log('Submitting user');
}

window.editUser = (id) => console.log('Edit user:', id);
window.deleteUser = (id) => console.log('Delete user:', id);

// --- Vehicles ---
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
  const formHtml = createForm([
    { name: 'license_plate', label: 'License Plate', type: 'text', required: true },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'vehicle_type', label: 'Type', type: 'text', required: true }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitVehicleForm);
}

async function submitVehicleForm(event) {
  event.preventDefault();
  console.log('Submitting vehicle');
}

window.editVehicle = (id) => console.log('Edit vehicle:', id);
window.deleteVehicle = (id) => console.log('Delete vehicle:', id);

// --- Collections ---
async function loadCollections() {
  try {
    const collections = await getCollections();
    displayList('collections-list', collections, [
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'vehicle_id', label: 'Vehicle ID' },
      { name: 'waste_amount_collected', label: 'Waste Amount' },
      { name: 'collected_at', label: 'Collected At' }
    ], 'editCollection', 'deleteCollection');
  } catch (error) {
    console.error('Error loading collections:', error);
  }
}

function addCollection() {
  const formHtml = createForm([
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'vehicle_id', label: 'Vehicle ID', type: 'number', required: true },
    { name: 'waste_amount_collected', label: 'Waste Amount', type: 'number', required: true },
    { name: 'waste_type_id', label: 'Waste Type ID', type: 'number' },
    { name: 'notes', label: 'Notes', type: 'text' }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitCollectionForm);
}

async function submitCollectionForm(event) {
  event.preventDefault();
  console.log('Submitting collection');
}

window.editCollection = (id) => console.log('Edit collection:', id);
window.deleteCollection = (id) => console.log('Delete collection:', id);

// --- Sensors ---
async function loadSensors() {
  try {
    const sensors = await getSensors();
    displayList('sensors-list', sensors, [
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
  const formHtml = createForm([
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'sensor_type', label: 'Type', type: 'text', required: true }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitSensorForm);
}

async function submitSensorForm(event) {
  event.preventDefault();
  console.log('Submitting sensor');
}

window.editSensor = (id) => console.log('Edit sensor:', id);
window.deleteSensor = (id) => console.log('Delete sensor:', id);

// --- Maintenance ---
async function loadMaintenance() {
  try {
    const maintenance = await getMaintenance();
    displayList('maintenance-list', maintenance, [
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'maintenance_type', label: 'Type' },
      { name: 'scheduled_date', label: 'Scheduled' },
      { name: 'status', label: 'Status' }
    ], 'editMaintenance', 'deleteMaintenance');
  } catch (error) {
    console.error('Error loading maintenance:', error);
  }
}

function addMaintenance() {
  const formHtml = createForm([
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'maintenance_type', label: 'Type', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'scheduled_date', label: 'Scheduled Date', type: 'datetime-local', required: true },
    { name: 'cost', label: 'Cost', type: 'number' }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitMaintenanceForm);
}

async function submitMaintenanceForm(event) {
  event.preventDefault();
  console.log('Submitting maintenance');
}

window.editMaintenance = (id) => console.log('Edit maintenance:', id);
window.deleteMaintenance = (id) => console.log('Delete maintenance:', id);

// --- Routes ---
async function loadRoutes() {
  try {
    const routes = await getRoutes();
    displayList('routes-list', routes, [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Description' },
      { name: 'status', label: 'Status' }
    ], 'editRoute', 'deleteRoute');
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

function addRoute() {
  const formHtml = createForm([
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitRouteForm);
}

async function submitRouteForm(event) {
  event.preventDefault();
  console.log('Submitting route');
}

window.editRoute = (id) => console.log('Edit route:', id);
window.deleteRoute = (id) => console.log('Delete route:', id);

// --- Waste Types ---
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
  const formHtml = createForm([
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'recyclable', label: 'Recyclable', type: 'select', options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' }
    ]}
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitWasteTypeForm);
}

async function submitWasteTypeForm(event) {
  event.preventDefault();
  console.log('Submitting waste type');
}

window.editWasteType = (id) => console.log('Edit waste type:', id);
window.deleteWasteType = (id) => console.log('Delete waste type:', id);

// --- Assignments ---
async function loadAssignments() {
  try {
    const assignments = await getAssignments();
    displayList('assignments-list', assignments, [
      { name: 'household_id', label: 'Household ID' },
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'priority', label: 'Priority' }
    ], 'editAssignment', 'deleteAssignment');
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

function addAssignment() {
  const formHtml = createForm([
    { name: 'household_id', label: 'Household ID', type: 'number', required: true },
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'priority', label: 'Priority', type: 'number' }
  ]);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitAssignmentForm);
}

async function submitAssignmentForm(event) {
  event.preventDefault();
  console.log('Submitting assignment');
}

window.editAssignment = (id) => console.log('Edit assignment:', id);
window.deleteAssignment = (id) => console.log('Delete assignment:', id);


// --- Analysis ---
async function findFarHouseholds() {
  try {
    const farHouseholds = await getFarHouseholds();
    console.log('Far households:', farHouseholds);
    window.showFarHouseholds();
  } catch (error) {
    console.error('Error finding far households:', error);
  }
}

async function suggestNewBins() {
  try {
    const suggestions = await getSuggestedBins();
    console.log('Suggested bins:', suggestions);
    window.suggestNewBins();
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
document.getElementById('suggestBins').addEventListener('click', suggestNewBins);

// Export functions for use in other modules
window.loadData = loadData; // Keep for map.js
window.showFarHouseholds = showFarHouseholds;
window.suggestNewBins = suggestNewBins;

// All edit/delete functions are now globally scoped via window.editX