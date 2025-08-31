import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { emailService } from "./services/email";
import { deliverabilityService } from "./services/deliverability";
import { insertEmailAccountSchema, updateEmailAccountSchema, insertLeadSchema, updateLeadSchema, insertSequenceSchema, updateSequenceSchema, insertSequenceStepSchema, updateSequenceStepSchema, insertCampaignSchema, updateCampaignSchema } from "@shared/schema";
import { requireClerkAuth, getCurrentUser } from "./middleware/auth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Remove session middleware - Clerk handles authentication
  
  // Create HTTP server
  const server = createServer(app);

  // Email Accounts routes
  app.post('/api/email-accounts', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailAccountData = insertEmailAccountSchema.parse(req.body);
      
      // Encrypt the password before storing
      const encryptedPassword = emailService.encryptPassword(emailAccountData.password);
      
      const emailAccount = await storage.createEmailAccount({
        name: emailAccountData.name,
        email: emailAccountData.email,
        provider: emailAccountData.provider,
        smtpHost: emailAccountData.smtpHost,
        smtpPort: emailAccountData.smtpPort,
        imapHost: emailAccountData.imapHost,
        imapPort: emailAccountData.imapPort,
        username: emailAccountData.username,
        encryptedPassword,
        dailyLimit: emailAccountData.dailyLimit,
        isActive: emailAccountData.isActive,
        userId: currentUser.id,
      });

      // Test the connection
      try {
        const testResult = await emailService.testEmailAccount(emailAccount);
        await storage.updateEmailAccount(emailAccount.id, {
          status: testResult.success ? 'active' : 'error',
          errorMessage: testResult.success ? null : testResult.error,
          lastTested: new Date(),
        });
      } catch (testError) {
        await storage.updateEmailAccount(emailAccount.id, {
          status: 'error',
          errorMessage: testError instanceof Error ? testError.message : 'Connection test failed',
          lastTested: new Date(),
        });
      }

      res.json(emailAccount);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create email account' });
    }
  });

  app.get('/api/email-accounts', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailAccounts = await storage.getEmailAccounts(currentUser.id);
      res.json(emailAccounts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get email accounts' });
    }
  });

  app.put('/api/email-accounts/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailAccount = await storage.getEmailAccount(req.params.id);
      if (!emailAccount) {
        return res.status(404).json({ message: 'Email account not found' });
      }

      if (emailAccount.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = updateEmailAccountSchema.parse(req.body);
      const updatedAccount = await storage.updateEmailAccount(req.params.id, updateData);
      res.json(updatedAccount);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update email account' });
    }
  });

  app.delete('/api/email-accounts/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailAccount = await storage.getEmailAccount(req.params.id);
      if (!emailAccount) {
        return res.status(404).json({ message: 'Email account not found' });
      }

      if (emailAccount.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      console.log(`🔍 Attempting to delete email account: ${req.params.id}`);
      await storage.deleteEmailAccount(req.params.id);
      console.log(`✅ Email account deleted successfully: ${req.params.id}`);
      res.json({ message: 'Email account deleted successfully' });
    } catch (error) {
      console.error(`❌ Failed to delete email account ${req.params.id}:`, error);
      res.status(500).json({ message: 'Failed to delete email account' });
    }
  });

  app.post('/api/email-accounts/:id/test', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailAccount = await storage.getEmailAccount(req.params.id);
      if (!emailAccount) {
        return res.status(404).json({ message: 'Email account not found' });
      }

      if (emailAccount.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const testResult = await emailService.testEmailAccount(emailAccount);
      
      await storage.updateEmailAccount(emailAccount.id, {
        status: testResult.success ? 'active' : 'error',
        errorMessage: testResult.success ? null : testResult.error,
        lastTested: new Date(),
      });

      res.json(testResult);
    } catch (error) {
      res.status(500).json({ message: 'Failed to test email account' });
    }
  });

  // Leads routes
  app.post('/api/leads', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead({
        ...leadData,
        userId: currentUser.id,
      });
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create lead' });
    }
  });

  app.post('/api/leads/bulk', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const leadsData = req.body;
      if (!Array.isArray(leadsData)) {
        return res.status(400).json({ message: 'Leads data must be an array' });
      }

      const createdLeads = [];
      for (const leadData of leadsData) {
        try {
          const validatedData = insertLeadSchema.parse(leadData);
          const lead = await storage.createLead({
            ...validatedData,
            userId: currentUser.id,
          });
          createdLeads.push(lead);
        } catch (validationError) {
          console.error('Validation error for lead:', validationError);
        }
      }

      res.json(createdLeads);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create leads' });
    }
  });

  app.get('/api/leads', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const leads = await storage.getLeads(currentUser.id);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get leads' });
    }
  });

  app.put('/api/leads/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      if (lead.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      console.log('🔍 Lead update request:', {
        leadId: req.params.id,
        currentStatus: lead.status,
        requestBody: req.body,
        userId: currentUser.id
      });

      const updateData = updateLeadSchema.parse(req.body);
      console.log('🔍 Parsed update data:', updateData);

      const updatedLead = await storage.updateLead(req.params.id, updateData);
      console.log('🔍 Updated lead result:', updatedLead);

      res.json(updatedLead);
    } catch (error) {
      console.error('❌ Lead update error:', error);
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update lead' });
    }
  });

  app.delete('/api/leads/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      if (lead.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteLead(req.params.id);
      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete lead' });
    }
  });

  // Sequences routes
  app.post('/api/sequences', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { steps, ...sequenceData } = req.body;
      const validatedSequenceData = insertSequenceSchema.parse(sequenceData);
      
      const sequence = await storage.createSequence({
        ...validatedSequenceData,
        userId: currentUser.id,
      });

      // Create sequence steps if provided
      if (steps && Array.isArray(steps) && steps.length > 0) {
        for (const step of steps) {
          await storage.createSequenceStep({
            sequenceId: sequence.id,
            stepNumber: step.stepNumber,
            subject: step.subject,
            body: step.body,
            delayDays: step.delayDays,
          });
        }
      }

      // Return the sequence with steps
      const sequenceWithSteps = await storage.getSequenceWithSteps(sequence.id);
      res.json(sequenceWithSteps);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create sequence' });
    }
  });

  app.get('/api/sequences', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const sequences = await storage.getSequences(currentUser.id);
      res.json(sequences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get sequences' });
    }
  });

  app.get('/api/sequences/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const sequence = await storage.getSequenceWithSteps(req.params.id);
      if (!sequence) {
        return res.status(404).json({ message: 'Sequence not found' });
      }

      if (sequence.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      res.json(sequence);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get sequence' });
    }
  });

  app.put('/api/sequences/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const sequence = await storage.getSequence(req.params.id);
      if (!sequence) {
        return res.status(404).json({ message: 'Sequence not found' });
      }

      if (sequence.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = updateSequenceSchema.parse(req.body);
      const updatedSequence = await storage.updateSequence(req.params.id, updateData);
      res.json(updatedSequence);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update sequence' });
    }
  });

  app.delete('/api/sequences/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const sequence = await storage.getSequence(req.params.id);
      if (!sequence) {
        return res.status(404).json({ message: 'Sequence not found' });
      }

      if (sequence.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteSequence(req.params.id);
      res.json({ message: 'Sequence deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete sequence' });
    }
  });

  // Sequence Steps routes
  app.post('/api/sequence-steps', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const stepData = req.body;
      const step = await storage.createSequenceStep({
        ...stepData,
        userId: currentUser.id
      });

      res.status(201).json(step);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create sequence step' });
    }
  });

  app.put('/api/sequence-steps/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const step = await storage.getSequenceStep(req.params.id);
      if (!step) {
        return res.status(404).json({ message: 'Sequence step not found' });
      }

      if (step.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = req.body;
      const updatedStep = await storage.updateSequenceStep(req.params.id, updateData);
      res.json(updatedStep);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update sequence step' });
    }
  });

  app.delete('/api/sequence-steps/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const step = await storage.getSequenceStep(req.params.id);
      if (!step) {
        return res.status(404).json({ message: 'Sequence step not found' });
      }

      if (step.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteSequenceStep(req.params.id);
      res.json({ message: 'Sequence step deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete sequence step' });
    }
  });

  // Campaigns routes
  app.post('/api/campaigns', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign({ 
        ...campaignData, 
        userId: currentUser.id,
      });
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create campaign' });
    }
  });

  app.get('/api/campaigns', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const campaigns = await storage.getCampaigns(currentUser.id);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get campaigns' });
    }
  });

  app.put('/api/campaigns/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = updateCampaignSchema.parse(req.body);
      const updatedCampaign = await storage.updateCampaign(req.params.id, updateData);
      res.json(updatedCampaign);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update campaign' });
    }
  });

  app.delete('/api/campaigns/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteCampaign(req.params.id);
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete campaign' });
    }
  });

  // Campaign Emails routes
  app.get('/api/campaigns/:id/emails', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const emails = await storage.getCampaignEmails(req.params.id);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get campaign emails' });
    }
  });

  app.post('/api/campaign-emails', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailData = req.body;
      const email = await storage.createCampaignEmail({
        ...emailData,
        userId: currentUser.id
      });

      res.status(201).json(email);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create campaign email' });
    }
  });

  app.put('/api/campaign-emails/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const email = await storage.getCampaignEmail(req.params.id);
      if (!email) {
        return res.status(404).json({ message: 'Campaign email not found' });
      }

      if (email.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updateData = req.body;
      const updatedEmail = await storage.updateCampaignEmail(req.params.id, updateData);
      res.json(updatedEmail);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update campaign email' });
    }
  });

  app.delete('/api/campaign-emails/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const email = await storage.getCampaignEmail(req.params.id);
      if (!email) {
        return res.status(404).json({ message: 'Campaign email not found' });
      }

      if (email.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteCampaignEmail(req.params.id);
      res.json({ message: 'Campaign email deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete campaign email' });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const metrics = await storage.getDashboardMetrics(currentUser.id);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get dashboard metrics' });
    }
  });

  // Inbox routes
  app.get('/api/inbox', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const inboxItems = await storage.getInboxMessages(currentUser.id);
      res.json(inboxItems);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get inbox items' });
    }
  });

  app.post('/api/inbox', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const messageData = req.body;
      const message = await storage.createInboxMessage({
        ...messageData,
        userId: currentUser.id
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create inbox message' });
    }
  });

  app.put('/api/inbox/:id/read', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const message = await storage.getInboxMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      if (message.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedMessage = await storage.markMessageRead(req.params.id);
      res.json(updatedMessage);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  app.delete('/api/inbox/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const message = await storage.getInboxMessage(req.params.id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }

      if (message.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      await storage.deleteInboxMessage(req.params.id);
      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete message' });
    }
  });

  // Deliverability routes
  app.post('/api/deliverability/test', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { emailContent, fromEmail } = req.body;
      const result = await deliverabilityService.testDeliverability(emailContent, fromEmail);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to test deliverability' });
    }
  });

  app.post('/api/deliverability/domain-reputation', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { domain } = req.body;
      const result = await deliverabilityService.checkDomainReputation(domain);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to check domain reputation' });
    }
  });

  // Profile update route
  app.put('/api/auth/profile', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { name, email } = req.body;
      
      // Validate input
      if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
      }
      
      // Check if email is already taken by another user
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser && existingUser.id !== currentUser.id) {
        return res.status(400).json({ message: 'Email is already taken' });
      }
      
      // Update user profile
      const updatedUser = await storage.updateUser(currentUser.id, { name, email });
      res.json({ user: { id: updatedUser.id, email: updatedUser.email, name: updatedUser.name } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  // Bulk Operations routes
  app.delete('/api/leads/bulk', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid IDs array' });
      }

      const deletedCount = await storage.deleteLeadsBulk(ids, currentUser.id);
      res.json({ message: `${deletedCount} leads deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete leads' });
    }
  });

  app.delete('/api/email-accounts/bulk', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid IDs array' });
      }

      const deletedCount = await storage.deleteEmailAccountsBulk(ids, currentUser.id);
      res.json({ message: `${deletedCount} email accounts deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete email accounts' });
    }
  });

  app.delete('/api/sequences/bulk', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid IDs array' });
      }

      const deletedCount = await storage.deleteSequencesBulk(ids, currentUser.id);
      res.json({ message: `${deletedCount} sequences deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete sequences' });
    }
  });

  app.delete('/api/campaigns/bulk', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: 'Invalid IDs array' });
      }

      const deletedCount = await storage.deleteCampaignsBulk(ids, currentUser.id);
      res.json({ message: `${deletedCount} campaigns deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete campaigns' });
    }
  });

  // Search & Filtering routes
  app.get('/api/leads/search', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query required' });
      }

      const results = await storage.searchLeads(q, currentUser.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search leads' });
    }
  });

  app.get('/api/inbox/search', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { q } = req.query;
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ message: 'Search query required' });
      }

      const results = await storage.searchInbox(q, currentUser.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Failed to search inbox' });
    }
  });

  app.post('/api/campaigns/filter', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const filters = req.body;
      const results = await storage.filterCampaigns(filters, currentUser.id);
      res.json(results);
    } catch (error) {
      res.status(500).json({ message: 'Failed to filter campaigns' });
    }
  });

  // Email Sending routes
  app.post('/api/email/send', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailData = req.body;
      const result = await storage.sendEmail(emailData, currentUser.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to send email' });
    }
  });

  app.post('/api/email/bulk-send', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailData = req.body;
      const result = await storage.sendBulkEmails(emailData, currentUser.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to send bulk emails' });
    }
  });

  app.post('/api/email/schedule', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const emailData = req.body;
      const result = await storage.scheduleEmail(emailData, currentUser.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Failed to schedule email' });
    }
  });

  // Analytics & Reporting routes
  app.get('/api/analytics/campaigns/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const campaign = await storage.getCampaign(req.params.id);
      if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found' });
      }

      if (campaign.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const analytics = await storage.getCampaignAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get campaign analytics' });
    }
  });

  app.get('/api/analytics/leads/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }

      if (lead.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const analytics = await storage.getLeadAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get lead analytics' });
    }
  });

  app.get('/api/analytics/email-accounts/:id', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const account = await storage.getEmailAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ message: 'Email account not found' });
      }

      if (account.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const analytics = await storage.getEmailAccountAnalytics(req.params.id);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get email account analytics' });
    }
  });

  app.post('/api/export', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { type, filters } = req.body;
      const exportData = await storage.exportData(type, filters, currentUser.id);
      res.json(exportData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Notifications & Webhooks routes
  app.get('/api/notifications', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const notifications = await storage.getNotifications(currentUser.id);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get notifications' });
    }
  });

  app.put('/api/notifications/:id/read', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const notification = await storage.getNotification(req.params.id);
      if (!notification) {
        return res.status(404).json({ message: 'Notification not found' });
      }

      if (notification.userId !== currentUser.id) {
        return res.status(403).json({ message: 'Access denied' });
      }

      const updatedNotification = await storage.markNotificationRead(req.params.id);
      res.json(updatedNotification);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark notification as read' });
    }
  });

  app.post('/api/webhooks', requireClerkAuth, async (req, res) => {
    try {
      const currentUser = getCurrentUser(req);
      if (!currentUser) {
        return res.status(401).json({ message: 'User not found' });
      }

      const webhookData = req.body;
      const webhook = await storage.createWebhook({
        ...webhookData,
        userId: currentUser.id
      });

      res.status(201).json(webhook);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create webhook' });
    }
  });

  return server;
}
