import { getAllRoutes, getRouteById, getRouteBins, createRoute, updateRoute, deleteRoute, addBinToRoute, removeBinFromRoute } from '../models/routesModel.js';

export async function getRoutes(req, res) {
  try {
    const routes = await getAllRoutes();
    res.json(routes);
  } catch (err) {
    console.error('getRoutes error', err);
    res.status(500).json({ error: 'Failed to fetch routes' });
  }
}

export async function getRoute(req, res) {
  try {
    const id = Number(req.params.id);
    const route = await getRouteById(id);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    console.error('getRoute error', err);
    res.status(500).json({ error: 'Failed to fetch route' });
  }
}

export async function getRouteBinsHandler(req, res) {
  try {
    const routeId = Number(req.params.routeId);
    const bins = await getRouteBins(routeId);
    res.json(bins);
  } catch (err) {
    console.error('getRouteBins error', err);
    res.status(500).json({ error: 'Failed to fetch route bins' });
  }
}

export async function addRoute(req, res) {
  try {
    const route = await createRoute(req.body);
    res.status(201).json(route);
  } catch (err) {
    console.error('addRoute error', err);
    res.status(500).json({ error: 'Failed to create route' });
  }
}

export async function editRoute(req, res) {
  try {
    const id = Number(req.params.id);
    const route = await updateRoute(id, req.body);
    if (!route) return res.status(404).json({ error: 'Route not found' });
    res.json(route);
  } catch (err) {
    console.error('editRoute error', err);
    res.status(500).json({ error: 'Failed to update route' });
  }
}

export async function removeRoute(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await deleteRoute(id);
    if (!result) return res.status(404).json({ error: 'Route not found' });
    res.json({ message: 'Route deleted' });
  } catch (err) {
    console.error('removeRoute error', err);
    res.status(500).json({ error: 'Failed to delete route' });
  }
}

export async function addBinToRouteHandler(req, res) {
  try {
    const routeId = Number(req.params.routeId);
    const { binId, sequenceOrder, estimatedArrivalTime } = req.body;
    const result = await addBinToRoute(routeId, binId, sequenceOrder, estimatedArrivalTime);
    res.status(201).json(result);
  } catch (err) {
    console.error('addBinToRoute error', err);
    res.status(500).json({ error: 'Failed to add bin to route' });
  }
}

export async function removeBinFromRouteHandler(req, res) {
  try {
    const routeId = Number(req.params.routeId);
    const binId = Number(req.params.binId);
    const result = await removeBinFromRoute(routeId, binId);
    if (!result) return res.status(404).json({ error: 'Bin not found in route' });
    res.json({ message: 'Bin removed from route' });
  } catch (err) {
    console.error('removeBinFromRoute error', err);
    res.status(500).json({ error: 'Failed to remove bin from route' });
  }
}
