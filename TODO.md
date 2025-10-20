# TODO: Enrich Smart Waste Bin Database

## Overview
Enrich the database by adding more tables and relations to model a graph-like structure and enable OLAP operations for the Smart Waste Bin Optimization & Management System.

## Steps
1. **Update setup.sql**: Add new tables including users, vehicles, collections, waste_types, sensors, maintenance, routes, junction tables (e.g., household_bin_assignments), time dimensions, and fact tables for OLAP (e.g., waste_collection_facts, daily_waste_facts).
2. **Update sample_data.sql**: Insert sample data for all new tables to demonstrate the enriched schema.
3. **Update models**: Modify backend models (binsModel.js, householdsModel.js, suggestedModel.js) and add new models for the added tables to support CRUD operations.
4. **Add OLAP views/queries**: Create views or functions in setup.sql for OLAP operations like aggregations on waste generation, collection efficiency, etc.
5. **Test database setup**: Run the updated SQL scripts to ensure no errors and data integrity.
6. **Update controllers and routes**: Add new endpoints in controllers and routes for the new entities (e.g., users, vehicles, collections).
7. **Frontend updates**: If needed, update frontend to display or interact with new data (e.g., sensor data, routes).

## Progress Tracking
- [x] Step 1: Update setup.sql
- [x] Step 2: Update sample_data.sql
- [x] Step 3: Update models
- [x] Step 4: Add OLAP views/queries
- [x] Step 5: Test database setup
- [ ] Step 6: Update controllers and routes
- [ ] Step 7: Frontend updates
