// backend/routes/binsRoutes.js
import express from 'express';
import * as ctrl from '../controllers/binsController.js';

const router = express.Router();

/*
Routes:
GET    /api/bins
GET    /api/bins/:id
POST   /api/bins
PUT    /api/bins/:id
DELETE /api/bins/:id
*/

router.get('/', ctrl.listBins);
router.get('/:id', ctrl.getBin);
router.post('/', ctrl.createBin);
router.put('/:id', ctrl.updateBin);
router.delete('/:id', ctrl.removeBin);

export default router;
