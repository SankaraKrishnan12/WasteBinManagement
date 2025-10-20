import express from 'express';
import { getSensors, getSensor, addSensor, editSensor, removeSensor } from '../controllers/sensorsController.js';

const router = express.Router();

router.get('/', getSensors);
router.get('/:id', getSensor);
router.post('/', addSensor);
router.put('/:id', editSensor);
router.delete('/:id', removeSensor);

export default router;
