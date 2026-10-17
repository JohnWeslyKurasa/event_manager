import { ApiResponse, Event, Registration, AiEventBlueprint, EventAnalytics } from '../types';

const API_BASE = `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('eventpulse_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const handleResponse = async <T>(res: Response): Promise<ApiResponse<T>> => {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { success: false, message: text };
    }
  }
  if (!res.ok) {
    throw new Error(data.message || `HTTP error ${res.status}`);
  }
  // Normalize top-level auth responses if data wrapper wasn't provided
  if (data.token && data.user && !data.data) {
    data.data = { token: data.token, user: data.user };
  } else if (data.user && !data.data) {
    data.data = { user: data.user };
  }
  return data;
};

// ==================== AUTH ====================
export const authApi = {
  register: async (payload: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    organizationName?: string;
  }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: unknown }>(res);
  },

  login: async (payload: { email: string; password: string }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ token: string; user: unknown }>(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<{ user: unknown }>(res);
  },
};

// ==================== EVENTS ====================
export const eventsApi = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    city?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.category) query.set('category', params.category);
    if (params?.status) query.set('status', params.status);
    if (params?.city) query.set('city', params.city);

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    return handleResponse<Event[]>(res);
  },

  getEventById: async (id: string) => {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return handleResponse<Event>(res);
  },

  createEvent: async (payload: unknown) => {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<Event>(res);
  },

  updateEvent: async (id: string, payload: unknown) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<Event>(res);
  },

  publishEvent: async (id: string) => {
    const res = await fetch(`${API_BASE}/events/${id}/publish`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    });
    return handleResponse<Event>(res);
  },

  deleteEvent: async (id: string) => {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<void>(res);
  },

  getOrganizerEvents: async () => {
    const res = await fetch(`${API_BASE}/events/organizer/mine`, {
      headers: { ...getAuthHeaders() },
    });
    const response = await handleResponse<Array<Event & Record<string, any>>>(res);
    if (response.data) {
      response.data = response.data.map((event) => ({
        ...event,
        organizerId: event.organizerId || event.organizer_id,
        bannerImageUrl: event.bannerImageUrl || event.banner_image_url,
        startDate: event.startDate || event.start_date,
        endDate: event.endDate || event.end_date,
        totalCapacity: Number(event.totalCapacity ?? event.total_capacity),
        ticketsSold: Number(event.ticketsSold ?? event.tickets_sold),
        totalRegistrations: Number(event.totalRegistrations ?? event.total_registrations),
        totalRevenue: Number(event.totalRevenue ?? event.total_revenue),
      } as Event));
    }
    return response as ApiResponse<Event[]>;
  },

  getEventAttendees: async (eventId: string) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/attendees`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<Registration[]>(res);
  },

  getEventAnalytics: async (eventId: string) => {
    const res = await fetch(`${API_BASE}/events/${eventId}/analytics`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<EventAnalytics>(res);
  },
};

// ==================== REGISTRATIONS ====================
export const registrationsApi = {
  checkout: async (payload: {
    eventId: string;
    ticketTierId: string;
    attendeeName: string;
    attendeeEmail: string;
  }) => {
    const res = await fetch(`${API_BASE}/registrations/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<Registration>(res);
  },

  getMyTickets: async () => {
    const res = await fetch(`${API_BASE}/registrations/my-tickets`, {
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<Registration[]>(res);
  },

  checkIn: async (payload: { ticketCode: string; eventId: string }) => {
    const res = await fetch(`${API_BASE}/registrations/check-in`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<Registration>(res);
  },

  cancelRegistration: async (registrationId: string) => {
    const res = await fetch(`${API_BASE}/registrations/cancel/${registrationId}`, {
      method: 'PATCH',
      headers: { ...getAuthHeaders() },
    });
    return handleResponse<void>(res);
  },
};

// ==================== AI ====================
export const aiApi = {
  generateEvent: async (payload: { topic: string; category: string; duration?: string }) => {
    const res = await fetch(`${API_BASE}/ai/generate-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<AiEventBlueprint>(res);
  },

  generateMarketingCopy: async (payload: {
    eventId: string;
    copyType: string;
    targetAudience?: string;
    tone?: string;
  }) => {
    const res = await fetch(`${API_BASE}/ai/marketing-copy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ copyType: string; content: string; eventTitle: string }>(res);
  },

  conciergeQuery: async (payload: {
    eventId: string;
    question: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }) => {
    const res = await fetch(`${API_BASE}/ai/concierge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return handleResponse<{ question: string; answer: string; eventTitle: string }>(res);
  },
};
