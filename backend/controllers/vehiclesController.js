import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../models/vehiclesModel.js';

export async function getVehicles(req, res) {
  try {
    const vehicles = await getAllVehicles();
    res.json(vehicles);
  } catch (err) {
    console.error('getVehicles error', err);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
}

export async function getVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const vehicle = await getVehicleById(id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error('getVehicle error', err);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
}

export async function addVehicle(req, res) {
  try {
    const vehicle = await createVehicle(req.body);
    res.status(201).json(vehicle);
  } catch (err) {
    console.error('addVehicle error', err);
    res.status(500).json({ error: 'Failed to create vehicle' });
  }
}

export async function editVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const vehicle = await updateVehicle(id, req.body);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(vehicle);
  } catch (err) {
    console.error('editVehicle error', err);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
}

export async function removeVehicle(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteVehicle(id);
    if (!result) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (err) {
    console.error('removeVehicle error', err);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
}
