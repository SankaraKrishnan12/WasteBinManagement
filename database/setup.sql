-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table (admins, collectors, etc.)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'collector', 'manager')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Waste types table
CREATE TABLE IF NOT EXISTS waste_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    recyclable BOOLEAN DEFAULT FALSE
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    capacity INTEGER NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    assigned_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive'))
);

-- Households table
CREATE TABLE IF NOT EXISTS households (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150),
    ward VARCHAR(50),
    waste_generated_per_day FLOAT,
    location GEOGRAPHY(Point, 4326),
    contact_info VARCHAR(255),
    household_type VARCHAR(50) DEFAULT 'residential' CHECK (household_type IN ('residential', 'commercial', 'industrial'))
);

-- Bins table
CREATE TABLE IF NOT EXISTS bins (
    id SERIAL PRIMARY KEY,
    capacity INTEGER,
    last_collected TIMESTAMP,
    location GEOGRAPHY(Point, 4326),
    bin_type VARCHAR(50) DEFAULT 'standard',
    fill_level INTEGER DEFAULT 0 CHECK (fill_level >= 0 AND fill_level <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'full', 'inactive'))
);

-- Suggested bins table
CREATE TABLE IF NOT EXISTS suggested_bins (
    id SERIAL PRIMARY KEY,
    reason TEXT,
    location GEOGRAPHY(Point, 4326),
    suggested_capacity INTEGER DEFAULT 100,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sensors table (attached to bins)
CREATE TABLE IF NOT EXISTS sensors (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
    sensor_type VARCHAR(50) NOT NULL,
    last_reading FLOAT,
    last_reading_time TIMESTAMP,
    battery_level INTEGER DEFAULT 100 CHECK (battery_level >= 0 AND battery_level <= 100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'faulty', 'inactive'))
);

-- Collections table (records of bin emptying)
CREATE TABLE IF NOT EXISTS collections (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
    vehicle_id INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
    collector_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    collected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    waste_amount_collected FLOAT,
    waste_type_id INTEGER REFERENCES waste_types(id) ON DELETE SET NULL,
    notes TEXT
);

-- Maintenance table
CREATE TABLE IF NOT EXISTS maintenance (
    id SERIAL PRIMARY KEY,
    bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
    scheduled_date TIMESTAMP,
    completed_date TIMESTAMP,
    maintenance_type VARCHAR(100),
    description TEXT,
    technician_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    cost DECIMAL(10,2),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'))
);

-- Routes table (planned collection routes)
CREATE TABLE IF NOT EXISTS routes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    estimated_duration INTERVAL,
    status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed', 'cancelled'))
);

-- Junction table: Household-Bin assignments (many-to-many)
CREATE TABLE IF NOT EXISTS household_bin_assignments (
    id SERIAL PRIMARY KEY,
    household_id INTEGER REFERENCES households(id) ON DELETE CASCADE,
    bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    priority INTEGER DEFAULT 1,
    UNIQUE(household_id, bin_id)
);

-- Junction table: Route-Bins (sequence in route)
CREATE TABLE IF NOT EXISTS route_bins (
    id SERIAL PRIMARY KEY,
    route_id INTEGER REFERENCES routes(id) ON DELETE CASCADE,
    bin_id INTEGER REFERENCES bins(id) ON DELETE CASCADE,
    sequence_order INTEGER NOT NULL,
    estimated_arrival_time TIMESTAMP,
    UNIQUE(route_id, bin_id)
);

-- Time dimension for OLAP
CREATE TABLE IF NOT EXISTS time_dimension (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    year INTEGER NOT NULL,
    month INTEGER NOT NULL,
    day INTEGER NOT NULL,
    weekday VARCHAR(10) NOT NULL,
    week_of_year INTEGER NOT NULL,
    quarter INTEGER NOT NULL
);

