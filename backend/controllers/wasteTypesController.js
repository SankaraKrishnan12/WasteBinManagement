import { getAllWasteTypes, getWasteTypeById, createWasteType, updateWasteType, deleteWasteType } from '../models/wasteTypesModel.js';

export async function getWasteTypes(req, res) {
  try {
    const wasteTypes = await getAllWasteTypes();
    res.json(wasteTypes);
  } catch (err) {
    console.error('getWasteTypes error', err);
    res.status(500).json({ error: 'Failed to fetch waste types' });
  }
}

export async function getWasteType(req, res) {
  try {
    const id = Number(req.params.id);
    const wasteType = await getWasteTypeById(id);
    if (!wasteType) return res.status(404).json({ error: 'Waste type not found' });
    res.json(wasteType);
  } catch (err) {
    console.error('getWasteType error', err);
    res.status(500).json({ error: 'Failed to fetch waste type' });
  }
}

export async function addWasteType(req, res) {
  try {
    const wasteType = await createWasteType(req.body);
    res.status(201).json(wasteType);
  } catch (err) {
    console.error('addWasteType error', err);
    res.status(500).json({ error: 'Failed to create waste type' });
  }
}

export async function editWasteType(req, res) {
  try {
    const id = Number(req.params.id);
    const wasteType = await updateWasteType(id, req.body);
    if (!wasteType) return res.status(404).json({ error: 'Waste type not found' });
    res.json(wasteType);
  } catch (err) {
    console.error('editWasteType error', err);
    res.status(500).json({ error: 'Failed to update waste type' });
  }
}

export async function removeWasteType(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteWasteType(id);
    if (!result) return res.status(404).json({ error: 'Waste type not found' });
    res.json({ message: 'Waste type deleted' });
  } catch (err) {
    console.error('removeWasteType error', err);
    res.status(500).json({ error: 'Failed to delete waste type' });
  }
}
