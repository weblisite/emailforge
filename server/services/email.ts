import * as crypto from 'crypto';

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
      // In a real implementation, this would test the actual SMTP connection
      // For now, we'll simulate a connection test
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!config.smtpHost || !config.username || !config.password) {
        return { success: false, error: 'Missing required configuration' };
      }
      
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
  }): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      // In a real implementation, this would use nodemailer or similar
      // For now, we'll simulate email sending
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const messageId = `<${Date.now()}.${Math.random().toString(36).substr(2, 9)}@${config.smtpHost}>`;
      
      return { success: true, messageId };
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
}

export const emailService = new EmailService();
