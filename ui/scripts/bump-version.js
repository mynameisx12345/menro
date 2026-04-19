const fs = require('fs');
const path = require('path');

const versionFile = path.join(__dirname, '../src/version.ts');
const content = fs.readFileSync(versionFile, 'utf8');

const match = content.match(/export const BUILD = (\d+);/);
if (!match) { console.error('Could not find BUILD in version.ts'); process.exit(1); }

const newBuild = parseInt(match[1]) + 1;
const updated = content.replace(/export const BUILD = \d+;/, `export const BUILD = ${newBuild};`);
fs.writeFileSync(versionFile, updated);
console.log(`Build bumped to ${newBuild}`);
