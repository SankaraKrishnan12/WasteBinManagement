// backend/app.js
import express from 'express';
import cors from 'cors';
import householdsRoutes from './routes/householdsRoutes.js';
import binsRoutes from './routes/binsRoutes.js';
import analysisRoutes from './routes/analysisRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import vehiclesRoutes from './routes/vehiclesRoutes.js';
import collectionsRoutes from './routes/collectionsRoutes.js';
import sensorsRoutes from './routes/sensorsRoutes.js';
import maintenanceRoutes from './routes/maintenanceRoutes.js';
import routesRoutes from './routes/routesRoutes.js';
import wasteTypesRoutes from './routes/wasteTypesRoutes.js';
import assignmentsRoutes from './routes/assignmentsRoutes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/households', householdsRoutes);
app.use('/api/bins', binsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/collections', collectionsRoutes);
app.use('/api/sensors', sensorsRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/routes', routesRoutes);
app.use('/api/waste-types', wasteTypesRoutes);
app.use('/api/assignments', assignmentsRoutes);

app.get('/', (req, res) => {
  res.send('🌍 Smart Waste Bin Optimization Backend is running.');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend listening on http://localhost:${PORT}`));
