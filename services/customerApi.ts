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
    const { supabase } = await import('./supabaseClient');
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone
        }
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Attempt to insert customer profile directly
    if (authData.user) {
      const { error: dbError } = await supabase.from('customers').insert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        phone: data.phone
      });
      if (dbError && dbError.code !== '23505') { // ignore duplicate key if they re-signup
         console.error('Customer profile insertion failed:', dbError);
      }
    }
    
    return { message: 'Signup initiated. Please check your email for the OTP.' };
  },

  async verifyOtp(data: { email: string; otp: string }) {
    const { supabase } = await import('./supabaseClient');
    const { data: authData, error } = await supabase.auth.verifyOtp({
      email: data.email,
      token: data.otp,
      type: 'signup'
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (authData.session) {
      localStorage.setItem('igo_customer_token', authData.session.access_token);
    }
    const customer = authData.user ? {
      id: authData.user.id,
      email: authData.user.email || '',
      name: authData.user.user_metadata?.name || '',
      phone: authData.user.user_metadata?.phone || ''
    } : null;
    return { token: authData.session?.access_token, customer };
  },

  async login(credentials: any) {
    const { supabase } = await import('./supabaseClient');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data.session) {
      localStorage.setItem('igo_customer_token', data.session.access_token);
    }
    const customer = data.user ? {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || '',
      phone: data.user.user_metadata?.phone || ''
    } : null;
    return { token: data.session?.access_token, customer };
  },

  async getSession() {
    const { supabase } = await import('./supabaseClient');
    const { data } = await supabase.auth.getSession();
    if (data.session && data.session.user) {
      const user = data.session.user;
      return { 
        token: data.session.access_token, 
        customer: {
          id: user.id,
          email: user.email || '',
          name: user.user_metadata?.name || '',
          phone: user.user_metadata?.phone || ''
        } 
      };
    }
    return null;
  },

  async updateSettings(settings: { name: string; phone: string; emailNotifications: boolean }) {
    const { supabase } = await import('./supabaseClient');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');
    
    // Update auth metadata
    await supabase.auth.updateUser({
      data: { name: settings.name, phone: settings.phone }
    });
    
    // Update customers table
    const { data, error } = await supabase.from('customers').update({
      name: settings.name,
      phone: settings.phone
    }).eq('id', user.id).select().single();
    
    if (error) throw new Error(error.message);
    return { customer: data };
  },

  async changePassword(data: any): Promise<{ success: boolean }> {
    const { supabase } = await import('./supabaseClient');
    const { error } = await supabase.auth.updateUser({
      password: data.newPassword
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { supabase } = await import('./supabaseClient');
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return { message: 'Password reset email sent' };
  },

  async resetPassword(data: any): Promise<{ success: boolean }> {
    const { supabase } = await import('./supabaseClient');
    const { error } = await supabase.auth.updateUser({
      password: data.password
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async logout() {
    const { supabase } = await import('./supabaseClient');
    await supabase.auth.signOut();
    localStorage.removeItem('igo_customer_token');
  },

  async getProfile() {
    const { supabase } = await import('./supabaseClient');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { customer: null };
    
    const { data } = await supabase.from('customers').select('*').eq('id', user.id).single();
    const customer = data || {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || ''
    };
    return { customer };
  },

  async updateProfile(data: any) {
    const { supabase } = await import('./supabaseClient');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not logged in');
    
    await supabase.auth.updateUser({ data: { name: data.name, phone: data.phone } });
    
    const { data: dbData, error } = await supabase.from('customers')
      .update(data)
      .eq('id', user.id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return { customer: dbData };
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
