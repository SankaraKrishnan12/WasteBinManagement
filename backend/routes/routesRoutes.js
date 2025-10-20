import express from 'express';
import { getRoutes, getRoute, getRouteBinsHandler, addRoute, editRoute, removeRoute, addBinToRouteHandler, removeBinFromRouteHandler } from '../controllers/routesController.js';

const router = express.Router();

router.get('/', getRoutes);
router.get('/:id', getRoute);
router.get('/:routeId/bins', getRouteBinsHandler);
router.post('/', addRoute);
router.put('/:id', editRoute);
router.delete('/:id', removeRoute);
router.post('/:routeId/bins', addBinToRouteHandler);
router.delete('/:routeId/bins/:binId', removeBinFromRouteHandler);

export default router;
