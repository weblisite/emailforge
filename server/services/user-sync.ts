import { storage } from '../storage';
import type { User, InsertUser } from '@shared/schema';

export class UserSyncService {
  /**
   * Get or create a local user record for a Clerk user
   * This is for adding sending email accounts, not for authentication
   */
  async getOrCreateLocalUser(clerkUserId: string): Promise<User> {
    console.log('🔍 UserSyncService.getOrCreateLocalUser called with clerkUserId:', clerkUserId);
    
    try {
      // First, try to get existing user by Clerk ID from the temporary email
      console.log('🔍 Trying to get existing user by Clerk ID email...');
      let localUser = await storage.getUserByEmail(`${clerkUserId}@clerk.user`);
      
      if (localUser) {
        console.log('✅ Found existing user by email:', localUser);
        return localUser;
      }
      
      console.log('❌ No existing user found, creating new one...');
      
      // Create a new local user record for this Clerk user
      // This user will be able to add sending email accounts
      const newUserData: InsertUser = {
        name: 'User', // Default name
        email: `${clerkUserId}@clerk.user`, // Temporary email using Clerk ID
        password: '', // No password needed with Clerk
      };
      
      console.log('🔍 User data to create:', newUserData);
      
      try {
        console.log('🔍 Calling storage.createUser...');
        localUser = await storage.createUser(newUserData);
        console.log('✅ Successfully created new local user:', localUser);
        return localUser;
      } catch (createError: any) {
        console.error('❌ User creation failed with error:', createError);
        
        // If creation fails due to duplicate constraint, try to get the existing user
        if (createError.code === '23505' && createError.constraint === 'users_email_unique') {
          console.log('🔍 Duplicate constraint detected, trying to get existing user...');
          localUser = await storage.getUserByEmail(`${clerkUserId}@clerk.user`);
          
          if (localUser) {
            console.log('✅ Found user after duplicate constraint:', localUser);
            return localUser;
          }
        }
        
        // If we still can't find the user, throw the error
        throw new Error('Failed to create or find local user');
      }
    } catch (error) {
      console.error('❌ Error in getOrCreateLocalUser:', error);
      throw new Error('Failed to get or find local user');
    }
  }

  /**
   * Update local user when needed
   */
  async updateLocalUserFromClerk(clerkUserId: string): Promise<User> {
    try {
      const localUser = await storage.getUserByEmail(`${clerkUserId}@clerk.user`);
      
      if (!localUser) {
        throw new Error('Local user not found');
      }

      return localUser;
    } catch (error) {
      console.error('Error updating local user from Clerk:', error);
      throw new Error('Failed to update local user from Clerk');
    }
  }

  /**
   * Handle local user deletion
   */
  async deleteLocalUser(clerkUserId: string): Promise<void> {
    try {
      const localUser = await storage.getUserByEmail(`${clerkUserId}@clerk.user`);
      if (localUser) {
        // Note: deleteUser method doesn't exist in storage interface
        // For now, we'll just log that the user should be deleted
        console.log('User deletion requested for:', clerkUserId);
        // TODO: Implement user deletion when storage method is available
      }
    } catch (error) {
      console.error('Error processing local user deletion:', error);
      // Don't throw error for delete operations
    }
  }
}

export const userSyncService = new UserSyncService();
