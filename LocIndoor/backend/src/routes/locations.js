import express from 'express';
import { db } from '../db/db.js';
import { locations, beacons, userLocations } from '../db/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const { floor, type } = req.query;
    
    let query = db.select().from(locations);
    
    if (floor) {
      query = query.where(eq(locations.floor, parseInt(floor)));
    }
    
    if (type) {
      query = query.where(eq(locations.type, type));
    }
    
    const allLocations = await query.orderBy(locations.name);
    res.json({ success: true, data: allLocations });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const location = await db.select().from(locations).where(eq(locations.id, parseInt(id)));
    
    if (location.length === 0) {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }
    
    res.json({ success: true, data: location[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new location
router.post('/', async (req, res) => {
  try {
    const { name, description, floor, coordinates, type } = req.body;
    
    if (!name || !floor || !coordinates || !type) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name, floor, coordinates, and type are required' 
      });
    }
    
    const newLocation = await db.insert(locations).values({
      name,
      description,
      floor: parseInt(floor),
      coordinates,
      type
    }).returning();
    
    res.status(201).json({ success: true, data: newLocation[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get location occupancy (current users in location)
router.get('/:id/occupancy', async (req, res) => {
  try {
    const { id } = req.params;
    const { minutes = 5 } = req.query;
    
    const cutoffTime = new Date();
    cutoffTime.setMinutes(cutoffTime.getMinutes() - parseInt(minutes));
    
    const occupancy = await db
      .select({
        userId: userLocations.userId,
        timestamp: userLocations.timestamp,
        coordinates: userLocations.coordinates
      })
      .from(userLocations)
      .where(
        and(
          eq(userLocations.locationId, parseInt(id)),
          gte(userLocations.timestamp, cutoffTime)
        )
      )
      .orderBy(desc(userLocations.timestamp));
    
    res.json({ success: true, data: occupancy });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get beacons in location
router.get('/:id/beacons', async (req, res) => {
  try {
    const { id } = req.params;
    
    const location = await db.select().from(locations).where(eq(locations.id, parseInt(id)));
    if (location.length === 0) {
      return res.status(404).json({ success: false, error: 'Location not found' });
    }
    
    const locationCoords = location[0].coordinates;
    
    // Find beacons within the location coordinates
    const beaconsInLocation = await db
      .select()
      .from(beacons)
      .where(eq(beacons.isActive, true));
    
    // Filter beacons that are within the location bounds
    const filteredBeacons = beaconsInLocation.filter(beacon => {
      const beaconLocation = beacon.location;
      return (
        beaconLocation.x >= locationCoords.x &&
        beaconLocation.x <= locationCoords.x + locationCoords.width &&
        beaconLocation.y >= locationCoords.y &&
        beaconLocation.y <= locationCoords.y + locationCoords.height &&
        beaconLocation.floor === locationCoords.floor
      );
    });
    
    res.json({ success: true, data: filteredBeacons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get navigation path between locations
router.get('/:startId/to/:endId', async (req, res) => {
  try {
    const { startId, endId } = req.params;
    
    // This is a simplified pathfinding - in a real implementation,
    // you'd want to implement proper pathfinding algorithm
    const startLocation = await db.select().from(locations).where(eq(locations.id, parseInt(startId)));
    const endLocation = await db.select().from(locations).where(eq(locations.id, parseInt(endId)));
    
    if (startLocation.length === 0 || endLocation.length === 0) {
      return res.status(404).json({ success: false, error: 'Start or end location not found' });
    }
    
    // For now, return a simple path with start and end
    // In a real implementation, you'd calculate the actual path
    const path = {
      start: startLocation[0],
      end: endLocation[0],
      waypoints: [], // Would contain intermediate locations
      distance: 0, // Would calculate actual distance
      estimatedTime: 0 // Would calculate estimated time
    };
    
    res.json({ success: true, data: path });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; 