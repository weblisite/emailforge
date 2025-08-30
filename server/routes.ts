import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { emailService } from "./services/email";
import { deliverabilityService } from "./services/deliverability";
import { insertUserSchema, insertEmailAccountSchema, insertLeadSchema, insertSequenceSchema, insertCampaignSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    next();
  };

  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await authService.register(userData);
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await authService.login(email, password);
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      req.session.userId = user.id;
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Login failed' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ message: 'Logged out successfully' });
    });
  });

  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json({ user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get user' });
    }
  });

  // Dashboard metrics
  app.get('/api/dashboard/metrics', requireAuth, async (req, res) => {
    try {
      const metrics = await storage.getDashboardMetrics(req.session.userId!);
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get metrics' });
    }
  });

  // Email accounts
  app.get('/api/email-accounts', requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getEmailAccounts(req.session.userId!);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get email accounts' });
    }
  });

  app.post('/api/email-accounts', requireAuth, async (req, res) => {
    try {
      const accountData = insertEmailAccountSchema.parse(req.body);
      
      // Encrypt password
      const encryptedPassword = emailService.encryptPassword(accountData.username);
      
      // Test connection
      const testResult = await emailService.testEmailConnection({
        smtpHost: accountData.smtpHost,
        smtpPort: accountData.smtpPort,
        username: accountData.username,
        password: accountData.username // Using username as password for demo
      });

      const account = await storage.createEmailAccount({
        ...accountData,
        userId: req.session.userId!,
        encryptedPassword
      });

      // Update account with test results
      const updatedAccount = await storage.updateEmailAccount(account.id, {
        status: testResult.success ? 'active' : 'error',
        errorMessage: testResult.error,
        lastTested: new Date()
      });

      res.json(updatedAccount);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create email account' });
    }
  });

  app.put('/api/email-accounts/:id', requireAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      if (updates.username) {
        updates.encryptedPassword = emailService.encryptPassword(updates.username);
      }
      
      const account = await storage.updateEmailAccount(id, updates);
      res.json(account);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to update email account' });
    }
  });

  app.delete('/api/email-accounts/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteEmailAccount(req.params.id);
      res.json({ message: 'Email account deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete email account' });
    }
  });

  app.post('/api/email-accounts/:id/test', requireAuth, async (req, res) => {
    try {
      const account = await storage.getEmailAccount(req.params.id);
      if (!account) {
        return res.status(404).json({ message: 'Email account not found' });
      }

      const password = emailService.decryptPassword(account.encryptedPassword);
      const testResult = await emailService.testEmailConnection({
        smtpHost: account.smtpHost,
        smtpPort: account.smtpPort,
        username: account.username,
        password
      });

      await storage.updateEmailAccount(account.id, {
        status: testResult.success ? 'active' : 'error',
        errorMessage: testResult.error,
        lastTested: new Date()
      });

      res.json(testResult);
    } catch (error) {
      res.status(500).json({ message: 'Failed to test email account' });
    }
  });

  // Leads
  app.get('/api/leads', requireAuth, async (req, res) => {
    try {
      const leads = await storage.getLeads(req.session.userId!);
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get leads' });
    }
  });

  app.post('/api/leads', requireAuth, async (req, res) => {
    try {
      const leadData = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead({ ...leadData, userId: req.session.userId! });
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create lead' });
    }
  });

  app.post('/api/leads/bulk', requireAuth, async (req, res) => {
    try {
      const { leads } = req.body;
      const leadsData = z.array(insertLeadSchema).parse(leads);
      const createdLeads = await storage.createLeads(
        leadsData.map(lead => ({ ...lead, userId: req.session.userId! }))
      );
      res.json(createdLeads);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create leads' });
    }
  });

  app.put('/api/leads/:id', requireAuth, async (req, res) => {
    try {
      const lead = await storage.updateLead(req.params.id, req.body);
      res.json(lead);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update lead' });
    }
  });

  app.delete('/api/leads/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteLead(req.params.id);
      res.json({ message: 'Lead deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete lead' });
    }
  });

  // Sequences
  app.get('/api/sequences', requireAuth, async (req, res) => {
    try {
      const sequences = await storage.getSequences(req.session.userId!);
      res.json(sequences);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get sequences' });
    }
  });

  app.get('/api/sequences/:id', requireAuth, async (req, res) => {
    try {
      const sequence = await storage.getSequenceWithSteps(req.params.id);
      if (!sequence) {
        return res.status(404).json({ message: 'Sequence not found' });
      }
      res.json(sequence);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get sequence' });
    }
  });

  app.post('/api/sequences', requireAuth, async (req, res) => {
    try {
      const { sequence, steps } = req.body;
      const sequenceData = insertSequenceSchema.parse(sequence);
      
      const createdSequence = await storage.createSequence({ 
        ...sequenceData, 
        userId: req.session.userId! 
      });

      // Create steps
      for (const step of steps) {
        await storage.createSequenceStep({
          ...step,
          sequenceId: createdSequence.id
        });
      }

      const sequenceWithSteps = await storage.getSequenceWithSteps(createdSequence.id);
      res.json(sequenceWithSteps);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create sequence' });
    }
  });

  app.delete('/api/sequences/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteSequence(req.params.id);
      res.json({ message: 'Sequence deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete sequence' });
    }
  });

  // Campaigns
  app.get('/api/campaigns', requireAuth, async (req, res) => {
    try {
      const campaigns = await storage.getCampaigns(req.session.userId!);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get campaigns' });
    }
  });

  app.post('/api/campaigns', requireAuth, async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign({ 
        ...campaignData, 
        userId: req.session.userId! 
      });
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to create campaign' });
    }
  });

  app.put('/api/campaigns/:id', requireAuth, async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, req.body);
      res.json(campaign);
    } catch (error) {
      res.status(400).json({ message: 'Failed to update campaign' });
    }
  });

  app.delete('/api/campaigns/:id', requireAuth, async (req, res) => {
    try {
      await storage.deleteCampaign(req.params.id);
      res.json({ message: 'Campaign deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete campaign' });
    }
  });

  // Campaign actions
  app.post('/api/campaigns/:id/start', requireAuth, async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, {
        status: 'active',
        startedAt: new Date()
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: 'Failed to start campaign' });
    }
  });

  app.post('/api/campaigns/:id/pause', requireAuth, async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, {
        status: 'paused'
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: 'Failed to pause campaign' });
    }
  });

  app.post('/api/campaigns/:id/stop', requireAuth, async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(req.params.id, {
        status: 'completed',
        completedAt: new Date()
      });
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ message: 'Failed to stop campaign' });
    }
  });

  // Get campaign emails
  app.get('/api/campaigns/:id/emails', requireAuth, async (req, res) => {
    try {
      const emails = await storage.getCampaignEmails(req.params.id);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get campaign emails' });
    }
  });

  // Inbox
  app.get('/api/inbox', requireAuth, async (req, res) => {
    try {
      const messages = await storage.getInboxMessages(req.session.userId!);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to get inbox messages' });
    }
  });

  app.put('/api/inbox/:id/read', requireAuth, async (req, res) => {
    try {
      await storage.markMessageRead(req.params.id);
      res.json({ message: 'Message marked as read' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark message as read' });
    }
  });

  // Sync inbox from email accounts
  app.post('/api/inbox/sync', requireAuth, async (req, res) => {
    try {
      const accounts = await storage.getEmailAccounts(req.session.userId!);
      const results = [];

      for (const account of accounts) {
        if (account.isActive && account.status === 'active') {
          try {
            const password = emailService.decryptPassword(account.encryptedPassword);
            const result = await emailService.checkInboxMessages({
              imapHost: account.imapHost,
              imapPort: account.imapPort,
              username: account.username,
              password
            });

            if (result.success && result.messages) {
              // Process and store new messages
              for (const message of result.messages) {
                const headers = message.parts?.find((p: any) => p.which === 'HEADER')?.body;
                if (headers) {
                  await storage.createInboxMessage({
                    userId: req.session.userId!,
                    emailAccountId: account.id,
                    fromEmail: headers.from?.[0] || 'unknown',
                    fromName: headers.from?.[0]?.split('<')[0]?.trim() || null,
                    subject: headers.subject?.[0] || 'No Subject',
                    body: 'Message body', // Would parse actual body in real implementation
                    messageId: headers['message-id']?.[0] || `msg-${Date.now()}`,
                    threadId: headers['thread-id']?.[0] || null,
                    receivedAt: headers.date?.[0] ? new Date(headers.date[0]) : new Date()
                  });
                }
              }
            }

            results.push({ accountId: account.id, success: result.success, messageCount: result.messages?.length || 0 });
          } catch (error) {
            results.push({ accountId: account.id, success: false, error: error instanceof Error ? error.message : 'Sync failed' });
          }
        }
      }

      res.json({ results });
    } catch (error) {
      res.status(500).json({ message: 'Failed to sync inbox' });
    }
  });

  // Deliverability testing
  app.post('/api/deliverability/test', requireAuth, async (req, res) => {
    try {
      const { fromEmail, subject, body } = req.body;
      const result = await deliverabilityService.testDeliverability({
        fromEmail,
        subject,
        body
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Deliverability test failed' });
    }
  });

  app.post('/api/deliverability/domain-reputation', requireAuth, async (req, res) => {
    try {
      const { domain } = req.body;
      const result = await deliverabilityService.checkDomainReputation(domain);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Domain reputation check failed' });
    }
  });

  // Email template validation
  app.post('/api/templates/validate', requireAuth, async (req, res) => {
    try {
      const { template } = req.body;
      const result = emailService.validateEmailTemplate(template);
      res.json(result);
    } catch (error) {
      res.status(500).json({ message: 'Template validation failed' });
    }
  });

  // Test email sending
  app.post('/api/email/test-send', requireAuth, async (req, res) => {
    try {
      const { emailAccountId, to, subject, body } = req.body;
      
      const account = await storage.getEmailAccount(emailAccountId);
      if (!account) {
        return res.status(404).json({ message: 'Email account not found' });
      }

      const password = emailService.decryptPassword(account.encryptedPassword);
      const result = await emailService.sendEmail({
        smtpHost: account.smtpHost,
        smtpPort: account.smtpPort,
        username: account.username,
        password,
        to,
        subject,
        body,
        fromName: account.name
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : 'Test email failed' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
