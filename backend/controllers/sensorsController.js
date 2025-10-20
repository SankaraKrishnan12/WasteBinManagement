import { getAllSensors, getSensorById, createSensor, updateSensor, deleteSensor } from '../models/sensorsModel.js';

export async function getSensors(req, res) {
  try {
    const sensors = await getAllSensors();
    res.json(sensors);
  } catch (err) {
    console.error('getSensors error', err);
    res.status(500).json({ error: 'Failed to fetch sensors' });
  }
}

export async function getSensor(req, res) {
  try {
    const id = Number(req.params.id);
    const sensor = await getSensorById(id);
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
    res.json(sensor);
  } catch (err) {
    console.error('getSensor error', err);
    res.status(500).json({ error: 'Failed to fetch sensor' });
  }
}

export async function addSensor(req, res) {
  try {
    const sensor = await createSensor(req.body);
    res.status(201).json(sensor);
  } catch (err) {
    console.error('addSensor error', err);
    res.status(500).json({ error: 'Failed to create sensor' });
  }
}

export async function editSensor(req, res) {
  try {
    const id = Number(req.params.id);
    const sensor = await updateSensor(id, req.body);
    if (!sensor) return res.status(404).json({ error: 'Sensor not found' });
    res.json(sensor);
  } catch (err) {
    console.error('editSensor error', err);
    res.status(500).json({ error: 'Failed to update sensor' });
  }
}

export async function removeSensor(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteSensor(id);
    if (!result) return res.status(404).json({ error: 'Sensor not found' });
    res.json({ message: 'Sensor deleted' });
  } catch (err) {
    console.error('removeSensor error', err);
    res.status(500).json({ error: 'Failed to delete sensor' });
  }
}
