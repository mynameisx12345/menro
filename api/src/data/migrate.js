const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '../../migrations');
const DB_PATH = path.join(__dirname, '../../menro.db');

function ensureTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);
}

function listMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) return [];
  return fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();
}

function appliedIds(db) {
  return new Set(db.prepare('SELECT id FROM schema_migrations').all().map(r => r.id));
}

function backupDb() {
  if (!fs.existsSync(DB_PATH)) return null;
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = `${DB_PATH}.bak-${stamp}`;
  fs.copyFileSync(DB_PATH, backupPath);
  return backupPath;
}

function runMigrations(db, { status = false } = {}) {
  ensureTable(db);
  const files = listMigrationFiles();
  const applied = appliedIds(db);
  const pending = files.filter(f => !applied.has(f));

  if (status) {
    console.log(`Applied: ${applied.size}`);
    console.log(`Pending: ${pending.length}`);
    if (pending.length) {
      console.log('Pending files:');
      pending.forEach(f => console.log(`  - ${f}`));
    }
    return { applied: applied.size, pending: pending.length };
  }

  if (!pending.length) {
    console.log('[migrate] Up to date — nothing to apply.');
    return { applied: 0, pending: 0 };
  }

  const backupPath = backupDb();
  if (backupPath) console.log(`[migrate] Backup: ${backupPath}`);

  const record = db.prepare('INSERT INTO schema_migrations (id, applied_at) VALUES (?, ?)');
  let count = 0;
  for (const file of pending) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const tx = db.transaction(() => {
      db.exec(sql);
      record.run(file, new Date().toISOString());
    });
    try {
      tx();
      console.log(`[migrate] Applied ${file}`);
      count++;
    } catch (err) {
      console.error(`[migrate] FAILED ${file}: ${err.message}`);
      throw err;
    }
  }
  console.log(`[migrate] Done — applied ${count}, skipped ${applied.size}.`);
  return { applied: count, pending: 0 };
}

module.exports = { runMigrations };

// CLI: `node src/data/migrate.js` or `node src/data/migrate.js --status`
if (require.main === module) {
  const Database = require('better-sqlite3');
  const db = new Database(DB_PATH);
  try {
    runMigrations(db, { status: process.argv.includes('--status') });
  } finally {
    db.close();
  }
}
