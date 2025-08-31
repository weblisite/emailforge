import { Request, Response, NextFunction } from 'express';
import { userSyncService } from '../services/user-sync';

// Extend Express Request to include Clerk user
declare global {
  namespace Express {
    interface Request {
      clerkUserId?: string;
      localUser?: any;
    }
  }
}

/**
 * Temporary simplified authentication middleware
 * For development purposes - validates JWT format and extracts user ID
 */
export const requireClerkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('🔍 requireClerkAuth called');
    
    // Get the Authorization header
    const authHeader = req.headers.authorization;
    console.log('🔍 Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ No valid auth header');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    console.log('🔍 Token length:', token.length);

    // Simple JWT validation - extract user ID from token
    // This is a temporary solution until Clerk backend issues are resolved
    try {
      // Basic JWT structure validation
      const parts = token.split('.');
      console.log('🔍 JWT parts count:', parts.length);
      
      if (parts.length !== 3) {
        console.log('❌ Invalid JWT structure');
        return res.status(401).json({ message: 'Invalid token format' });
      }

      // Decode the payload (second part)
      const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
      console.log('🔍 JWT payload:', payload);
      
      if (!payload.sub) {
        console.log('❌ No sub field in JWT payload');
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      const userId = payload.sub;
      console.log('🔍 Extracted userId:', userId);

      // Store Clerk user ID in request
      req.clerkUserId = userId;

      // Sync user with local database
      try {
        console.log('🔍 Calling userSyncService.getOrCreateLocalUser...');
        const localUser = await userSyncService.getOrCreateLocalUser(userId);
        console.log('✅ Local user created/found:', localUser);
        req.localUser = localUser;
      } catch (syncError) {
        console.error('❌ Error syncing user:', syncError);
        // Continue with the request even if sync fails
        // The user can still access the API, but some features might not work
      }

      next();
    } catch (jwtError) {
      console.error('❌ JWT validation error:', jwtError);
      return res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

/**
 * Optional authentication middleware
 * Similar to requireClerkAuth but doesn't fail if no token
 */
export const optionalClerkAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Basic JWT structure validation
        const parts = token.split('.');
        if (parts.length === 3) {
          // Decode the payload (second part)
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
          
          if (payload.sub) {
            const userId = payload.sub;
            req.clerkUserId = userId;
            
            // Sync user with local database
            try {
              const localUser = await userSyncService.getOrCreateLocalUser(userId);
              req.localUser = localUser;
            } catch (syncError) {
              console.error('Error syncing user:', syncError);
            }
          }
        }
      } catch (error) {
        // Token is invalid, but we continue without authentication
        console.error('Invalid token in optional auth:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional authentication error:', error);
    next();
  }
};

/**
 * Get current user from request
 */
export const getCurrentUser = (req: Request) => {
  return req.localUser;
};

/**
 * Get current Clerk user ID from request
 */
export const getCurrentClerkUserId = (req: Request) => {
  return req.clerkUserId;
};
