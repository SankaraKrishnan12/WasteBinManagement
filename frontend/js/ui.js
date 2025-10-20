// UI management for the Smart Waste Bin System

import {
  getHouseholds,
  getBins,
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
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

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

function createForm(fields, onSubmit) {
  let formHtml = '<form id="entity-form">';
  fields.forEach(field => {
    formHtml += `<label>${field.label}:</label>`;
    if (field.type === 'select') {
      formHtml += `<select name="${field.name}" ${field.required ? 'required' : ''}>`;
      field.options.forEach(option => {
        formHtml += `<option value="${option.value}">${option.label}</option>`;
      });
      formHtml += '</select>';
    } else {
      formHtml += `<input type="${field.type}" name="${field.name}" ${field.required ? 'required' : ''}>`;
    }
  });
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

// Households
async function loadHouseholds() {
  try {
    const households = await getHouseholds();
    displayList('households-list', households, [
      { name: 'name', label: 'Name' },
      { name: 'ward', label: 'Ward' },
      { name: 'waste_generated_per_day', label: 'Waste/Day' }
    ], editHousehold, deleteHousehold);
  } catch (error) {
    console.error('Error loading households:', error);
  }
}

function addHousehold() {
  const formHtml = createForm([
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'ward', label: 'Ward', type: 'text', required: true },
    { name: 'waste_generated_per_day', label: 'Waste Generated per Day', type: 'number', required: true },
    { name: 'contact_info', label: 'Contact Info', type: 'text' },
    { name: 'household_type', label: 'Type', type: 'select', options: [
      { value: 'residential', label: 'Residential' },
      { value: 'commercial', label: 'Commercial' },
      { value: 'industrial', label: 'Industrial' }
    ]},
    { name: 'lat', label: 'Latitude', type: 'number', required: true },
    { name: 'lng', label: 'Longitude', type: 'number', required: true }
  ], submitHouseholdForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitHouseholdForm);
}

async function submitHouseholdForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  // Submit to API
  console.log('Submitting household:', data);
  // Close modal and reload
  document.getElementById('modal').style.display = 'none';
  loadHouseholds();
}

function editHousehold(id) {
  console.log('Edit household:', id);
}

function deleteHousehold(id) {
  console.log('Delete household:', id);
}

// Bins
async function loadBins() {
  try {
    const bins = await getBins();
    displayList('bins-list', bins, [
      { name: 'id', label: 'ID' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'fill_level', label: 'Fill Level' },
      { name: 'status', label: 'Status' }
    ], editBin, deleteBin);
  } catch (error) {
    console.error('Error loading bins:', error);
  }
}

function addBin() {
  const formHtml = createForm([
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'bin_type', label: 'Type', type: 'select', options: [
      { value: 'standard', label: 'Standard' },
      { value: 'large', label: 'Large' },
      { value: 'small', label: 'Small' }
    ]},
    { name: 'lat', label: 'Latitude', type: 'number', required: true },
    { name: 'lng', label: 'Longitude', type: 'number', required: true }
  ], submitBinForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitBinForm);
}

async function submitBinForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting bin:', data);
  document.getElementById('modal').style.display = 'none';
  loadBins();
}

function editBin(id) {
  console.log('Edit bin:', id);
}

function deleteBin(id) {
  console.log('Delete bin:', id);
}

// Users
async function loadUsers() {
  try {
    const users = await getUsers();
    displayList('users-list', users, [
      { name: 'username', label: 'Username' },
      { name: 'email', label: 'Email' },
      { name: 'role', label: 'Role' }
    ], editUser, deleteUser);
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
  ], submitUserForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitUserForm);
}

async function submitUserForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting user:', data);
  document.getElementById('modal').style.display = 'none';
  loadUsers();
}

function editUser(id) {
  console.log('Edit user:', id);
}

function deleteUser(id) {
  console.log('Delete user:', id);
}

// Vehicles
async function loadVehicles() {
  try {
    const vehicles = await getVehicles();
    displayList('vehicles-list', vehicles, [
      { name: 'license_plate', label: 'License Plate' },
      { name: 'capacity', label: 'Capacity' },
      { name: 'vehicle_type', label: 'Type' },
      { name: 'status', label: 'Status' }
    ], editVehicle, deleteVehicle);
  } catch (error) {
    console.error('Error loading vehicles:', error);
  }
}

function addVehicle() {
  const formHtml = createForm([
    { name: 'license_plate', label: 'License Plate', type: 'text', required: true },
    { name: 'capacity', label: 'Capacity', type: 'number', required: true },
    { name: 'vehicle_type', label: 'Type', type: 'text', required: true }
  ], submitVehicleForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitVehicleForm);
}

async function submitVehicleForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting vehicle:', data);
  document.getElementById('modal').style.display = 'none';
  loadVehicles();
}

function editVehicle(id) {
  console.log('Edit vehicle:', id);
}

function deleteVehicle(id) {
  console.log('Delete vehicle:', id);
}

// Collections
async function loadCollections() {
  try {
    const collections = await getCollections();
    displayList('collections-list', collections, [
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'vehicle_id', label: 'Vehicle ID' },
      { name: 'waste_amount_collected', label: 'Waste Amount' },
      { name: 'collected_at', label: 'Collected At' }
    ], editCollection, deleteCollection);
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
  ], submitCollectionForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitCollectionForm);
}