-- Fact table: Waste Collection Facts for OLAP
CREATE TABLE IF NOT EXISTS waste_collection_facts (
    id SERIAL PRIMARY KEY,
    time_id INTEGER REFERENCES time_dimension(id),
    bin_id INTEGER REFERENCES bins(id),
    household_id INTEGER REFERENCES households(id),
    collection_id INTEGER REFERENCES collections(id),
    waste_type_id INTEGER REFERENCES waste_types(id),
    waste_amount FLOAT,
    collection_duration INTERVAL,
    distance_traveled FLOAT,
    fuel_consumed FLOAT
);

-- Fact table: Daily Waste Generation Facts
CREATE TABLE IF NOT EXISTS daily_waste_facts (
    id SERIAL PRIMARY KEY,
    time_id INTEGER REFERENCES time_dimension(id),
    household_id INTEGER REFERENCES households(id),
    ward VARCHAR(50),
    waste_generated FLOAT,
    waste_type_id INTEGER REFERENCES waste_types(id),
    weather_condition VARCHAR(50),
    temperature FLOAT
);

-- Spatial indexes
CREATE INDEX IF NOT EXISTS idx_households_location ON households USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_bins_location ON bins USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_suggested_location ON suggested_bins USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_sensors_bin_id ON sensors(bin_id);
CREATE INDEX IF NOT EXISTS idx_collections_bin_id ON collections(bin_id);
CREATE INDEX IF NOT EXISTS idx_collections_collected_at ON collections(collected_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_bin_id ON maintenance(bin_id);
CREATE INDEX IF NOT EXISTS idx_household_bin_assignments_household_id ON household_bin_assignments(household_id);
CREATE INDEX IF NOT EXISTS idx_household_bin_assignments_bin_id ON household_bin_assignments(bin_id);
CREATE INDEX IF NOT EXISTS idx_route_bins_route_id ON route_bins(route_id);
CREATE INDEX IF NOT EXISTS idx_waste_collection_facts_time_id ON waste_collection_facts(time_id);
CREATE INDEX IF NOT EXISTS idx_daily_waste_facts_time_id ON daily_waste_facts(time_id);

-- OLAP Views
-- View for bin utilization
CREATE OR REPLACE VIEW bin_utilization_view AS
SELECT
    b.id AS bin_id,
    b.capacity,
    b.fill_level,
    COUNT(c.id) AS total_collections,
    AVG(c.waste_amount_collected) AS avg_waste_collected,
    MAX(c.collected_at) AS last_collection,
    COUNT(DISTINCT hba.household_id) AS assigned_households
FROM bins b
LEFT JOIN collections c ON b.id = c.bin_id
LEFT JOIN household_bin_assignments hba ON b.id = hba.bin_id
GROUP BY b.id, b.capacity, b.fill_level;

-- View for ward-wise waste generation
CREATE OR REPLACE VIEW ward_waste_generation_view AS
SELECT
    h.ward,
    td.year,
    td.month,
    SUM(dwf.waste_generated) AS total_waste_generated,
    AVG(dwf.waste_generated) AS avg_daily_waste_per_household,
    COUNT(DISTINCT h.id) AS total_households
FROM households h
JOIN daily_waste_facts dwf ON h.id = dwf.household_id
JOIN time_dimension td ON dwf.time_id = td.id
GROUP BY h.ward, td.year, td.month;

-- View for collection efficiency
CREATE OR REPLACE VIEW collection_efficiency_view AS
SELECT
    v.license_plate,
    u.username AS collector,
    COUNT(c.id) AS collections_count,
    SUM(c.waste_amount_collected) AS total_waste_collected,
    AVG(EXTRACT(EPOCH FROM wcf.collection_duration)/60) AS avg_collection_time_minutes,
    SUM(wcf.distance_traveled) AS total_distance_traveled,
    SUM(wcf.fuel_consumed) AS total_fuel_consumed
FROM vehicles v
LEFT JOIN users u ON v.assigned_user_id = u.id
LEFT JOIN collections c ON v.id = c.vehicle_id
LEFT JOIN waste_collection_facts wcf ON c.id = wcf.collection_id
GROUP BY v.id, v.license_plate, u.username;
