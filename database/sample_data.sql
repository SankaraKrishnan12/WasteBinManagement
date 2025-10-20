-- -----------------------------
-- Sample Users
-- -----------------------------
INSERT INTO users (username, email, password_hash, role)
VALUES
('admin1', 'admin@wastebin.com', '$2b$10$dummyhash', 'admin'),
('collector1', 'collector1@wastebin.com', '$2b$10$dummyhash', 'collector'),
('collector2', 'collector2@wastebin.com', '$2b$10$dummyhash', 'collector'),
('manager1', 'manager@wastebin.com', '$2b$10$dummyhash', 'manager');

-- -----------------------------
-- Sample Waste Types
-- -----------------------------
INSERT INTO waste_types (name, description, recyclable)
VALUES
('Organic', 'Food waste, yard waste', FALSE),
('Plastic', 'Plastic bottles, bags', TRUE),
('Paper', 'Newspapers, cardboard', TRUE),
('Glass', 'Glass bottles, jars', TRUE),
('Metal', 'Cans, foil', TRUE),
('Mixed', 'Non-recyclable waste', FALSE);

-- -----------------------------
-- Sample Vehicles
-- -----------------------------
INSERT INTO vehicles (license_plate, capacity, vehicle_type, assigned_user_id, status)
VALUES
('ABC-123', 5000, 'Truck', 2, 'active'),
('DEF-456', 4000, 'Van', 3, 'active'),
('GHI-789', 3000, 'Truck', NULL, 'maintenance');

-- -----------------------------
-- Sample Households
-- -----------------------------
INSERT INTO households (name, ward, waste_generated_per_day, location, contact_info, household_type)
VALUES
('House A', 'Ward 1', 2.5, ST_SetSRID(ST_Point(80.2700, 13.0830), 4326)::geography, 'contactA@example.com', 'residential'),
('House B', 'Ward 1', 1.8, ST_SetSRID(ST_Point(80.2720, 13.0840), 4326)::geography, 'contactB@example.com', 'residential'),
('House C', 'Ward 2', 3.0, ST_SetSRID(ST_Point(80.2750, 13.0810), 4326)::geography, 'contactC@example.com', 'commercial'),
('House D', 'Ward 2', 2.2, ST_SetSRID(ST_Point(80.2780, 13.0820), 4326)::geography, 'contactD@example.com', 'residential'),
('House E', 'Ward 3', 1.5, ST_SetSRID(ST_Point(80.2790, 13.0850), 4326)::geography, 'contactE@example.com', 'residential'),
('House F', 'Ward 3', 2.8, ST_SetSRID(ST_Point(80.2800, 13.0860), 4326)::geography, 'contactF@example.com', 'industrial');

-- -----------------------------
-- Sample Bins
-- -----------------------------
INSERT INTO bins (capacity, last_collected, location, bin_type, fill_level, status)
VALUES
(100, '2025-10-15 08:00:00', ST_SetSRID(ST_Point(80.2710, 13.0835), 4326)::geography, 'standard', 45, 'active'),
(120, '2025-10-15 09:30:00', ST_SetSRID(ST_Point(80.2770, 13.0825), 4326)::geography, 'large', 30, 'active'),
(80, NULL, ST_SetSRID(ST_Point(80.2730, 13.0845), 4326)::geography, 'small', 0, 'maintenance');

-- -----------------------------
-- Sample Suggested Bins
-- -----------------------------
INSERT INTO suggested_bins (reason, location, suggested_capacity)
VALUES
('High waste generation area', ST_SetSRID(ST_Point(80.2760, 13.0830), 4326)::geography, 150),
('New residential development', ST_SetSRID(ST_Point(80.2810, 13.0870), 4326)::geography, 100);

-- -----------------------------
-- Sample Sensors
-- -----------------------------
INSERT INTO sensors (bin_id, sensor_type, last_reading, last_reading_time, battery_level, status)
VALUES
(1, 'Fill Level Sensor', 45.0, '2025-10-15 10:00:00', 85, 'active'),
(2, 'Weight Sensor', 36.0, '2025-10-15 10:15:00', 92, 'active'),
(3, 'Ultrasonic Sensor', 0.0, '2025-10-15 09:00:00', 78, 'faulty');