async function submitCollectionForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting collection:', data);
  document.getElementById('modal').style.display = 'none';
  loadCollections();
}

function editCollection(id) {
  console.log('Edit collection:', id);
}

function deleteCollection(id) {
  console.log('Delete collection:', id);
}

// Sensors
async function loadSensors() {
  try {
    const sensors = await getSensors();
    displayList('sensors-list', sensors, [
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'sensor_type', label: 'Type' },
      { name: 'last_reading', label: 'Last Reading' },
      { name: 'battery_level', label: 'Battery' }
    ], editSensor, deleteSensor);
  } catch (error) {
    console.error('Error loading sensors:', error);
  }
}

function addSensor() {
  const formHtml = createForm([
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'sensor_type', label: 'Type', type: 'text', required: true }
  ], submitSensorForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitSensorForm);
}

async function submitSensorForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting sensor:', data);
  document.getElementById('modal').style.display = 'none';
  loadSensors();
}

function editSensor(id) {
  console.log('Edit sensor:', id);
}

function deleteSensor(id) {
  console.log('Delete sensor:', id);
}

// Maintenance
async function loadMaintenance() {
  try {
    const maintenance = await getMaintenance();
    displayList('maintenance-list', maintenance, [
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'maintenance_type', label: 'Type' },
      { name: 'scheduled_date', label: 'Scheduled' },
      { name: 'status', label: 'Status' }
    ], editMaintenance, deleteMaintenance);
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
  ], submitMaintenanceForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitMaintenanceForm);
}

async function submitMaintenanceForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting maintenance:', data);
  document.getElementById('modal').style.display = 'none';
  loadMaintenance();
}

function editMaintenance(id) {
  console.log('Edit maintenance:', id);
}

function deleteMaintenance(id) {
  console.log('Delete maintenance:', id);
}

// Routes
async function loadRoutes() {
  try {
    const routes = await getRoutes();
    displayList('routes-list', routes, [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Description' },
      { name: 'status', label: 'Status' }
    ], editRoute, deleteRoute);
  } catch (error) {
    console.error('Error loading routes:', error);
  }
}

function addRoute() {
  const formHtml = createForm([
    { name: 'name', label: 'Name', type: 'text', required: true },
    { name: 'description', label: 'Description', type: 'text' }
  ], submitRouteForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitRouteForm);
}

async function submitRouteForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting route:', data);
  document.getElementById('modal').style.display = 'none';
  loadRoutes();
}

function editRoute(id) {
  console.log('Edit route:', id);
}

function deleteRoute(id) {
  console.log('Delete route:', id);
}

// Waste Types
async function loadWasteTypes() {
  try {
    const wasteTypes = await getWasteTypes();
    displayList('waste-types-list', wasteTypes, [
      { name: 'name', label: 'Name' },
      { name: 'description', label: 'Description' },
      { name: 'recyclable', label: 'Recyclable' }
    ], editWasteType, deleteWasteType);
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
  ], submitWasteTypeForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitWasteTypeForm);
}

async function submitWasteTypeForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting waste type:', data);
  document.getElementById('modal').style.display = 'none';
  loadWasteTypes();
}

function editWasteType(id) {
  console.log('Edit waste type:', id);
}

function deleteWasteType(id) {
  console.log('Delete waste type:', id);
}

// Assignments
async function loadAssignments() {
  try {
    const assignments = await getAssignments();
    displayList('assignments-list', assignments, [
      { name: 'household_id', label: 'Household ID' },
      { name: 'bin_id', label: 'Bin ID' },
      { name: 'priority', label: 'Priority' }
    ], editAssignment, deleteAssignment);
  } catch (error) {
    console.error('Error loading assignments:', error);
  }
}

function addAssignment() {
  const formHtml = createForm([
    { name: 'household_id', label: 'Household ID', type: 'number', required: true },
    { name: 'bin_id', label: 'Bin ID', type: 'number', required: true },
    { name: 'priority', label: 'Priority', type: 'number' }
  ], submitAssignmentForm);
  showModal(formHtml);
  document.getElementById('entity-form').addEventListener('submit', submitAssignmentForm);
}

async function submitAssignmentForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  const data = Object.fromEntries(formData);
  console.log('Submitting assignment:', data);
  document.getElementById('modal').style.display = 'none';
  loadAssignments();
}

function editAssignment(id) {
  console.log('Edit assignment:', id);
}

function deleteAssignment(id) {
  console.log('Delete assignment:', id);
}

// Analysis functions
async function findFarHouseholds() {
  try {
    const farHouseholds = await getFarHouseholds();
    console.log('Far households:', farHouseholds);
    // Update map markers
  } catch (error) {
    console.error('Error finding far households:', error);
  }
}

async function suggestNewBins() {
  try {
    const suggestions = await getSuggestedBins();
    console.log('Suggested bins:', suggestions);
    // Update map markers
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
window.loadHouseholds = loadHouseholds;
window.loadBins = loadBins;
window.loadUsers = loadUsers;
window.loadVehicles = loadVehicles;
window.loadCollections = loadCollections;
window.loadSensors = loadSensors;
window.loadMaintenance = loadMaintenance;
window.loadRoutes = loadRoutes;
window.loadWasteTypes = loadWasteTypes;
window.loadAssignments = loadAssignments;
window.findFarHouseholds = findFarHouseholds;
window.suggestNewBins = suggestNewBins;
