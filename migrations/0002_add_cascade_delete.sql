-- Migration to add ON DELETE CASCADE constraints for email_accounts foreign keys
-- This ensures that when an email account is deleted, all related records are also deleted

-- Drop existing foreign key constraints
ALTER TABLE campaign_emails DROP CONSTRAINT IF EXISTS campaign_emails_email_account_id_fkey;
ALTER TABLE inbox_messages DROP CONSTRAINT IF EXISTS inbox_messages_email_account_id_fkey;

-- Re-add foreign key constraints with ON DELETE CASCADE
ALTER TABLE campaign_emails 
ADD CONSTRAINT campaign_emails_email_account_id_fkey 
FOREIGN KEY (email_account_id) REFERENCES email_accounts(id) ON DELETE CASCADE;

ALTER TABLE inbox_messages 
ADD CONSTRAINT inbox_messages_email_account_id_fkey 
FOREIGN KEY (email_account_id) REFERENCES email_accounts(id) ON DELETE CASCADE;

-- Add comment explaining the change
COMMENT ON TABLE campaign_emails IS 'Campaign emails with cascade delete for email accounts';
COMMENT ON TABLE inbox_messages IS 'Inbox messages with cascade delete for email accounts';
