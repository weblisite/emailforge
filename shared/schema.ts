import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const emailAccounts = pgTable("email_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  provider: text("provider").notNull(), // zoho, protonmail, fastmail, custom
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").notNull(),
  imapHost: text("imap_host").notNull(),
  imapPort: integer("imap_port").notNull(),
  username: text("username").notNull(),
  encryptedPassword: text("encrypted_password").notNull(),
  dailyLimit: integer("daily_limit").default(50),
  sentToday: integer("sent_today").default(0),
  isActive: boolean("is_active").default(true),
  lastTested: timestamp("last_tested"),
  status: text("status").default("pending"), // pending, active, error, testing
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  title: text("title"),
  customFields: jsonb("custom_fields").$type<Record<string, string>>().default({}),
  status: text("status").default("active"), // active, unsubscribed, bounced
  source: text("source"), // csv, manual, api
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sequences = pgTable("sequences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const sequenceSteps = pgTable("sequence_steps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sequenceId: varchar("sequence_id").notNull().references(() => sequences.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  delayDays: integer("delay_days").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const campaigns = pgTable("campaigns", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  sequenceId: varchar("sequence_id").notNull().references(() => sequences.id),
  name: text("name").notNull(),
  status: text("status").default("draft"), // draft, active, paused, completed
  totalLeads: integer("total_leads").default(0),
  sentCount: integer("sent_count").default(0),
  openCount: integer("open_count").default(0),
  replyCount: integer("reply_count").default(0),
  bounceCount: integer("bounce_count").default(0),
  unsubscribeCount: integer("unsubscribe_count").default(0),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const campaignEmails = pgTable("campaign_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: varchar("campaign_id").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  leadId: varchar("lead_id").notNull().references(() => leads.id),
  emailAccountId: varchar("email_account_id").notNull().references(() => emailAccounts.id),
  sequenceStepId: varchar("sequence_step_id").notNull().references(() => sequenceSteps.id),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  status: text("status").default("pending"), // pending, sent, delivered, opened, replied, bounced, failed
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  openedAt: timestamp("opened_at"),
  repliedAt: timestamp("replied_at"),
  bouncedAt: timestamp("bounced_at"),
  errorMessage: text("error_message"),
  deliverabilityScore: decimal("deliverability_score", { precision: 3, scale: 1 }),
  spamScore: decimal("spam_score", { precision: 3, scale: 1 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inboxMessages = pgTable("inbox_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailAccountId: varchar("email_account_id").notNull().references(() => emailAccounts.id),
  campaignEmailId: varchar("campaign_email_id").references(() => campaignEmails.id),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name"),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  messageId: text("message_id").notNull(),
  threadId: text("thread_id"),
  isRead: boolean("is_read").default(false),
  sentiment: text("sentiment"), // positive, negative, neutral, unsubscribe
  receivedAt: timestamp("received_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmailAccountSchema = createInsertSchema(emailAccounts).omit({
  id: true,
  userId: true,
  sentToday: true,
  lastTested: true,
  status: true,
  errorMessage: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  userId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSequenceSchema = createInsertSchema(sequences).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSequenceStepSchema = createInsertSchema(sequenceSteps).omit({
  id: true,
  createdAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  userId: true,
  totalLeads: true,
  sentCount: true,
  openCount: true,
  replyCount: true,
  bounceCount: true,
  unsubscribeCount: true,
  startedAt: true,
  completedAt: true,
  createdAt: true,
  updatedAt: true,
});

// Select types
export type User = typeof users.$inferSelect;
export type EmailAccount = typeof emailAccounts.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Sequence = typeof sequences.$inferSelect;
export type SequenceStep = typeof sequenceSteps.$inferSelect;
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignEmail = typeof campaignEmails.$inferSelect;
export type InboxMessage = typeof inboxMessages.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertEmailAccount = z.infer<typeof insertEmailAccountSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertSequence = z.infer<typeof insertSequenceSchema>;
export type InsertSequenceStep = z.infer<typeof insertSequenceStepSchema>;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
