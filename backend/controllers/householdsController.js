// backend/controllers/householdsController.js
import * as model from '../models/householdsModel.js';

export async function listHouseholds(req, res) {
  try {
    const rows = await model.getAllHouseholds();
    res.json(rows);
  } catch (err) {
    console.error('listHouseholds error', err);
    res.status(500).json({ error: 'Failed to fetch households' });
  }
}

export async function getHousehold(req, res) {
  try {
    const id = Number(req.params.id);
    const row = await model.getHouseholdById(id);
    if (!row) return res.status(404).json({ error: 'Household not found' });
    res.json(row);
  } catch (err) {
    console.error('getHousehold error', err);
    res.status(500).json({ error: 'Failed to fetch household' });
  }
}

export async function createHousehold(req, res) {
  try {
    // Expect body: { name, ward, waste_generated_per_day, lat, lng }
    const payload = req.body;
    const created = await model.createHousehold(payload);
    res.status(201).json(created);
  } catch (err) {
    console.error('createHousehold error', err);
    res.status(500).json({ error: 'Failed to create household' });
  }
}

export async function updateHousehold(req, res) {
  try {
    const id = Number(req.params.id);
    const payload = req.body;
    const updated = await model.updateHousehold(id, payload);
    if (!updated) return res.status(404).json({ error: 'Household not found' });
    res.json(updated);
  } catch (err) {
    console.error('updateHousehold error', err);
    res.status(500).json({ error: 'Failed to update household' });
  }
}

export async function removeHousehold(req, res) {
  try {
    const id = Number(req.params.id);
    const deleted = await model.deleteHousehold(id);
    if (!deleted) return res.status(404).json({ error: 'Household not found' });
    res.json({ deleted: deleted.id });
  } catch (err) {
    console.error('removeHousehold error', err);
    res.status(500).json({ error: 'Failed to delete household' });
  }
}
