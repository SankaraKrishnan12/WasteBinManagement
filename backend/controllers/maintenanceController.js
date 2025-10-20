import { getAllMaintenance, getMaintenanceById, createMaintenance, updateMaintenance, deleteMaintenance } from '../models/maintenanceModel.js';

export async function getMaintenances(req, res) {
  try {
    const maintenances = await getAllMaintenance();
    res.json(maintenances);
  } catch (err) {
    console.error('getMaintenances error', err);
    res.status(500).json({ error: 'Failed to fetch maintenances' });
  }
}

export async function getMaintenance(req, res) {
  try {
    const id = Number(req.params.id);
    const maintenance = await getMaintenanceById(id);
    if (!maintenance) return res.status(404).json({ error: 'Maintenance not found' });
    res.json(maintenance);
  } catch (err) {
    console.error('getMaintenance error', err);
    res.status(500).json({ error: 'Failed to fetch maintenance' });
  }
}

export async function addMaintenance(req, res) {
  try {
    const maintenance = await createMaintenance(req.body);
    res.status(201).json(maintenance);
  } catch (err) {
    console.error('addMaintenance error', err);
    res.status(500).json({ error: 'Failed to create maintenance' });
  }
}

export async function editMaintenance(req, res) {
  try {
    const id = Number(req.params.id);
    const maintenance = await updateMaintenance(id, req.body);
    if (!maintenance) return res.status(404).json({ error: 'Maintenance not found' });
    res.json(maintenance);
  } catch (err) {
    console.error('editMaintenance error', err);
    res.status(500).json({ error: 'Failed to update maintenance' });
  }
}

export async function removeMaintenance(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteMaintenance(id);
    if (!result) return res.status(404).json({ error: 'Maintenance not found' });
    res.json({ message: 'Maintenance deleted' });
  } catch (err) {
    console.error('removeMaintenance error', err);
    res.status(500).json({ error: 'Failed to delete maintenance' });
  }
}
