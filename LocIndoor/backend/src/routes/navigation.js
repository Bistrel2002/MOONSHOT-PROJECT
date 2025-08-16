import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../db/db.js';
import { navigationSessions, locations } from '../db/schema.js';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Start a new navigation session
router.post('/start', authenticateToken, [
  body('destinationName').notEmpty().withMessage('Destination name is required'),
  body('startLocationName').optional(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { destinationName, startLocationName } = req.body;
    const userId = req.user.id;

    // Find or create destination location
    let destination = await db.select().from(locations).where(eq(locations.name, destinationName));
    if (destination.length === 0) {
      // Create a new location if it doesn't exist
      destination = await db.insert(locations).values({
        name: destinationName,
        description: `User destination: ${destinationName}`,
        floor: 1, // Default floor
        coordinates: { x: 0, y: 0, width: 10, height: 10 }, // Default coordinates
        type: 'destination'
      }).returning();
    }

    // Find start location if provided
    let startLocation = null;
    if (startLocationName) {
      const start = await db.select().from(locations).where(eq(locations.name, startLocationName));
      if (start.length > 0) {
        startLocation = start[0];
      }
    }

    // Create navigation session
    const session = await db.insert(navigationSessions).values({
      userId,
      startLocation: startLocation?.id || null,
      endLocation: destination[0].id,
      status: 'active',
      route: null, // Will be updated as user navigates
    }).returning();

    res.status(201).json({
      success: true,
      data: {
        session: session[0],
        destination: destination[0],
        startLocation: startLocation
      }
    });
  } catch (error) {
    console.error('Start navigation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start navigation session'
    });
  }
});

// Complete a navigation session
router.put('/:sessionId/complete', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Update session to completed
    const updatedSession = await db.update(navigationSessions)
      .set({
        status: 'completed',
        endTime: new Date()
      })
      .where(and(
        eq(navigationSessions.id, sessionId),
        eq(navigationSessions.userId, userId)
      ))
      .returning();

    if (updatedSession.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Navigation session not found'
      });
    }

    res.json({
      success: true,
      data: { session: updatedSession[0] }
    });
  } catch (error) {
    console.error('Complete navigation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete navigation session'
    });
  }
});

// Cancel a navigation session
router.put('/:sessionId/cancel', authenticateToken, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    // Update session to cancelled
    const updatedSession = await db.update(navigationSessions)
      .set({
        status: 'cancelled',
        endTime: new Date()
      })
      .where(and(
        eq(navigationSessions.id, sessionId),
        eq(navigationSessions.userId, userId)
      ))
      .returning();

    if (updatedSession.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Navigation session not found'
      });
    }

    res.json({
      success: true,
      data: { session: updatedSession[0] }
    });
  } catch (error) {
    console.error('Cancel navigation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel navigation session'
    });
  }
});

// Get user's navigation history
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    // Get navigation sessions with location details
    const sessions = await db
      .select({
        session: navigationSessions,
        startLocation: {
          id: sql`start_loc.id`,
          name: sql`start_loc.name`,
          type: sql`start_loc.type`
        },
        endLocation: {
          id: sql`end_loc.id`,
          name: sql`end_loc.name`,
          type: sql`end_loc.type`
        }
      })
      .from(navigationSessions)
      .leftJoin(sql`locations as start_loc`, sql`start_loc.id = ${navigationSessions.startLocation}`)
      .leftJoin(sql`locations as end_loc`, sql`end_loc.id = ${navigationSessions.endLocation}`)
      .where(eq(navigationSessions.userId, userId))
      .orderBy(desc(navigationSessions.startTime))
      .limit(parseInt(limit))
      .offset(parseInt(offset));

    // Format the response
    const formattedSessions = sessions.map(row => ({
      id: row.session.id,
      destination: row.endLocation.name,
      startLocation: row.startLocation?.name || 'Unknown',
      startTime: row.session.startTime,
      endTime: row.session.endTime,
      status: row.session.status,
      duration: row.session.endTime 
        ? Math.round((new Date(row.session.endTime) - new Date(row.session.startTime)) / 1000 / 60) // minutes
        : null,
      date: row.session.startTime.toISOString().split('T')[0], // YYYY-MM-DD
      time: row.session.startTime.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })
    }));

    res.json({
      success: true,
      data: {
        sessions: formattedSessions,
        total: formattedSessions.length,
        hasMore: formattedSessions.length === parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get navigation history error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get navigation history'
    });
  }
});

// Get current active navigation session
router.get('/current', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const activeSessions = await db
      .select({
        session: navigationSessions,
        endLocation: {
          id: sql`end_loc.id`,
          name: sql`end_loc.name`,
          type: sql`end_loc.type`
        }
      })
      .from(navigationSessions)
      .leftJoin(sql`locations as end_loc`, sql`end_loc.id = ${navigationSessions.endLocation}`)
      .where(and(
        eq(navigationSessions.userId, userId),
        eq(navigationSessions.status, 'active')
      ))
      .orderBy(desc(navigationSessions.startTime))
      .limit(1);

    if (activeSessions.length === 0) {
      return res.json({
        success: true,
        data: { activeSession: null }
      });
    }

    const session = activeSessions[0];
    res.json({
      success: true,
      data: {
        activeSession: {
          id: session.session.id,
          destination: session.endLocation.name,
          startTime: session.session.startTime,
          status: session.session.status
        }
      }
    });
  } catch (error) {
    console.error('Get current navigation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get current navigation session'
    });
  }
});

export default router;
