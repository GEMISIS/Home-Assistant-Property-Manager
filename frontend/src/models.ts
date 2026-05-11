/**
 * TypeScript types for Property Manager frontend.
 */

export interface Geometry {
  type: "Point" | "LineString" | "Polygon";
  coordinates: number[] | number[][] | number[][][];
}

export interface Calibration {
  point_a: [number, number];
  point_b: [number, number];
  distance_meters: number;
}

export interface Schedule {
  id: string;
  action: string;
  frequency: string;
  season?: { start_month: number; end_month: number } | null;
  next_due: string;
}

export interface MaintenanceLogEntry {
  date: string;
  action: string;
  notes: string;
}

export interface Photo {
  path: string;
  taken: string;
  caption: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  geometry: Geometry;
  status: "active" | "inactive" | "needs_attention" | "overdue";
  metadata: Record<string, unknown>;
  linked_entities: string[];
  photos: Photo[];
  schedules: Schedule[];
  maintenance_log: MaintenanceLogEntry[];
  created: string;
  updated: string;
}

export interface Zone {
  id: string;
  name: string;
  category: string;
  geometry: Geometry;
  color: string;
  metadata: Record<string, unknown>;
}

export interface Property {
  name: string;
  boundary: [number, number][];
  calibration: Calibration;
  address: string;
  timezone: string;
  latitude: number | null;
  longitude: number | null;
}

export interface PropertyStore {
  version: number;
  property: Property;
  assets: Asset[];
  zones: Zone[];
}

export interface CategoryDef {
  name: string;
  icon: string;
  color: string;
}

export type CategoryMap = Record<string, CategoryDef>;
