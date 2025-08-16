import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { db } from '../db/db.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Verify JWT token
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    
    // Get user from database
    const user = await db.select().from(users).where(eq(users.id, decoded.userId));
    
    if (user.length === 0 || !user[0].isActive) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found or inactive' 
      });
    }

    req.user = user[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        error: 'Token expired' 
      });
    }
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid token' 
    });
  }
};


export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET);
    const user = await db.select().from(users).where(eq(users.id, decoded.userId));
    
    if (user.length > 0 && user[0].isActive) {
      req.user = user[0];
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

