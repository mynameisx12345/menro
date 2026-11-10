// Read-only: lists tables in menro.db with row counts. Usage: npm run db:info
const path = require('path');
const Database = require('better-sqlite3');

const file = path.join(__dirname, '../menro.db');
const db = new Database(file, { readonly: true, fileMustExist: true });
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all();

console.log(`DB: ${file}`);
if (!tables.length) console.log('No tables - database is empty.');
for (const { name } of tables) {
  const { n } = db.prepare(`SELECT COUNT(*) AS n FROM "${name}"`).get();
  console.log(`${name}: ${n} rows`);
}
db.close();
