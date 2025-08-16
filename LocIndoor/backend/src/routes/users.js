import express from 'express';
import { body, validationResult } from 'express-validator';
import { db } from '../db/db.js';
import { users, userLocations, navigationSessions, refreshTokens } from '../db/schema.js';
import { eq, desc, and, gte } from 'drizzle-orm';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { 
  hashPassword, 
  comparePassword, 
  generateAccessToken, 
  generateRefreshToken,
  verifyRefreshToken 
} from '../utils/auth.js';

const router = express.Router();

// Validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('name').trim().isLength({ min: 2, max: 50 }),
];

const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

// User registration
router.post('/register', validateRegistration, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password, name, avatar } = req.body;

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      name,
      avatar
    }).returning();

    // Generate tokens
    const accessToken = generateAccessToken(newUser[0].id);
    const refreshToken = generateRefreshToken(newUser[0].id);

    // Store refresh token
    await db.insert(refreshTokens).values({
      userId: newUser[0].id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser[0];

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// User login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { email, password } = req.body;
    console.log('🔐 Login attempt for email:', email);

    // Find user
    const user = await db.select().from(users).where(eq(users.email, email));
    console.log('👤 Users found:', user.length);
    
    if (user.length === 0) {
      console.log('❌ No user found with email:', email);
      return res.status(401).json({ 
        success: false, 
        error: '❌ No user found with email' 
      });
    }

    console.log('👤 User found:', { id: user[0].id, email: user[0].email, isActive: user[0].isActive });

    // Check password
    const isValidPassword = await comparePassword(password, user[0].password);
    console.log('🔑 Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for user:', email);
      return res.status(401).json({ 
        success: false, 
        error: '❌ Invalid password for user' 
      });
    }

    // Check if user is active
    if (!user[0].isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'Account is deactivated' 
      });
    }

    // Generate tokens
    console.log('🎫 Generating tokens for user ID:', user[0].id);
    const accessToken = generateAccessToken(user[0].id);
    const refreshToken = generateRefreshToken(user[0].id);
    console.log('✅ Tokens generated successfully');

    // Store refresh token
    console.log('💾 Storing refresh token...');
    await db.insert(refreshTokens).values({
      userId: user[0].id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    console.log('✅ Refresh token stored successfully');

    // Note: lastLogin field doesn't exist in schema, skipping update
    console.log('✅ Login process completed successfully');

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user[0];

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        success: false, 
        error: 'Refresh token required' 
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);
    
    // Check if token exists and is not revoked
    const tokenRecord = await db.select()
      .from(refreshTokens)
      .where(
        and(
          eq(refreshTokens.token, refreshToken),
          eq(refreshTokens.isRevoked, false),
          eq(refreshTokens.userId, decoded.userId)
        )
      );

    if (tokenRecord.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid refresh token' 
      });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ 
      success: false, 
      error: 'Invalid refresh token' 
    });
  }
});

// Logout
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke refresh token
      await db.update(refreshTokens)
        .set({ isRevoked: true })
        .where(eq(refreshTokens.token, refreshToken));
    }

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Logout failed' 
    });
  }
});

// Get current user profile (authenticated)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    res.json({ 
      success: true, 
      data: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Update user profile (authenticated)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updateData = { updatedAt: new Date() };

    if (name) updateData.name = name;
    if (avatar) updateData.avatar = avatar;

    const updatedUser = await db.update(users)
      .set(updateData)
      .where(eq(users.id, req.user.id))
      .returning();

    const { password: _, ...userWithoutPassword } = updatedUser[0];

    res.json({ 
      success: true, 
      data: userWithoutPassword 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Change password (authenticated)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Current and new password are required' 
      });
    }

    // Verify current password
    const isValidPassword = await comparePassword(currentPassword, req.user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        error: 'Current password is incorrect' 
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await db.update(users)
      .set({ 
        password: hashedPassword, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, req.user.id));

    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get all users (admin only - add role checking later)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      email: users.email,
      name: users.name,
      avatar: users.avatar,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      lastLogin: users.lastLogin,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users);
    
    res.json({ success: true, data: allUsers });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
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