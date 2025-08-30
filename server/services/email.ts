import * as crypto from 'crypto';
import nodemailer from 'nodemailer';
import * as imaps from 'imap-simple';

export class EmailService {
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';
  }

  encryptPassword(password: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipher(algorithm, key);
    let encrypted = cipher.update(password, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  decryptPassword(encryptedPassword: string): string {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    
    const parts = encryptedPassword.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipher(algorithm, key);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  async testEmailConnection(config: {
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      // Basic validation
      if (!config.smtpHost || !config.username || !config.password) {
        return { success: false, error: 'Missing required configuration' };
      }

      // Test SMTP connection with nodemailer
      const transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.username,
          pass: config.password,
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 10000,
        greetingTimeout: 5000,
        socketTimeout: 10000
      });

      // Verify connection
      await transporter.verify();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  async sendEmail(config: {
    smtpHost: string;
    smtpPort: number;
    username: string;
    password: string;
    to: string;
    subject: string;
    body: string;
    fromName?: string;
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const transporter = nodemailer.createTransporter({
        host: config.smtpHost,
        port: config.smtpPort,
        secure: config.smtpPort === 465,
        auth: {
          user: config.username,
          pass: config.password,
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      const mailOptions = {
        from: config.fromName ? `${config.fromName} <${config.username}>` : config.username,
        to: config.to,
        subject: config.subject,
        html: config.body,
        text: config.body.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const info = await transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Send failed' };
    }
  }

  replaceTokens(template: string, data: Record<string, string>): string {
    let result = template;
    for (const [key, value] of Object.entries(data)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, value || '');
    }
    return result;
  }

  async testImapConnection(config: {
    imapHost: string;
    imapPort: number;
    username: string;
    password: string;
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const connection = await imaps.connect({
        imap: {
          user: config.username,
          password: config.password,
          host: config.imapHost,
          port: config.imapPort,
          tls: config.imapPort === 993,
          authTimeout: 10000,
          connTimeout: 10000,
          tlsOptions: { rejectUnauthorized: false }
        }
      });
      
      await connection.end();
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'IMAP connection failed' };
    }
  }

  async checkInboxMessages(config: {
    imapHost: string;
    imapPort: number;
    username: string;
    password: string;
  }): Promise<{ success: boolean; messages?: any[]; error?: string }> {
    try {
      const connection = await imaps.connect({
        imap: {
          user: config.username,
          password: config.password,
          host: config.imapHost,
          port: config.imapPort,
          tls: config.imapPort === 993,
          authTimeout: 10000,
          connTimeout: 10000,
          tlsOptions: { rejectUnauthorized: false }
        }
      });

      await connection.openBox('INBOX');
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: 'HEADER.FIELDS (FROM TO SUBJECT DATE)',
        markSeen: false,
        struct: true
      };

      const messages = await connection.search(searchCriteria, fetchOptions);
      await connection.end();

      return { success: true, messages };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to check inbox' };
    }
  }

  generateBoundaryId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  validateEmailTemplate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check for balanced merge tags
    const mergeTagPattern = /{{(\w+)}}/g;
    const matches = template.match(mergeTagPattern);
    
    if (matches) {
      const invalidTags = matches.filter(tag => {
        const tagName = tag.slice(2, -2);
        return !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(tagName);
      });
      
      if (invalidTags.length > 0) {
        errors.push(`Invalid merge tags: ${invalidTags.join(', ')}`);
      }
    }
    
    // Check for basic HTML validity if it contains HTML
    if (template.includes('<') && template.includes('>')) {
      const htmlPattern = /<[^>]+>/g;
      const htmlTags = template.match(htmlPattern);
      if (htmlTags) {
        const openTags = htmlTags.filter(tag => !tag.startsWith('</') && !tag.endsWith('/>'));
        const closeTags = htmlTags.filter(tag => tag.startsWith('</'));
        
        if (openTags.length !== closeTags.length) {
          errors.push('Unbalanced HTML tags detected');
        }
      }
    }
    
    return { valid: errors.length === 0, errors };
  }
}

export const emailService = new EmailService();
