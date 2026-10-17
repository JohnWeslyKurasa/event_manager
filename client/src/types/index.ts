// Shared TypeScript types for EventPulse Platform

export type UserRole = 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'COMPLETED';
export type LocationType = 'VENUE_IN_PERSON' | 'VIRTUAL' | 'HYBRID';
export type RegistrationStatus = 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationName?: string;
  createdAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface TicketTier {
  id: string;
  eventId: string;
  name: string;
  price: number;
  capacity: number;
  ticketsSold: number;
  description?: string;
  perks: string[];
  salesStart?: string;
  salesEnd?: string;
  createdAt?: string;
}

export interface Event {
  id: string;
  organizerId: string;
  organizerName?: string;
  organizationName?: string;
  organizerEmail?: string;
  title: string;
  slug: string;
  category: string;
  tagline?: string;
  description: string;
  status: EventStatus;
  locationType: LocationType;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  virtualLink?: string;
  bannerImageUrl?: string;
  startDate: string;
  endDate: string;
  totalCapacity: number;
  ticketsSold: number;
  isFeatured: boolean;
  ticketTiers: TicketTier[];
  totalRegistrations?: number;
  totalRevenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Registration {
  id: string;
  ticketCode: string;
  eventId: string;
  ticketTierId: string;
  userId: string;
  amountPaid: number;
  status: RegistrationStatus;
  attendeeName: string;
  attendeeEmail: string;
  checkedInAt?: string;
  createdAt: string;
  // Joined fields
  tierName?: string;
  tierPrice?: number;
  tierPerks?: string[];
  eventTitle?: string;
  eventSlug?: string;
  bannerImageUrl?: string;
  startDate?: string;
  endDate?: string;
  venueName?: string;
  venueAddress?: string;
  venueCity?: string;
  virtualLink?: string;
  locationType?: LocationType;
  category?: string;
  organizerName?: string;
}

export interface AiAgendaItem {
  time: string;
  sessionTitle: string;
  speakerRole?: string;
  description: string;
}

export interface AiTicketTierSuggestion {
  name: string;
  price: number;
  capacity: number;
  description: string;
  perks: string[];
}

export interface AiEventBlueprint {
  title: string;
  tagline: string;
  description: string;
  suggestedCategories?: string[];
  agendaSchedule: AiAgendaItem[];
  ticketTiers: AiTicketTierSuggestion[];
  faqSection?: Array<{ question: string; answer: string }>;
}

export interface EventAnalytics {
  totalRegistrations: number;
  checkedInCount: number;
  totalRevenue: number;
  tierBreakdown?: Array<{
    tierName: string;
    sold: number;
    capacity: number;
    revenue: number;
  }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const EVENT_CATEGORIES = [
  { value: 'TECHNOLOGY_INNOVATION', label: 'Technology & Innovation' },
  { value: 'BUSINESS_ENTREPRENEURSHIP', label: 'Business & Entrepreneurship' },
  { value: 'ARTS_CULTURE', label: 'Arts & Culture' },
  { value: 'MUSIC_CONCERTS', label: 'Music & Concerts' },
  { value: 'HEALTH_WELLNESS', label: 'Health & Wellness' },
  { value: 'EDUCATION_ACADEMICS', label: 'Education & Academics' },
  { value: 'COMMUNITY_NETWORKING', label: 'Community & Networking' },
] as const;

export type EventCategory = typeof EVENT_CATEGORIES[number]['value'];
