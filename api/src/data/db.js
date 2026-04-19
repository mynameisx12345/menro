const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const db = new Database(path.join(__dirname, '../../menro.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    truckId TEXT,
    address TEXT,
    disabled INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS trucks (
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

  CREATE TABLE IF NOT EXISTS schedules (
    id TEXT PRIMARY KEY,
    routeId TEXT,
    wasteType TEXT,
    truckId TEXT,
    date TEXT,
    timeSlot TEXT,
    areas TEXT,
    status TEXT DEFAULT 'pending'
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    residentId TEXT,
    residentName TEXT,
    type TEXT,
    routeId TEXT,
    timestamp TEXT,
    description TEXT,
    photoUrl TEXT,
    status TEXT DEFAULT 'open',
    address TEXT
  );

  CREATE TABLE IF NOT EXISTS segregation_issues (
    id TEXT PRIMARY KEY,
    collectorId TEXT,
    collectorName TEXT,
    address TEXT,
    wasteType TEXT,
    issue TEXT,
    photoUrl TEXT,
    timestamp TEXT,
    residentNotified INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS waste_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#999999'
  );
`);

// Seed only if empty
const seed = db.transaction(() => {
  if (!db.prepare('SELECT 1 FROM users LIMIT 1').get()) {
    const insert = db.prepare('INSERT INTO users (id,name,email,password,role) VALUES (?,?,?,?,?)');
    insert.run('1', 'Admin User',    'admin@menro.gov',     bcrypt.hashSync('admin123', 8),     'admin');
    insert.run('2', 'Juan Dela Cruz','resident@menro.gov',  bcrypt.hashSync('resident123', 8),  'resident');
    db.prepare('UPDATE users SET address=? WHERE id=?').run('Camia Street, Santa Lucia, Pasig Second District, Pasig, Eastern Manila District, Metro Manila, 1608, Philippines', '2');
    insert.run('3', 'Pedro Santos',  'collector@menro.gov', bcrypt.hashSync('collector123', 8), 'collector');
  }

  if (!db.prepare('SELECT 1 FROM trucks LIMIT 1').get()) {
    const insert = db.prepare('INSERT INTO trucks (id,plateNumber,collectorId,collectorName,wasteType,status,lat,lng,route,lastUpdated) VALUES (?,?,?,?,?,?,?,?,?,?)');
    const now = new Date().toISOString();
    insert.run('truck-1','ABC-1234','3','Pedro Santos','Biodegradable','active',14.5995,120.9842,'Route A',now);
    insert.run('truck-2','XYZ-5678',null,'Maria Reyes','Recyclable','active',14.6010,120.9860,'Route B',now);
    insert.run('truck-3','DEF-9012',null,'Jose Rizal','Residual','idle',14.5980,120.9820,'Route C',now);
  }

  if (!db.prepare('SELECT 1 FROM schedules LIMIT 1').get()) {
    const insert = db.prepare('INSERT INTO schedules (id,routeId,wasteType,truckId,date,timeSlot,areas,status) VALUES (?,?,?,?,?,?,?,?)');
    insert.run('s1','Route A','Biodegradable','truck-1','2026-03-27','06:00-10:00',JSON.stringify(['Barangay 1','Barangay 2']),'in-progress');
    insert.run('s2','Route B','Recyclable','truck-2','2026-03-27','08:00-12:00',JSON.stringify(['Barangay 3','Barangay 4']),'pending');
    insert.run('s3','Route C','Residual','truck-3','2026-03-28','06:00-10:00',JSON.stringify(['Barangay 5','Barangay 6']),'pending');
  }

  if (!db.prepare('SELECT 1 FROM complaints LIMIT 1').get()) {
    db.prepare('INSERT INTO complaints (id,residentId,residentName,type,routeId,timestamp,description,status,address) VALUES (?,?,?,?,?,?,?,?,?)')
      .run('c1','2','Juan Dela Cruz','missed-collection','Route A',new Date('2026-03-27T08:00:00').toISOString(),'Truck bypassed our street','open','123 Main St, Barangay 1');
  }

  if (!db.prepare('SELECT 1 FROM segregation_issues LIMIT 1').get()) {
    db.prepare('INSERT INTO segregation_issues (id,collectorId,collectorName,address,wasteType,issue,timestamp,residentNotified) VALUES (?,?,?,?,?,?,?,?)')
      .run('si1','3','Pedro Santos','456 Oak Ave, Barangay 2','Biodegradable','Non-biodegradable items found in bin',new Date('2026-03-27T07:30:00').toISOString(),1);
  }

  if (!db.prepare('SELECT 1 FROM waste_types LIMIT 1').get()) {
    const wt = db.prepare('INSERT INTO waste_types (id,name,description,color) VALUES (?,?,?,?)');
    wt.run('wt-1','Biodegradable','Food scraps, yard waste, and other organic materials','#2d6a4f');
    wt.run('wt-2','Recyclable','Paper, plastic, glass, and metal materials','#1565c0');
    wt.run('wt-3','Residual','Non-recyclable, non-biodegradable waste','#856404');
    wt.run('wt-4','Special Waste','Hazardous, electronic, and bulky waste','#721c24');
  }
});

seed();

// Add disabled column if it doesn't exist (migration)
try { db.exec('ALTER TABLE users ADD COLUMN disabled INTEGER DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN deleted INTEGER DEFAULT 0'); } catch {}
try { db.exec('ALTER TABLE segregation_issues ADD COLUMN status TEXT DEFAULT "open"'); } catch {}
try { db.exec('ALTER TABLE complaints ADD COLUMN photoUrls TEXT DEFAULT "[]"'); } catch {}
try { db.exec('ALTER TABLE segregation_issues ADD COLUMN photoUrls TEXT DEFAULT "[]"'); } catch {}
try { db.exec('ALTER TABLE schedules ADD COLUMN completedAt TEXT'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN lat REAL'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN lng REAL'); } catch {}
try { db.exec('ALTER TABLE users ADD COLUMN status TEXT DEFAULT "approved"'); } catch {}
// Set all existing users to approved
db.prepare("UPDATE users SET status='approved' WHERE status IS NULL").run();

// Settings table
db.exec(`
  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);
try { db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('noSignalThresholdMinutes','15')").run(); } catch {}
try { db.prepare("INSERT OR IGNORE INTO settings (key,value) VALUES ('nearbyNotifCooldownMinutes','10')").run(); } catch {}

db.exec(`
  CREATE TABLE IF NOT EXISTS truck_location_logs (
    id TEXT PRIMARY KEY,
    truckId TEXT NOT NULL,
    collectorId TEXT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    timestamp TEXT NOT NULL,
    scheduleId TEXT
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    subscription TEXT NOT NULL,
    UNIQUE(userId)
  );
`);

// Seed default address for demo resident if missing
const demoResident = db.prepare("SELECT address FROM users WHERE email='resident@menro.gov'").get();
if (demoResident && !demoResident.address) {
  db.prepare("UPDATE users SET address='Camia Street, Santa Lucia, Pasig Second District, Pasig, Eastern Manila District, Metro Manila, 1608, Philippines' WHERE email='resident@menro.gov'").run();
}

// Geocode residents that have address but no lat/lng
(async () => {
  const residents = db.prepare("SELECT id, address FROM users WHERE role='resident' AND address IS NOT NULL AND (lat IS NULL OR lng IS NULL)").all();
  for (const r of residents) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(r.address)}&format=json&limit=1`, { headers: { 'User-Agent': 'MENRO-EcoTrack/1.0' }, signal: AbortSignal.timeout(5000) });
      const data = await res.json();
      if (data.length) db.prepare('UPDATE users SET lat=?, lng=? WHERE id=?').run(parseFloat(data[0].lat), parseFloat(data[0].lon), r.id);
    } catch { /* skip */ }
  }
})();

// Helpers to parse stored JSON arrays and booleans back to JS types
const parseTruck = r => r ? { ...r, lastUpdated: new Date(r.lastUpdated) } : null;
const parseSchedule = r => r ? { ...r, areas: JSON.parse(r.areas || '[]') } : null;
const parseComplaint = r => r ? { ...r, timestamp: new Date(r.timestamp), photoUrls: JSON.parse(r.photoUrls || '[]') } : null;
const parseSegregation = r => r ? { ...r, timestamp: new Date(r.timestamp), residentNotified: !!r.residentNotified, status: r.status || 'open', photoUrls: JSON.parse(r.photoUrls || (r.photoUrl ? JSON.stringify([r.photoUrl]) : '[]')) } : null;

module.exports = { db, uuidv4, parseTruck, parseSchedule, parseComplaint, parseSegregation };
