import { Customer, Order, Notification } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('igo_customer_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const customerApi = {
  // Helper to add a notification to local storage (simulated backend)
  async _dispatchEmail(to: string, subject: string, body: string, leadId?: string) {
    try {
      // Extraordinary AI-Enhanced Concierge Script Template
      const interactionLink = `${window.location.origin}/account/profile?tab=inbox`;
      const professionalBody = [
        '------------------------------------------------------------',
        '🌿 [IGO NURSERY CONCIERGE] DIGITAL OFFICIAL TRANSMISSION',
        `REFERENCE: IGO-AERO-${leadId || 'GENERAL'}-${Date.now().toString().slice(-4)}`,
        '------------------------------------------------------------',
        '',
        'Dear Valued IGO Member,',
        '',
        'I hope this message finds you well. Our specialized agronomist and administrative team have carefully reviewed your latest inquiry.',
        '',
        '--- [OFFICIAL UPDATE] ---',
        body,
        '-------------------------',
        '',
        '**IMPORTANT: If you wish to reply, please use the secure link below to notify our administration directly. This ensures our team can resolve your inquiry with priority and maintain your project records.**',
        '',
        `📍 SECURE RESPONSE PORTAL: ${interactionLink}`,
        '',
        'Your success in building a sustainable green future is our highest priority. We thank you for choosing IGO Nursery Agritech Farms.',
        '',
        'Best Regards,',
        '',
        'Digital Liaison Office',
        'IGO Nursery Agritech Farms | Regional Hub',
        'Sustainability through Advanced Technology',
        'https://igonursery.local',
        '',
        '------------------------------------------------------------',
        'This is an encrypted administrative transmission. Reply-to-email is not monitored.',
      ].join('\n');

      // 1. Log in the internal MailHub (Simulation)
      const emails = JSON.parse(localStorage.getItem('igo_simulated_emails') || '[]');
      const newEmail = {
        id: Date.now(),
        from: 'IGO Nursery Admin <noreply@igonursery.local>',
        to,
        subject: `[IGO Update] ${subject}`,
        body: professionalBody,
        leadId, // Track which lead this is for
        timestamp: new Date().toISOString(),
        status: 'delivered',
        isRead: false
      };
      localStorage.setItem('igo_simulated_emails', JSON.stringify([newEmail, ...emails]));
      window.dispatchEvent(new StorageEvent('storage', { key: 'igo_simulated_emails' }));

      // Trigger REAL SMTP Email via Backend
      await fetch('/api/emails/order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject: `[IGO Update] ${subject}`,
          text: professionalBody
        }),
      }).then(r => {
        if (r.ok) console.log(`✅ Real email sent to ${to}`);
      }).catch(err => console.error('Real-world email dispatch failed:', err));

    } catch (e) {
      console.error('Failed to dispatch email (Log Error):', e);
    }
  },

  // Helper to add a notification to local storage (simulated backend)
  _pushNotification(customerEmail: string, title: string, message: string, type: string = 'shipped', targetPage?: string, targetId?: string) {
    try {
      const existing = JSON.parse(localStorage.getItem('igo_notifications') || '[]');
      const newNotif = {
        id: Date.now(),
        title,
        message,
        type,
        targetPage,
        targetId,
        createdAt: new Date().toISOString(),
        isRead: false,
        customerEmail // To filter by customer
      };
      localStorage.setItem('igo_notifications', JSON.stringify([newNotif, ...existing]));
      // Dispatch event so other components (like SiteHeader) can update
      window.dispatchEvent(new StorageEvent('storage', { key: 'igo_notifications' }));
    } catch (e) {
      console.error('Failed to push notification:', e);
    }
  },

  async signup(data: any) {
    const res = await fetch(`${API_BASE}/customer/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let message = 'Signup failed';
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch (e) {
        // Handle non-JSON errors (e.g. 404, 405, 500)
        message = `Server error ${res.status}: ${res.statusText || 'Unexpected response'}`;
      }
      throw new Error(message);
    }
    return res.json();
  },

  async verifyOtp(data: { email: string; otp: string }) {
    const res = await fetch(`${API_BASE}/customer/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      let message = 'Verification failed';
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch (e) {
        message = `Server error ${res.status}: ${res.statusText || 'Unexpected response'}`;
      }
      throw new Error(message);
    }
    const result = await res.json();
    if (result.token) {
      localStorage.setItem('igo_customer_token', result.token);
    }
    return result;
  },

  async login(credentials: any) {
    const res = await fetch(`${API_BASE}/customer/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) {
      let message = 'Login failed';
      try {
        const errorData = await res.json();
        message = errorData.message || message;
      } catch (e) {
        message = `Server error ${res.status}: ${res.statusText || 'Unexpected response'}`;
      }
      throw new Error(message);
    }
    const data = await res.json();
    if (data.token) {
      localStorage.setItem('igo_customer_token', data.token);
    }
    return data;
  },

  async getSession() {
    const res = await fetch(`${API_BASE}/customer/session`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  },

  async updateSettings(settings: { name: string; phone: string; emailNotifications: boolean }): Promise<{ customer: Customer }> {
    const res = await fetch(`${API_BASE}/customer/settings`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(settings),
    });
    if (!res.ok) throw new Error('Settings update failed');
    return res.json();
  },

  async changePassword(data: any): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/customer/password`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Password update failed');
    }
    return res.json();
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/customer/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return res.json();
  },

  async resetPassword(data: any): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/customer/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Password reset failed');
    }
    return res.json();
  },

  async logout() {
    await fetch(`${API_BASE}/customer/logout`, {
      method: 'POST',
      headers: getHeaders(),
    });
    localStorage.removeItem('igo_customer_token');
  },

  async getProfile() {
    const res = await fetch(`${API_BASE}/customer/profile`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async updateProfile(data: any) {
    const res = await fetch(`${API_BASE}/customer/profile`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async getOrders(): Promise<{ orders: Order[] }> {
    const res = await fetch(`${API_BASE}/customer/orders`, {
      headers: getHeaders(),
    });
    return res.json();
  },

  async getNotifications(email?: string): Promise<{ notifications: Notification[] }> {
    const userEmail = email;
    
    let allFetched: Notification[] = [];

    // 1. Try to fetch from Real API
    try {
      const res = await fetch(`${API_BASE}/customer/notifications`, {
        headers: getHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        allFetched = data.notifications || [];
      }
    } catch (e) {
      console.warn('Real API notifications fetch failed, using fallback.');
    }

    // 2. Merge with Simulated Storage
    try {
      const localNotifs = JSON.parse(localStorage.getItem('igo_notifications') || '[]');
      const filteredLocal = userEmail ? localNotifs.filter((n: any) => n.customerEmail === userEmail) : [];
      
      // Merge unique by ID (preferring API data if IDs overlap, though they shouldn't)
      const merged = [...allFetched];
      filteredLocal.forEach((ln: any) => {
        if (!merged.find(mn => mn.id === ln.id)) {
          merged.push(ln);
        }
      });

      // Sort by date descending
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      return { notifications: merged };
    } catch (e) {
      return { notifications: allFetched };
    }
  },

  async markNotificationRead(id: number) {
    // Update local storage
    const allNotifs = JSON.parse(localStorage.getItem('igo_notifications') || '[]');
    const updated = allNotifs.map((n: any) => n.id === id ? { ...n, isRead: true } : n);
    localStorage.setItem('igo_notifications', JSON.stringify(updated));
    // Dispatch event so other components (like SiteHeader) can update instantly
    window.dispatchEvent(new StorageEvent('storage', { key: 'igo_notifications' }));

    // Also call API
    await fetch(`${API_BASE}/customer/notifications/${id}/read`, {
      method: 'POST',
      headers: getHeaders(),
    });
  },

  async requestDeletion(customer: Customer, reason: string) {
    const leadData = {
      type: 'deletion-request',
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      issue: `Account Deletion Request`,
      reason: reason,
      status: 'new'
    };
    return customerApi.submitLead(leadData);
  },

  async updateLead(leadId: string, updates: any) {
    const existingLeads = JSON.parse(localStorage.getItem('igo_leads') || '[]');
    const updatedLeads = existingLeads.map((l: any) => {
      if (l.id === leadId) {
        // Status Update Notifications
        if (updates.status) {
          const status = updates.status.toUpperCase();
          const decision = updates.adminDecision || 'A decision has been made on your request.';
          
          // 1. Send Simulated Email
          console.log(`%c[SIMULATED EMAIL] To: ${l.customerEmail} Subject: Your ${l.type} request status updated to ${status}`, 'color: blue; font-weight: bold;');
          customerApi._dispatchEmail(
             l.customerEmail, 
             `Update on your ${l.type} request`, 
             `Your request has been marked as ${status}. Decision: ${decision}`,
             leadId
          );
          
          // 2. Notify in Website Inbox
          customerApi._pushNotification(
            l.customerEmail, 
            `Update on your ${l.type} request`, 
            `Your request has been marked as ${status}: ${decision}`,
            status === 'REJECTED' ? 'cancelled' : 'shipped',
            'customer-profile',
            l.id // targetId for deep-linking
          );
        }
        return { ...l, ...updates };
      }
      return l;
    });
    localStorage.setItem('igo_leads', JSON.stringify(updatedLeads));
    return { success: true };
  },

  async addMessageToLead(leadId: string, sender: 'admin' | 'customer', message: string) {
    const existingLeads = JSON.parse(localStorage.getItem('igo_leads') || '[]');
    const updatedLeads = existingLeads.map((l: any) => {
      if (l.id === leadId) {
        const chatHistory = l.chatHistory || [];
        
        if (sender === 'admin') {
          // 1. Send Simulated Email
          console.log(`%c[SIMULATED EMAIL] From: IGO Admin To: ${l.customerEmail} Message: ${message}`, 'color: #10B981; font-weight: bold;');
          customerApi._dispatchEmail(
            l.customerEmail,
            `New message from IGO Admin (Ref: ${l.id})`,
            message,
            leadId
          );
          
          // 2. Notify in Website Inbox
          customerApi._pushNotification(
             l.customerEmail, 
             `New message from IGO Admin`, 
             `Re: ${l.type} request - ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
             'shipped',
             'customer-profile',
             l.id // targetId for deep-linking
          );
        } else {
          console.log(`[SIMULATED EMAIL RECEIVED] From: ${l.customerEmail} To: IGO Admin Message: ${message}`);
        }
        
        return { 
          ...l, 
          chatHistory: [...chatHistory, { sender, message, timestamp: new Date().toISOString() }],
          status: sender === 'customer' ? 'new' : l.status 
        };
      }
      return l;
    });
    localStorage.setItem('igo_leads', JSON.stringify(updatedLeads));
    return { success: true };
  },

  async submitLead(leadData: any) {
    let existingLeads = [];
    try {
      existingLeads = JSON.parse(localStorage.getItem('igo_leads') || '[]');
    } catch (e) {
      existingLeads = [];
    }
    const newLead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'new',
      createdAt: new Date().toISOString(),
      chatHistory: leadData.message ? [{ sender: 'customer', message: leadData.message, timestamp: new Date().toISOString() }] : []
    };
    localStorage.setItem('igo_leads', JSON.stringify([newLead, ...existingLeads]));
    window.dispatchEvent(new StorageEvent('storage', { key: 'igo_leads' }));
    return { success: true, lead: newLead };
  }
};
