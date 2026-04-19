-- MENRO EcoTrack — Clean Database Schema
-- Run: sqlite3 menro.db < schema.sql

CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    truckId TEXT,
    address TEXT,
    disabled INTEGER DEFAULT 0,
    deleted INTEGER DEFAULT 0,
    lat REAL,
    lng REAL,
    status TEXT DEFAULT 'approved'
);

CREATE TABLE trucks (
    id TEXT PRIMARY KEY,
    plateNumber TEXT NOT NULL,
    collectorId TEXT,
    collectorName TEXT,
    wasteType TEXT,
    status TEXT DEFAULT 'idle',
    lat REAL,
    lng REAL,
    route TEXT,
    lastUpdated TEXT
);

CREATE TABLE schedules (
    id TEXT PRIMARY KEY,
    routeId TEXT,
    wasteType TEXT,
    truckId TEXT,
    date TEXT,
    timeSlot TEXT,
    areas TEXT,
    status TEXT DEFAULT 'pending',
    completedAt TEXT
);

CREATE TABLE complaints (
    id TEXT PRIMARY KEY,
    residentId TEXT,
    residentName TEXT,
    type TEXT,
    routeId TEXT,
    timestamp TEXT,
    description TEXT,
    photoUrl TEXT,
    status TEXT DEFAULT 'open',
    address TEXT,
    photoUrls TEXT DEFAULT '[]'
);

CREATE TABLE segregation_issues (
    id TEXT PRIMARY KEY,
    collectorId TEXT,
    collectorName TEXT,
    address TEXT,
    wasteType TEXT,
    issue TEXT,
    photoUrl TEXT,
    timestamp TEXT,
    residentNotified INTEGER DEFAULT 1,
    status TEXT DEFAULT 'open',
    photoUrls TEXT DEFAULT '[]'
);

CREATE TABLE waste_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#999999'
);

CREATE TABLE truck_location_logs (
    id TEXT PRIMARY KEY,
    truckId TEXT NOT NULL,
    collectorId TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    timestamp TEXT NOT NULL,
    scheduleId TEXT
);

CREATE TABLE push_subscriptions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    subscription TEXT NOT NULL,
    UNIQUE(userId)
);

CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

-- ─── Seed Data ────────────────────────────────────────────────────────────────

-- Demo accounts (passwords: admin123 / resident123 / collector123)
INSERT INTO users (id, name, email, password, role, status) VALUES
    ('1', 'Admin User',    'admin@menro.gov',     '$2b$08$gvN9X5FXpBxfMq.yo1whUesSMQc8jZrvO/ZjfzUkWfF96oEjM/Fg2', 'admin',     'approved'),
    ('2', 'Juan Dela Cruz','resident@menro.gov',  '$2b$08$7oA5D02fr6NaPrHdW.fmG.RroP9xjIFwBMQVG14IsVUj433n.uFKO', 'resident',  'approved'),
    ('3', 'Pedro Santos',  'collector@menro.gov', '$2b$08$R8IVJYRl6VQyV/YsmPnxDO3VCYNnKa4vW073Saz9P9frgBv8UcIZq', 'collector', 'approved');

-- Default waste types
INSERT INTO waste_types (id, name, description, color) VALUES
    ('wt-1', 'Biodegradable', 'Food scraps, yard waste, and other organic materials', '#2d6a4f'),
    ('wt-2', 'Recyclable',    'Paper, plastic, glass, and metal materials',           '#1565c0'),
    ('wt-3', 'Residual',      'Non-recyclable, non-biodegradable waste',              '#856404'),
    ('wt-4', 'Special Waste', 'Hazardous, electronic, and bulky waste',               '#721c24');

-- Default settings
INSERT INTO settings (key, value) VALUES
    ('noSignalThresholdMinutes',   '15'),
    ('nearbyNotifCooldownMinutes', '10');
