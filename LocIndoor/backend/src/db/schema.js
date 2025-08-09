import { pgTable, serial, text, timestamp, integer, boolean, json, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Beacons table
export const beacons = pgTable('beacons', {
  id: serial('id').primaryKey(),
  uuid: text('uuid').notNull().unique(),
  major: integer('major').notNull(),
  minor: integer('minor').notNull(),
  name: text('name').notNull(),
  location: json('location').notNull(), // {x, y, z, floor}
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Locations table (rooms/areas)
export const locations = pgTable('locations', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  floor: integer('floor').notNull(),
  coordinates: json('coordinates').notNull(), // {x, y, width, height}
  type: text('type').notNull(), // 'room', 'corridor', 'entrance', etc.
  createdAt: timestamp('created_at').defaultNow(),
});

// User location history
export const userLocations = pgTable('user_locations', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  locationId: integer('location_id').references(() => locations.id),
  beaconId: integer('beacon_id').references(() => beacons.id),
  signalStrength: integer('signal_strength'),
  accuracy: integer('accuracy'),
  timestamp: timestamp('timestamp').defaultNow(),
  coordinates: json('coordinates'), // {x, y, z}
});

// Navigation sessions
export const navigationSessions = pgTable('navigation_sessions', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  startLocation: integer('start_location').references(() => locations.id),
  endLocation: integer('end_location').references(() => locations.id),
  startTime: timestamp('start_time').defaultNow(),
  endTime: timestamp('end_time'),
  status: text('status').notNull(), // 'active', 'completed', 'cancelled'
  route: json('route'), // Array of location IDs
  createdAt: timestamp('created_at').defaultNow(),
});

// Beacon readings for analytics
export const beaconReadings = pgTable('beacon_readings', {
  id: serial('id').primaryKey(),
  beaconId: integer('beacon_id').references(() => beacons.id),
  userId: uuid('user_id').references(() => users.id),
  rssi: integer('rssi').notNull(),
  distance: integer('distance'),
  timestamp: timestamp('timestamp').defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  locations: many(userLocations),
  sessions: many(navigationSessions),
  readings: many(beaconReadings),
}));

export const beaconsRelations = relations(beacons, ({ many }) => ({
  locations: many(userLocations),
  readings: many(beaconReadings),
}));

export const locationsRelations = relations(locations, ({ many }) => ({
  userLocations: many(userLocations),
  startSessions: many(navigationSessions, { relationName: 'startLocation' }),
  endSessions: many(navigationSessions, { relationName: 'endLocation' }),
}));