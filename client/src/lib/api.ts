import { apiRequest } from './queryClient';

export interface DashboardMetrics {
  totalSent: number;
  openRate: number;
  replyRate: number;
  activeAccounts: number;
  activeCampaigns: number;
  pendingEmails: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: User;
}

export const api = {
  // Auth
  register: async (data: { email: string; password: string; name: string }): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/register', data);
    return response.json();
  },

  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await apiRequest('POST', '/api/auth/login', data);
    return response.json();
  },

  logout: async (): Promise<void> => {
    await apiRequest('POST', '/api/auth/logout');
  },

  me: async (): Promise<AuthResponse> => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  },

  // Dashboard
  getDashboardMetrics: async (): Promise<DashboardMetrics> => {
    const response = await apiRequest('GET', '/api/dashboard/metrics');
    return response.json();
  },

  // Email Accounts
  getEmailAccounts: async () => {
    const response = await apiRequest('GET', '/api/email-accounts');
    return response.json();
  },

  createEmailAccount: async (data: any) => {
    const response = await apiRequest('POST', '/api/email-accounts', data);
    return response.json();
  },

  updateEmailAccount: async (id: string, data: any) => {
    const response = await apiRequest('PUT', `/api/email-accounts/${id}`, data);
    return response.json();
  },

  deleteEmailAccount: async (id: string) => {
    await apiRequest('DELETE', `/api/email-accounts/${id}`);
  },

  testEmailAccount: async (id: string) => {
    const response = await apiRequest('POST', `/api/email-accounts/${id}/test`);
    return response.json();
  },

  // Leads
  getLeads: async () => {
    const response = await apiRequest('GET', '/api/leads');
    return response.json();
  },

  createLead: async (data: any) => {
    const response = await apiRequest('POST', '/api/leads', data);
    return response.json();
  },

  createLeadsBulk: async (leads: any[]) => {
    const response = await apiRequest('POST', '/api/leads/bulk', { leads });
    return response.json();
  },

  updateLead: async (id: string, data: any) => {
    const response = await apiRequest('PUT', `/api/leads/${id}`, data);
    return response.json();
  },

  deleteLead: async (id: string) => {
    await apiRequest('DELETE', `/api/leads/${id}`);
  },

  // Sequences
  getSequences: async () => {
    const response = await apiRequest('GET', '/api/sequences');
    return response.json();
  },

  getSequence: async (id: string) => {
    const response = await apiRequest('GET', `/api/sequences/${id}`);
    return response.json();
  },

  createSequence: async (data: { sequence: any; steps: any[] }) => {
    const response = await apiRequest('POST', '/api/sequences', data);
    return response.json();
  },

  deleteSequence: async (id: string) => {
    await apiRequest('DELETE', `/api/sequences/${id}`);
  },

  // Campaigns
  getCampaigns: async () => {
    const response = await apiRequest('GET', '/api/campaigns');
    return response.json();
  },

  createCampaign: async (data: any) => {
    const response = await apiRequest('POST', '/api/campaigns', data);
    return response.json();
  },

  updateCampaign: async (id: string, data: any) => {
    const response = await apiRequest('PUT', `/api/campaigns/${id}`, data);
    return response.json();
  },

  deleteCampaign: async (id: string) => {
    await apiRequest('DELETE', `/api/campaigns/${id}`);
  },

  // Inbox
  getInboxMessages: async () => {
    const response = await apiRequest('GET', '/api/inbox');
    return response.json();
  },

  markMessageRead: async (id: string) => {
    await apiRequest('PUT', `/api/inbox/${id}/read`);
  },

  // Deliverability
  testDeliverability: async (data: { fromEmail: string; subject: string; body: string }) => {
    const response = await apiRequest('POST', '/api/deliverability/test', data);
    return response.json();
  },

  checkDomainReputation: async (domain: string) => {
    const response = await apiRequest('POST', '/api/deliverability/domain-reputation', { domain });
    return response.json();
  },
};
