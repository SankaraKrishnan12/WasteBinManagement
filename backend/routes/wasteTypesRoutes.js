import express from 'express';
import { getWasteTypes, getWasteType, addWasteType, editWasteType, removeWasteType } from '../controllers/wasteTypesController.js';

const router = express.Router();

router.get('/', getWasteTypes);
router.get('/:id', getWasteType);
router.post('/', addWasteType);
router.put('/:id', editWasteType);
router.delete('/:id', removeWasteType);

export default router;
