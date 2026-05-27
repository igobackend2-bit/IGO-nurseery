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
      await fetch('/api/send-email', {
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

  // Push a notification into Supabase so the customer receives it on any device/browser
  async _pushNotification(customerIdentifier: string, title: string, message: string, type: string = 'shipped', targetPage?: string, targetId?: string) {
    try {
      const { supabase } = await import('./supabaseClient');
      let customerId = customerIdentifier;
      // If the identifier looks like an email, resolve to the customer UUID first
      if (customerIdentifier.includes('@')) {
        const { data } = await supabase.from('customers').select('id').eq('email', customerIdentifier).single();
        if (!data?.id) { console.warn('No customer found for email:', customerIdentifier); return; }
        customerId = data.id;
      }
      const { error } = await supabase.from('notifications').insert({
        customer_id: customerId,
        title,
        message,
        type,
        target_page: targetPage || null,
        target_id: targetId || null,
      });
      if (error) console.error('Failed to push notification:', error.message);
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

    if (error) throw new Error(error.message);

    // Upsert customer profile row so it exists for orders/notifications
    if (authData.user) {
      const { error: dbError } = await supabase.from('customers').upsert({
        id: authData.user.id,
        email: data.email,
        name: data.name,
        phone: data.phone
      }, { onConflict: 'id' });
      if (dbError && dbError.code !== '23505') {
        console.error('Customer profile upsert failed:', dbError);
      }
    }

    // When "Confirm email" is OFF in Supabase, a session is returned immediately.
    // Return it so the frontend can log the customer in without an OTP step.
    if (authData.session) {
      localStorage.setItem('igo_customer_token', authData.session.access_token);
      const customer = authData.user ? {
        id: authData.user.id,
        email: authData.user.email || '',
        name: authData.user.user_metadata?.name || data.name || '',
        phone: authData.user.user_metadata?.phone || data.phone || ''
      } : null;
      return { token: authData.session.access_token, customer, requiresVerification: false };
    }

    // "Confirm email" is ON — customer needs to enter the OTP sent to their inbox.
    return { message: 'OTP sent to your email.', requiresVerification: true };
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
      phone: settings.phone,
      email_notifications: settings.emailNotifications
    }).eq('id', user.id).select().single();
    
    if (error) throw new Error(error.message);
    
    return { 
      customer: {
        ...data,
        emailNotifications: data.email_notifications
      }
    };
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
    
    if (data) {
      return { 
        customer: {
          ...data,
          emailNotifications: data.email_notifications !== false
        } 
      };
    }

    const customer = {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.name || '',
      phone: user.user_metadata?.phone || '',
      emailNotifications: true
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
    // The backend server only handles emails — /api/customer/orders doesn't exist.
    // Fetch directly from Supabase using the logged-in customer's session.
    const { supabase } = await import('./supabaseClient');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { orders: [] };

    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getOrders Supabase error:', error.message);
      return { orders: [] };
    }

    const { normalizeOrder } = await import('./api');
    return { orders: (data ?? []).map(normalizeOrder) };
  },

  async getNotifications(email?: string): Promise<{ notifications: Notification[] }> {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { notifications: [] };
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false });
      if (error) { console.error('getNotifications error:', error.message); return { notifications: [] }; }
      return {
        notifications: (data ?? []).map((n: any) => ({
          id: n.id,
          customerId: n.customer_id,
          orderNumber: n.target_id || '',
          title: n.title,
          message: n.message,
          type: n.type,
          isRead: n.is_read,
          createdAt: n.created_at,
          targetPage: n.target_page,
          targetId: n.target_id,
          customerEmail: email,
        }))
      };
    } catch (e) {
      console.error('getNotifications failed:', e);
      return { notifications: [] };
    }
  },

  async markNotificationRead(id: number) {
    try {
      const { supabase } = await import('./supabaseClient');
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id);
      if (error) console.error('markNotificationRead error:', error.message);
    } catch (e) {
      console.error('markNotificationRead failed:', e);
    }
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

  async getLeads() {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      
      return (data || []).map((l: any) => ({
        id: l.id,
        type: l.type,
        customerName: l.customer_name,
        customerEmail: l.customer_email,
        customerPhone: l.customer_phone,
        issue: l.issue,
        reason: l.reason,
        selectedPlan: l.selected_plan,
        status: l.status,
        adminDecision: l.admin_decision,
        chatHistory: l.chat_history || [],
        createdAt: l.created_at,
        auditDate: l.audit_date
      }));
    } catch (e) {
      console.error('getLeads failed:', e);
      return [];
    }
  },

  async updateLead(leadId: string, updates: any) {
    try {
      const { supabase } = await import('./supabaseClient');
      
      const updateData: any = {};
      if (updates.status) updateData.status = updates.status;
      if (updates.adminDecision) updateData.admin_decision = updates.adminDecision;
      
      // We still do the notifications since this affects the real customer
      const { data: leadData } = await supabase.from('leads').select('*').eq('id', leadId).single();
      
      const { error } = await supabase.from('leads').update(updateData).eq('id', leadId);
      if (error) throw new Error(error.message);

      if (leadData && updates.status) {
        const status = updates.status.toUpperCase();
        const decision = updates.adminDecision || 'A decision has been made on your request.';
        
        customerApi._pushNotification(
          leadData.customer_email, 
          `Update on your ${leadData.type} request`, 
          `Your request has been marked as ${status}: ${decision}`,
          status === 'REJECTED' ? 'cancelled' : 'shipped',
          'customer-profile',
          leadId
        );

        // Send email to Cx
        try {
          const { sendLeadUpdateEmail } = await import('./orderEmailService');
          const leadObj = {
            id: leadData.id,
            type: leadData.type,
            customerName: leadData.customer_name,
            customerEmail: leadData.customer_email,
            customerPhone: leadData.customer_phone,
            issue: leadData.issue,
            reason: leadData.reason,
            selectedPlan: leadData.selected_plan,
            status: leadData.status,
            adminDecision: leadData.admin_decision,
            chatHistory: leadData.chat_history || [],
            createdAt: leadData.created_at,
            auditDate: leadData.audit_date
          };
          await sendLeadUpdateEmail(leadObj, status, decision);
        } catch (emailErr) {
          console.error('Failed to send lead update email:', emailErr);
        }
      }
      return { success: true };
    } catch (e) {
      console.error('updateLead failed:', e);
      return { success: false };
    }
  },

  async addMessageToLead(leadId: string, sender: 'admin' | 'customer', message: string) {
    try {
      const { supabase } = await import('./supabaseClient');
      const { data: lead } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (!lead) return { success: false };

      const chatHistory = lead.chat_history || [];
      const newChat = [...chatHistory, { sender, message, timestamp: new Date().toISOString() }];
      
      const updateData: any = { chat_history: newChat };
      if (sender === 'customer') updateData.status = 'new';
      
      const { error } = await supabase.from('leads').update(updateData).eq('id', leadId);
      if (error) throw new Error(error.message);

      if (sender === 'admin') {
        customerApi._pushNotification(
           lead.customer_email, 
           `New message from IGO Admin`, 
           `Re: ${lead.type} request - ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
           'shipped',
           'customer-profile',
           leadId
        );

        // Send email to Cx for the new message
        try {
          const { sendLeadUpdateEmail } = await import('./orderEmailService');
          const leadObj = {
            id: lead.id,
            type: lead.type,
            customerName: lead.customer_name,
            customerEmail: lead.customer_email,
            customerPhone: lead.customer_phone,
            issue: lead.issue,
            reason: lead.reason,
            selectedPlan: lead.selected_plan,
            status: lead.status,
            adminDecision: lead.admin_decision,
            chatHistory: newChat,
            createdAt: lead.created_at,
            auditDate: lead.audit_date
          };
          await sendLeadUpdateEmail(leadObj, lead.status, message);
        } catch (emailErr) {
          console.error('Failed to send lead message email:', emailErr);
        }
      }
      return { success: true };
    } catch (e) {
      console.error('addMessageToLead failed:', e);
      return { success: false };
    }
  },

  async submitLead(leadData: any) {
    try {
      const { supabase } = await import('./supabaseClient');
      const chatHistory = leadData.message ? [{ sender: 'customer', message: leadData.message, timestamp: new Date().toISOString() }] : [];
      
      const { data, error } = await supabase.from('leads').insert({
        type: leadData.type,
        customer_name: leadData.customerName,
        customer_email: leadData.customerEmail,
        customer_phone: leadData.customerPhone,
        issue: leadData.issue,
        reason: leadData.reason,
        selected_plan: leadData.selectedPlan,
        chat_history: chatHistory,
        status: 'new'
      }).select().single();
      
      if (error) throw new Error(error.message);
      
      return { success: true, lead: { ...leadData, id: data.id } };
    } catch (e) {
      console.error('submitLead failed:', e);
      return { success: false, error: e };
    }
  }
};
