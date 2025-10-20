import express from 'express';
import { getVehicles, getVehicle, addVehicle, editVehicle, removeVehicle } from '../controllers/vehiclesController.js';

const router = express.Router();

router.get('/', getVehicles);
router.get('/:id', getVehicle);
router.post('/', addVehicle);
router.put('/:id', editVehicle);
router.delete('/:id', removeVehicle);

export default router;
