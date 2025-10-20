// backend/routes/householdsRoutes.js
import express from 'express';
import * as ctrl from '../controllers/householdsController.js';

const router = express.Router();

/*
Routes:
GET    /api/households         -> list all
GET    /api/households/:id     -> get one
POST   /api/households         -> create
PUT    /api/households/:id     -> update
DELETE /api/households/:id     -> delete
*/

router.get('/', ctrl.listHouseholds);
router.get('/:id', ctrl.getHousehold);
router.post('/', ctrl.createHousehold);
router.put('/:id', ctrl.updateHousehold);
router.delete('/:id', ctrl.removeHousehold);

export default router;
