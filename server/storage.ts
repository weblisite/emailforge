import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, count, sql } from "drizzle-orm";
import { 
  users, 
  emailAccounts, 
  leads, 
  sequences, 
  sequenceSteps, 
  campaigns, 
  campaignEmails, 
  inboxMessages,
  type User, 
  type EmailAccount, 
  type Lead, 
  type Sequence, 
  type SequenceStep, 
  type Campaign, 
  type CampaignEmail, 
  type InboxMessage,
  type InsertUser, 
  type InsertEmailAccount, 
  type InsertLead, 
  type InsertSequence, 
  type InsertSequenceStep, 
  type InsertCampaign 
} from "@shared/schema";

const connection = neon(process.env.DATABASE_URL!);
const db = drizzle(connection);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Email Accounts
  getEmailAccounts(userId: string): Promise<EmailAccount[]>;
  getEmailAccount(id: string): Promise<EmailAccount | undefined>;
  createEmailAccount(account: InsertEmailAccount & { userId: string }): Promise<EmailAccount>;
  updateEmailAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount>;
  deleteEmailAccount(id: string): Promise<void>;
  
  // Leads
  getLeads(userId: string): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead & { userId: string }): Promise<Lead>;
  createLeads(leads: (InsertLead & { userId: string })[]): Promise<Lead[]>;
  updateLead(id: string, updates: Partial<Lead>): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  
  // Sequences
  getSequences(userId: string): Promise<Sequence[]>;
  getSequence(id: string): Promise<Sequence | undefined>;
  getSequenceWithSteps(id: string): Promise<(Sequence & { steps: SequenceStep[] }) | undefined>;
  createSequence(sequence: InsertSequence & { userId: string }): Promise<Sequence>;
  updateSequence(id: string, updates: Partial<Sequence>): Promise<Sequence>;
  deleteSequence(id: string): Promise<void>;
  
  // Sequence Steps
  createSequenceStep(step: InsertSequenceStep): Promise<SequenceStep>;
  updateSequenceStep(id: string, updates: Partial<SequenceStep>): Promise<SequenceStep>;
  deleteSequenceStep(id: string): Promise<void>;
  
  // Campaigns
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: string): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign & { userId: string }): Promise<Campaign>;
  updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign>;
  deleteCampaign(id: string): Promise<void>;
  
  // Campaign Emails
  getCampaignEmails(campaignId: string): Promise<CampaignEmail[]>;
  createCampaignEmail(email: Omit<CampaignEmail, 'id' | 'createdAt'>): Promise<CampaignEmail>;
  updateCampaignEmail(id: string, updates: Partial<CampaignEmail>): Promise<CampaignEmail>;
  
  // Inbox Messages
  getInboxMessages(userId: string): Promise<InboxMessage[]>;
  createInboxMessage(message: Omit<InboxMessage, 'id' | 'createdAt'>): Promise<InboxMessage>;
  markMessageRead(id: string): Promise<void>;
  
  // Dashboard Metrics
  getDashboardMetrics(userId: string): Promise<{
    totalSent: number;
    openRate: number;
    replyRate: number;
    activeAccounts: number;
    activeCampaigns: number;
    pendingEmails: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async getEmailAccounts(userId: string): Promise<EmailAccount[]> {
    return db.select().from(emailAccounts).where(eq(emailAccounts.userId, userId)).orderBy(desc(emailAccounts.createdAt));
  }

  async getEmailAccount(id: string): Promise<EmailAccount | undefined> {
    const result = await db.select().from(emailAccounts).where(eq(emailAccounts.id, id)).limit(1);
    return result[0];
  }

  async createEmailAccount(account: InsertEmailAccount & { userId: string }): Promise<EmailAccount> {
    const result = await db.insert(emailAccounts).values(account).returning();
    return result[0];
  }

  async updateEmailAccount(id: string, updates: Partial<EmailAccount>): Promise<EmailAccount> {
    const result = await db.update(emailAccounts).set({ ...updates, updatedAt: new Date() }).where(eq(emailAccounts.id, id)).returning();
    return result[0];
  }

  async deleteEmailAccount(id: string): Promise<void> {
    await db.delete(emailAccounts).where(eq(emailAccounts.id, id));
  }

  async getLeads(userId: string): Promise<Lead[]> {
    return db.select().from(leads).where(eq(leads.userId, userId)).orderBy(desc(leads.createdAt));
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const result = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
    return result[0];
  }

  async createLead(lead: InsertLead & { userId: string }): Promise<Lead> {
    const result = await db.insert(leads).values(lead).returning();
    return result[0];
  }

  async createLeads(leadsData: (InsertLead & { userId: string })[]): Promise<Lead[]> {
    const result = await db.insert(leads).values(leadsData).returning();
    return result;
  }

  async updateLead(id: string, updates: Partial<Lead>): Promise<Lead> {
    const result = await db.update(leads).set({ ...updates, updatedAt: new Date() }).where(eq(leads.id, id)).returning();
    return result[0];
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async getSequences(userId: string): Promise<Sequence[]> {
    return db.select().from(sequences).where(eq(sequences.userId, userId)).orderBy(desc(sequences.createdAt));
  }

  async getSequence(id: string): Promise<Sequence | undefined> {
    const result = await db.select().from(sequences).where(eq(sequences.id, id)).limit(1);
    return result[0];
  }

  async getSequenceWithSteps(id: string): Promise<(Sequence & { steps: SequenceStep[] }) | undefined> {
    const sequence = await this.getSequence(id);
    if (!sequence) return undefined;
    
    const steps = await db.select().from(sequenceSteps).where(eq(sequenceSteps.sequenceId, id)).orderBy(sequenceSteps.stepNumber);
    return { ...sequence, steps };
  }

  async createSequence(sequence: InsertSequence & { userId: string }): Promise<Sequence> {
    const result = await db.insert(sequences).values(sequence).returning();
    return result[0];
  }

  async updateSequence(id: string, updates: Partial<Sequence>): Promise<Sequence> {
    const result = await db.update(sequences).set({ ...updates, updatedAt: new Date() }).where(eq(sequences.id, id)).returning();
    return result[0];
  }

  async deleteSequence(id: string): Promise<void> {
    await db.delete(sequences).where(eq(sequences.id, id));
  }

  async createSequenceStep(step: InsertSequenceStep): Promise<SequenceStep> {
    const result = await db.insert(sequenceSteps).values(step).returning();
    return result[0];
  }

  async updateSequenceStep(id: string, updates: Partial<SequenceStep>): Promise<SequenceStep> {
    const result = await db.update(sequenceSteps).set(updates).where(eq(sequenceSteps.id, id)).returning();
    return result[0];
  }

  async deleteSequenceStep(id: string): Promise<void> {
    await db.delete(sequenceSteps).where(eq(sequenceSteps.id, id));
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: string): Promise<Campaign | undefined> {
    const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
    return result[0];
  }

  async createCampaign(campaign: InsertCampaign & { userId: string }): Promise<Campaign> {
    const result = await db.insert(campaigns).values(campaign).returning();
    return result[0];
  }

  async updateCampaign(id: string, updates: Partial<Campaign>): Promise<Campaign> {
    const result = await db.update(campaigns).set({ ...updates, updatedAt: new Date() }).where(eq(campaigns.id, id)).returning();
    return result[0];
  }

  async deleteCampaign(id: string): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  async getCampaignEmails(campaignId: string): Promise<CampaignEmail[]> {
    return db.select().from(campaignEmails).where(eq(campaignEmails.campaignId, campaignId)).orderBy(desc(campaignEmails.createdAt));
  }

  async createCampaignEmail(email: Omit<CampaignEmail, 'id' | 'createdAt'>): Promise<CampaignEmail> {
    const result = await db.insert(campaignEmails).values(email).returning();
    return result[0];
  }

  async updateCampaignEmail(id: string, updates: Partial<CampaignEmail>): Promise<CampaignEmail> {
    const result = await db.update(campaignEmails).set(updates).where(eq(campaignEmails.id, id)).returning();
    return result[0];
  }

  async getInboxMessages(userId: string): Promise<InboxMessage[]> {
    return db.select().from(inboxMessages).where(eq(inboxMessages.userId, userId)).orderBy(desc(inboxMessages.receivedAt));
  }

  async createInboxMessage(message: Omit<InboxMessage, 'id' | 'createdAt'>): Promise<InboxMessage> {
    const result = await db.insert(inboxMessages).values(message).returning();
    return result[0];
  }

  async markMessageRead(id: string): Promise<void> {
    await db.update(inboxMessages).set({ isRead: true }).where(eq(inboxMessages.id, id));
  }

  async getDashboardMetrics(userId: string): Promise<{
    totalSent: number;
    openRate: number;
    replyRate: number;
    activeAccounts: number;
    activeCampaigns: number;
    pendingEmails: number;
  }> {
    const [
      totalSentResult,
      openRateResult,
      replyRateResult,
      activeAccountsResult,
      activeCampaignsResult,
      pendingEmailsResult
    ] = await Promise.all([
      db.select({ count: count() }).from(campaignEmails)
        .innerJoin(campaigns, eq(campaignEmails.campaignId, campaigns.id))
        .where(and(eq(campaigns.userId, userId), eq(campaignEmails.status, 'sent'))),
      
      db.select({ 
        total: count(),
        opened: sql<number>`count(case when ${campaignEmails.openedAt} is not null then 1 end)`
      }).from(campaignEmails)
        .innerJoin(campaigns, eq(campaignEmails.campaignId, campaigns.id))
        .where(and(eq(campaigns.userId, userId), eq(campaignEmails.status, 'sent'))),
      
      db.select({ 
        total: count(),
        replied: sql<number>`count(case when ${campaignEmails.repliedAt} is not null then 1 end)`
      }).from(campaignEmails)
        .innerJoin(campaigns, eq(campaignEmails.campaignId, campaigns.id))
        .where(and(eq(campaigns.userId, userId), eq(campaignEmails.status, 'sent'))),
      
      db.select({ count: count() }).from(emailAccounts)
        .where(and(eq(emailAccounts.userId, userId), eq(emailAccounts.isActive, true))),
      
      db.select({ count: count() }).from(campaigns)
        .where(and(eq(campaigns.userId, userId), eq(campaigns.status, 'active'))),
      
      db.select({ count: count() }).from(campaignEmails)
        .innerJoin(campaigns, eq(campaignEmails.campaignId, campaigns.id))
        .where(and(eq(campaigns.userId, userId), eq(campaignEmails.status, 'pending')))
    ]);

    const totalSent = totalSentResult[0]?.count || 0;
    const openData = openRateResult[0];
    const replyData = replyRateResult[0];
    
    const openRate = openData && openData.total > 0 ? (Number(openData.opened) / Number(openData.total)) * 100 : 0;
    const replyRate = replyData && replyData.total > 0 ? (Number(replyData.replied) / Number(replyData.total)) * 100 : 0;

    return {
      totalSent,
      openRate: Math.round(openRate * 10) / 10,
      replyRate: Math.round(replyRate * 10) / 10,
      activeAccounts: activeAccountsResult[0]?.count || 0,
      activeCampaigns: activeCampaignsResult[0]?.count || 0,
      pendingEmails: pendingEmailsResult[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
