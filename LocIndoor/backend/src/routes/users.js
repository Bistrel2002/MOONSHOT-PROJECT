import express from 'express';
import { db } from '../db/db.js';
import { users, userLocations, navigationSessions } from '../db/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';

const router = express.Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json({ success: true, data: allUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await db.select().from(users).where(eq(users.id, id));
    
    if (user.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    res.json({ success: true, data: user[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create new user
router.post('/', async (req, res) => {
  try {
    const { email, name, avatar } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({ success: false, error: 'Email and name are required' });
    }
    
    const newUser = await db.insert(users).values({
      email,
      name,
      avatar
    }).returning();
    
    res.status(201).json({ success: true, data: newUser[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user location history
router.get('/:id/locations', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, days = 7 } = req.query;
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const history = await db
      .select({
        id: userLocations.id,
        locationId: userLocations.locationId,
        beaconId: userLocations.beaconId,
        signalStrength: userLocations.signalStrength,
        accuracy: userLocations.accuracy,
        timestamp: userLocations.timestamp,
        coordinates: userLocations.coordinates
      })
      .from(userLocations)
      .where(
        and(
          eq(userLocations.userId, id),
          gte(userLocations.timestamp, cutoffDate)
        )
      )
      .orderBy(desc(userLocations.timestamp))
      .limit(parseInt(limit));
    
    res.json({ success: true, data: history });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get user navigation sessions
router.get('/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.query;
    
    let query = db.select().from(navigationSessions).where(eq(navigationSessions.userId, id));
    
    if (status) {
      query = query.where(eq(navigationSessions.status, status));
    }
    
    const sessions = await query.orderBy(desc(navigationSessions.createdAt));
    
    res.json({ success: true, data: sessions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update user location
router.post('/:id/location', async (req, res) => {
  try {
    const { id } = req.params;
    const { locationId, beaconId, signalStrength, accuracy, coordinates } = req.body;
    
    const newLocation = await db.insert(userLocations).values({
      userId: id,
      locationId,
      beaconId,
      signalStrength,
      accuracy,
      coordinates
    }).returning();
    
    res.status(201).json({ success: true, data: newLocation[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router; 