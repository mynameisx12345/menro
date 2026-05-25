export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'resident' | 'collector';
  truckId?: string;
  address?: string;
  status?: 'pending' | 'approved';
}

export interface Truck {
  id: string;
  plateNumber: string;
  collectorName: string;
  wasteType: string;
  status: 'active' | 'idle' | 'offline';
  lat: number;
  lng: number;
  route: string;
  lastUpdated: Date;
}

export interface Schedule {
  id: string;
  routeId: string;
  wasteType: string;
  truckId: string;
  date: string;
  timeSlot: string;
  areas: string[];
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  completedAt?: string;
}

export interface Complaint {
  id: string;
  residentId: string;
  residentName: string;
  type: 'missed-collection' | 'delay' | 'other';
  routeId: string;
  timestamp: Date;
  description: string;
  photoUrl?: string;
  photoUrls?: string[];
  status: 'open' | 'reviewing' | 'resolved';
  address: string;
}

export interface SegregationIssue {
  id: string;
  collectorId: string;
  collectorName: string;
  address: string;
  wasteType: string;
  issue: string;
  photoUrl?: string;
  photoUrls?: string[];
  timestamp: Date;
  residentNotified: boolean;
  status: 'open' | 'reviewing' | 'resolved';
}

export interface WasteType {
  id: string;
  name: string;
  description: string;
  color: string;
}
