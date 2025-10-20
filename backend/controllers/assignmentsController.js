import { getAllAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment, getAssignmentsByHousehold, getAssignmentsByBin } from '../models/assignmentsModel.js';

export async function getAssignments(req, res) {
  try {
    const assignments = await getAllAssignments();
    res.json(assignments);
  } catch (err) {
    console.error('getAssignments error', err);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
}

export async function getAssignment(req, res) {
  try {
    const id = Number(req.params.id);
    const assignment = await getAssignmentById(id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    console.error('getAssignment error', err);
    res.status(500).json({ error: 'Failed to fetch assignment' });
  }
}

export async function addAssignment(req, res) {
  try {
    const assignment = await createAssignment(req.body);
    res.status(201).json(assignment);
  } catch (err) {
    console.error('addAssignment error', err);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
}

export async function editAssignment(req, res) {
  try {
    const id = Number(req.params.id);
    const assignment = await updateAssignment(id, req.body);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    console.error('editAssignment error', err);
    res.status(500).json({ error: 'Failed to update assignment' });
  }
}

export async function removeAssignment(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteAssignment(id);
    if (!result) return res.status(404).json({ error: 'Assignment not found' });
    res.json({ message: 'Assignment deleted' });
  } catch (err) {
    console.error('removeAssignment error', err);
    res.status(500).json({ error: 'Failed to delete assignment' });
  }
}

export async function getAssignmentsByHouseholdHandler(req, res) {
  try {
    const householdId = Number(req.params.householdId);
    const assignments = await getAssignmentsByHousehold(householdId);
    res.json(assignments);
  } catch (err) {
    console.error('getAssignmentsByHousehold error', err);
    res.status(500).json({ error: 'Failed to fetch assignments by household' });
  }
}

export async function getAssignmentsByBinHandler(req, res) {
  try {
    const binId = Number(req.params.binId);
    const assignments = await getAssignmentsByBin(binId);
    res.json(assignments);
  } catch (err) {
    console.error('getAssignmentsByBin error', err);
    res.status(500).json({ error: 'Failed to fetch assignments by bin' });
  }
}
