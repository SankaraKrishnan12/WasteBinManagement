import express from 'express';
import { getAssignments, getAssignment, addAssignment, editAssignment, removeAssignment, getAssignmentsByHouseholdHandler, getAssignmentsByBinHandler } from '../controllers/assignmentsController.js';

const router = express.Router();

router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.get('/household/:householdId', getAssignmentsByHouseholdHandler);
router.get('/bin/:binId', getAssignmentsByBinHandler);
router.post('/', addAssignment);
router.put('/:id', editAssignment);
router.delete('/:id', removeAssignment);

export default router;
