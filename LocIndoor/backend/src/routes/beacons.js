import express from 'express';
import { db } from '../db/db.js';
import { beacons, beaconReadings } from '../db/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = express.Router();

// Get all beacons
router.get('/', async (req, res) => {
  try {
    const { floor, isActive } = req.query;
    
    let query = db.select().from(beacons);
    
    if (floor) {
      // Filter by floor using JSON field
      query = query.where(eq(beacons.location.floor, parseInt(floor)));
    }
    
    if (isActive !== undefined) {
      query = query.where(eq(beacons.isActive, isActive === 'true'));
    }
    
    const allBeacons = await query.orderBy(beacons.name);
    res.json({ success: true, data: allBeacons });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get beacon by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const beacon = await db.select().from(beacons).where(eq(beacons.id, parseInt(id)));
    
    if (beacon.length === 0) {
      return res.status(404).json({ success: false, error: 'Beacon not found' });
    }
    
    res.json({ success: true, data: beacon[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new beacon
router.post('/', async (req, res) => {
  try {
    const { uuid, major, minor, name, location, isActive } = req.body;
    
    if (!uuid || !major || !minor || !name || !location) {
      return res.status(400).json({ 
        success: false, 
        error: 'UUID, major, minor, name, and location are required' 
      });
    }
    
    const newBeacon = await db.insert(beacons).values({
      uuid,
      major: parseInt(major),
      minor: parseInt(minor),
      name,
      location,
      isActive: isActive !== undefined ? isActive : true
    }).returning();
    
    res.status(201).json({ success: true, data: newBeacon[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update beacon
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { uuid, major, minor, name, location, isActive } = req.body;
    
    const updateData = {};
    if (uuid) updateData.uuid = uuid;
    if (major) updateData.major = parseInt(major);
    if (minor) updateData.minor = parseInt(minor);
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const updatedBeacon = await db
      .update(beacons)
      .set(updateData)
      .where(eq(beacons.id, parseInt(id)))
      .returning();
    
    if (updatedBeacon.length === 0) {
      return res.status(404).json({ success: false, error: 'Beacon not found' });
    }
    
    res.json({ success: true, data: updatedBeacon[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get beacon readings
router.get('/:id/readings', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 100, hours = 24 } = req.query;
    
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - parseInt(hours));
    
    const readings = await db
      .select()
      .from(beaconReadings)
      .where(
        and(
          eq(beaconReadings.beaconId, parseInt(id)),
          gte(beaconReadings.timestamp, cutoffTime)
        )
      )
      .orderBy(desc(beaconReadings.timestamp))
      .limit(parseInt(limit));
    
    res.json({ success: true, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record beacon reading
router.post('/:id/readings', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rssi, distance } = req.body;
    
    if (!userId || !rssi) {
      return res.status(400).json({ 
        success: false, 
        error: 'User ID and RSSI are required' 
      });
    }
    
    const newReading = await db.insert(beaconReadings).values({
      beaconId: parseInt(id),
      userId,
      rssi: parseInt(rssi),
      distance: distance ? parseInt(distance) : null
    }).returning();
    
    res.status(201).json({ success: true, data: newReading[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;