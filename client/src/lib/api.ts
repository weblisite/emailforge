import { useAuth } from '@clerk/nextjs';

// Base API URL
const API_BASE_URL = 'http://localhost:5000';

// Helper function to get auth token
async function getAuthToken(): Promise<string | null> {
  try {
    // Get the token from Clerk
    const token = await window.Clerk?.session?.getToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getAuthToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}

// API functions
export const api = {
  // Email Accounts
  createEmailAccount: (data: any) => 
    apiRequest('/api/email-accounts', { method: 'POST', body: JSON.stringify(data) }),
  
  getEmailAccounts: () => 
    apiRequest('/api/email-accounts'),
  
  updateEmailAccount: (id: string, data: any) => 
    apiRequest(`/api/email-accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteEmailAccount: (id: string) => 
    apiRequest(`/api/email-accounts/${id}`, { method: 'DELETE' }),
  
  testEmailAccount: (id: string) => 
    apiRequest(`/api/email-accounts/${id}/test`, { method: 'POST' }),

  // Leads
  createLead: (data: any) => 
    apiRequest('/api/leads', { method: 'POST', body: JSON.stringify(data) }),
  
  createLeadsBulk: (data: any[]) => 
    apiRequest('/api/leads/bulk', { method: 'POST', body: JSON.stringify(data) }),
  
  getLeads: () => 
    apiRequest('/api/leads'),
  
  updateLead: (id: string, data: any) => 
    apiRequest(`/api/leads/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteLead: (id: string) => 
    apiRequest(`/api/leads/${id}`, { method: 'DELETE' }),

  // Sequences
  createSequence: (data: any) => 
    apiRequest('/api/sequences', { method: 'POST', body: JSON.stringify(data) }),
  
  getSequences: () => 
    apiRequest('/api/sequences'),
  
  getSequenceWithSteps: (id: string) => 
    apiRequest(`/api/sequences/${id}`),
  
  updateSequence: (id: string, data: any) => 
    apiRequest(`/api/sequences/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteSequence: (id: string) => 
    apiRequest(`/api/sequences/${id}`, { method: 'DELETE' }),
  
  // Sequence Steps
  createSequenceStep: (data: any) => 
    apiRequest('/api/sequence-steps', { method: 'POST', body: JSON.stringify(data) }),
  
  updateSequenceStep: (id: string, data: any) => 
    apiRequest(`/api/sequence-steps/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteSequenceStep: (id: string) => 
    apiRequest(`/api/sequence-steps/${id}`, { method: 'DELETE' }),

  // Campaigns
  createCampaign: (data: any) => 
    apiRequest('/api/campaigns', { method: 'POST', body: JSON.stringify(data) }),
  
  getCampaigns: () => 
    apiRequest('/api/campaigns'),
  
  getCampaign: (id: string) => 
    apiRequest(`/api/campaigns/${id}`),
  
  updateCampaign: (id: string, data: any) => 
    apiRequest(`/api/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteCampaign: (id: string) => 
    apiRequest(`/api/campaigns/${id}`, { method: 'DELETE' }),
  
  // Campaign Emails
  getCampaignEmails: (campaignId: string) => 
    apiRequest(`/api/campaigns/${campaignId}/emails`),
  
  createCampaignEmail: (data: any) => 
    apiRequest('/api/campaign-emails', { method: 'POST', body: JSON.stringify(data) }),
  
  updateCampaignEmail: (id: string, data: any) => 
    apiRequest(`/api/campaign-emails/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  
  deleteCampaignEmail: (id: string) => 
    apiRequest(`/api/campaign-emails/${id}`, { method: 'DELETE' }),

  // Dashboard
  getDashboardMetrics: () => 
    apiRequest('/api/dashboard/metrics'),

  // Inbox
  getInbox: () => 
    apiRequest('/api/inbox'),
  
  createInboxMessage: (data: any) => 
    apiRequest('/api/inbox', { method: 'POST', body: JSON.stringify(data) }),
  
  markMessageRead: (id: string) => 
    apiRequest(`/api/inbox/${id}/read`, { method: 'PUT' }),
  
  deleteInboxMessage: (id: string) => 
    apiRequest(`/api/inbox/${id}`, { method: 'DELETE' }),

  // Deliverability
  testDeliverability: (emailContent: string, fromEmail: string) => 
    apiRequest('/api/deliverability/test', { 
      method: 'POST', 
      body: JSON.stringify({ emailContent, fromEmail }) 
    }),
  
  checkDomainReputation: (domain: string) => 
    apiRequest('/api/deliverability/domain-reputation', { 
      method: 'POST', 
      body: JSON.stringify({ domain }) 
    }),

  // Profile
  updateProfile: (data: { name: string; email: string }) => 
    apiRequest('/api/auth/profile', { 
      method: 'PUT', 
      body: JSON.stringify(data) 
    }),
  
  // Bulk Operations
  deleteLeadsBulk: (ids: string[]) => 
    apiRequest('/api/leads/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
  
  deleteEmailAccountsBulk: (ids: string[]) => 
    apiRequest('/api/email-accounts/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
  
  deleteSequencesBulk: (ids: string[]) => 
    apiRequest('/api/sequences/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
  
  deleteCampaignsBulk: (ids: string[]) => 
    apiRequest('/api/campaigns/bulk', { method: 'DELETE', body: JSON.stringify({ ids }) }),
  
  // Search & Filtering
  searchLeads: (query: string) => 
    apiRequest(`/api/leads/search?q=${encodeURIComponent(query)}`),
  
  searchInbox: (query: string) => 
    apiRequest(`/api/inbox/search?q=${encodeURIComponent(query)}`),
  
  filterCampaigns: (filters: any) => 
    apiRequest('/api/campaigns/filter', { method: 'POST', body: JSON.stringify(filters) }),
  
  // Email Sending
  sendEmail: (data: any) => 
    apiRequest('/api/email/send', { method: 'POST', body: JSON.stringify(data) }),
  
  sendBulkEmails: (data: any) => 
    apiRequest('/api/email/bulk-send', { method: 'POST', body: JSON.stringify(data) }),
  
  scheduleEmail: (data: any) => 
    apiRequest('/api/email/schedule', { method: 'POST', body: JSON.stringify(data) }),
  
  // Analytics & Reporting
  getCampaignAnalytics: (campaignId: string) => 
    apiRequest(`/api/analytics/campaigns/${campaignId}`),
  
  getLeadAnalytics: (leadId: string) => 
    apiRequest(`/api/analytics/leads/${leadId}`),
  
  getEmailAccountAnalytics: (accountId: string) => 
    apiRequest(`/api/analytics/email-accounts/${accountId}`),
  
  exportData: (type: string, filters?: any) => 
    apiRequest('/api/export', { method: 'POST', body: JSON.stringify({ type, filters }) }),
  
  // Notifications & Webhooks
  getNotifications: () => 
    apiRequest('/api/notifications'),
  
  markNotificationRead: (id: string) => 
    apiRequest(`/api/notifications/${id}/read`, { method: 'PUT' }),
  
  createWebhook: (data: any) => 
    apiRequest('/api/webhooks', { method: 'POST', body: JSON.stringify(data) }),
};
