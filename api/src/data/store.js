// In-memory store (replace with DB in production)
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const users = [
  { id: '1', name: 'Admin User', email: 'admin@menro.gov', password: bcrypt.hashSync('admin123', 8), role: 'admin' },
  { id: '2', name: 'Juan Dela Cruz', email: 'resident@menro.gov', password: bcrypt.hashSync('resident123', 8), role: 'resident' },
  { id: '3', name: 'Pedro Santos', email: 'collector@menro.gov', password: bcrypt.hashSync('collector123', 8), role: 'collector', truckId: 'truck-1' },
];

const trucks = [
  { id: 'truck-1', plateNumber: 'ABC-1234', collectorId: '3', collectorName: 'Pedro Santos', wasteType: 'Biodegradable', status: 'active', lat: 14.5995, lng: 120.9842, route: 'Route A', lastUpdated: new Date() },
  { id: 'truck-2', plateNumber: 'XYZ-5678', collectorId: null, collectorName: 'Maria Reyes', wasteType: 'Recyclable', status: 'active', lat: 14.6010, lng: 120.9860, route: 'Route B', lastUpdated: new Date() },
  { id: 'truck-3', plateNumber: 'DEF-9012', collectorId: null, collectorName: 'Jose Rizal', wasteType: 'Residual', status: 'idle', lat: 14.5980, lng: 120.9820, route: 'Route C', lastUpdated: new Date() },
];

const schedules = [
  { id: 's1', routeId: 'Route A', wasteType: 'Biodegradable', truckId: 'truck-1', date: '2026-03-27', timeSlot: '06:00-10:00', areas: ['Barangay 1', 'Barangay 2'], status: 'in-progress' },
  { id: 's2', routeId: 'Route B', wasteType: 'Recyclable', truckId: 'truck-2', date: '2026-03-27', timeSlot: '08:00-12:00', areas: ['Barangay 3', 'Barangay 4'], status: 'pending' },
  { id: 's3', routeId: 'Route C', wasteType: 'Residual', truckId: 'truck-3', date: '2026-03-28', timeSlot: '06:00-10:00', areas: ['Barangay 5', 'Barangay 6'], status: 'pending' },
];

const complaints = [
  { id: 'c1', residentId: '2', residentName: 'Juan Dela Cruz', type: 'missed-collection', routeId: 'Route A', timestamp: new Date('2026-03-27T08:00:00'), description: 'Truck bypassed our street', photoUrl: null, status: 'open', address: '123 Main St, Barangay 1' },
];

const segregationIssues = [
  { id: 'si1', collectorId: '3', collectorName: 'Pedro Santos', address: '456 Oak Ave, Barangay 2', wasteType: 'Biodegradable', issue: 'Non-biodegradable items found in bin', photoUrl: null, timestamp: new Date('2026-03-27T07:30:00'), residentNotified: true },
];

module.exports = { users, trucks, schedules, complaints, segregationIssues, uuidv4 };
