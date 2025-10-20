import express from 'express';
import { getMaintenances, getMaintenance, addMaintenance, editMaintenance, removeMaintenance } from '../controllers/maintenanceController.js';

const router = express.Router();

router.get('/', getMaintenances);
router.get('/:id', getMaintenance);
router.post('/', addMaintenance);
router.put('/:id', editMaintenance);
router.delete('/:id', removeMaintenance);

export default router;
