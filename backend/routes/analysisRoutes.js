// backend/routes/analysisRoutes.js
import express from 'express';
import * as ctrl from '../controllers/analysisController.js';

const router = express.Router();

/*
Analysis endpoints:
GET  /api/analysis/far-households?dist=300     -> households farther than dist (m)
POST /api/analysis/suggest                     -> body: { dist: 300 } -> insert centroid suggested_bins
GET  /api/analysis/bin-coverage/:binId?dist=300
GET  /api/analysis/avg-distance-per-ward
GET  /api/analysis/suggested                    -> get inserted suggestions
*/

router.get('/far-households', ctrl.farHouseholds);
router.post('/suggest', ctrl.suggestBins);            
router.post('/getsuggest', ctrl.getSuggestedBins);            
router.get('/bin-coverage/:binId', ctrl.binCoverage);
router.get('/avg-distance-per-ward', ctrl.avgDistancePerWard);

export default router;