-- -----------------------------
-- Sample Collections
-- -----------------------------
INSERT INTO collections (bin_id, vehicle_id, collector_id, collected_at, waste_amount_collected, waste_type_id, notes)
VALUES
(1, 1, 2, '2025-10-15 08:00:00', 40.5, 6, 'Mixed waste collection'),
(2, 1, 2, '2025-10-15 09:30:00', 35.0, 1, 'Organic waste'),
(1, 2, 3, '2025-10-14 08:00:00', 38.0, 6, 'Regular collection');

-- -----------------------------
-- Sample Maintenance
-- -----------------------------
INSERT INTO maintenance (bin_id, scheduled_date, completed_date, maintenance_type, description, technician_id, cost, status)
VALUES
(3, '2025-10-16 10:00:00', NULL, 'Repair', 'Fix faulty sensor', 4, 150.00, 'scheduled'),
(1, '2025-10-10 09:00:00', '2025-10-10 11:00:00', 'Cleaning', 'Deep clean bin', 4, 75.00, 'completed');

-- -----------------------------
-- Sample Routes
-- -----------------------------
INSERT INTO routes (name, description, created_by, estimated_duration, status)
VALUES
('Ward 1 Route', 'Morning collection for Ward 1', 1, '2 hours', 'active'),
('Ward 2-3 Route', 'Afternoon collection for Wards 2 and 3', 1, '3 hours', 'planned');

-- -----------------------------
-- Sample Household-Bin Assignments
-- -----------------------------
INSERT INTO household_bin_assignments (household_id, bin_id, priority)
VALUES
(1, 1, 1),
(2, 1, 2),
(3, 2, 1),
(4, 2, 2),
(5, 2, 3),
(6, 2, 1);

-- -----------------------------
-- Sample Route-Bins
-- -----------------------------
INSERT INTO route_bins (route_id, bin_id, sequence_order, estimated_arrival_time)
VALUES
(1, 1, 1, '2025-10-16 08:00:00'),
(1, 3, 2, '2025-10-16 08:30:00'),
(2, 2, 1, '2025-10-16 14:00:00');

-- -----------------------------
-- Sample Time Dimension (for a few days)
-- -----------------------------
INSERT INTO time_dimension (date, year, month, day, weekday, week_of_year, quarter)
VALUES
('2025-10-14', 2025, 10, 14, 'Tuesday', 42, 4),
('2025-10-15', 2025, 10, 15, 'Wednesday', 42, 4),
('2025-10-16', 2025, 10, 16, 'Thursday', 42, 4);

-- -----------------------------
-- Sample Waste Collection Facts
-- -----------------------------
INSERT INTO waste_collection_facts (time_id, bin_id, household_id, collection_id, waste_type_id, waste_amount, collection_duration, distance_traveled, fuel_consumed)
VALUES
(2, 1, 1, 1, 6, 40.5, '00:15:00', 2.5, 1.2),
(2, 2, 3, 2, 1, 35.0, '00:12:00', 3.0, 1.5),
(1, 1, 1, 3, 6, 38.0, '00:18:00', 2.8, 1.3);

-- -----------------------------
-- Sample Daily Waste Facts
-- -----------------------------
INSERT INTO daily_waste_facts (time_id, household_id, ward, waste_generated, waste_type_id, weather_condition, temperature)
VALUES
(2, 1, 'Ward 1', 2.5, 6, 'Sunny', 28.5),
(2, 2, 'Ward 1', 1.8, 1, 'Sunny', 28.5),
(2, 3, 'Ward 2', 3.0, 6, 'Cloudy', 26.0),
(2, 4, 'Ward 2', 2.2, 2, 'Cloudy', 26.0),
(2, 5, 'Ward 3', 1.5, 3, 'Rainy', 24.0),
(2, 6, 'Ward 3', 2.8, 6, 'Rainy', 24.0);
