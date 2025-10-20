import express from 'express';
import { getCollections, getCollection, addCollection, editCollection, removeCollection } from '../controllers/collectionsController.js';

const router = express.Router();

router.get('/', getCollections);
router.get('/:id', getCollection);
router.post('/', addCollection);
router.put('/:id', editCollection);
router.delete('/:id', removeCollection);

export default router;
