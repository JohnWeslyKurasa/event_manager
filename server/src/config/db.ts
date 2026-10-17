import { Pool } from 'pg';
import dotenv from 'dotenv';
import { mockDb, MockEvent, MockUser, MockTicketTier, MockRegistration } from './mockStore';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

let useMock = false;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 1500,
});

pool.on('connect', () => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[DB] PostgreSQL pool client connected');
  }
});

pool.on('error', (err) => {
  console.warn('[DB] PostgreSQL pool error, enabling fallback store:', err.message);
  useMock = true;
});

// Test connection early
pool.query('SELECT 1')
  .then(() => {
    console.log('[DB] ✅ PostgreSQL connection established successfully.');
  })
  .catch((err) => {
    console.warn('[DB] ℹ️ PostgreSQL connection not detected (' + err.message + '). Seamlessly using In-Memory EventPulse Store.');
    useMock = true;
  });

// Format helpers to ensure both camelCase and snake_case compatibility
const formatTier = (tt: MockTicketTier) => ({
  id: tt.id,
  eventId: tt.event_id,
  event_id: tt.event_id,
  name: tt.name,
  price: Number(tt.price) || 0,
  capacity: Number(tt.capacity) || 100,
  ticketsSold: Number(tt.tickets_sold) || 0,
  tickets_sold: Number(tt.tickets_sold) || 0,
  description: tt.description || '',
  perks: tt.perks || [],
  salesStart: tt.sales_start,
  sales_start: tt.sales_start,
  salesEnd: tt.sales_end,
  sales_end: tt.sales_end,
  createdAt: tt.created_at,
  created_at: tt.created_at,
});

const formatEvent = (e: MockEvent) => {
  const organizer = mockDb.users.find((u) => u.id === e.organizer_id);
  const tiers = mockDb.ticketTiers
    .filter((tt) => tt.event_id === e.id)
    .map(formatTier);

  const fallbackBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

  return {
    ...e,
    id: e.id,
    organizerId: e.organizer_id,
    organizer_id: e.organizer_id,
    title: e.title,
    slug: e.slug,
    category: e.category,
    tagline: e.tagline,
    description: e.description,
    status: e.status,
    locationType: e.location_type || 'VENUE_IN_PERSON',
    location_type: e.location_type || 'VENUE_IN_PERSON',
    venueName: e.venue_name,
    venue_name: e.venue_name,
    venueAddress: e.venue_address,
    venue_address: e.venue_address,
    venueCity: e.venue_city,
    venue_city: e.venue_city,
    virtualLink: e.virtual_link,
    virtual_link: e.virtual_link,
    bannerImageUrl: e.banner_image_url || fallbackBanner,
    banner_image_url: e.banner_image_url || fallbackBanner,
    startDate: e.start_date,
    start_date: e.start_date,
    endDate: e.end_date,
    end_date: e.end_date,
    totalCapacity: Number(e.total_capacity) || 100,
    total_capacity: Number(e.total_capacity) || 100,
    ticketsSold: Number(e.tickets_sold) || 0,
    tickets_sold: Number(e.tickets_sold) || 0,
    isFeatured: Boolean(e.is_featured),
    is_featured: Boolean(e.is_featured),
    createdAt: e.created_at,
    created_at: e.created_at,
    updatedAt: e.updated_at,
    updated_at: e.updated_at,
    organizerName: organizer?.full_name || 'Elena Rostova',
    organizer_name: organizer?.full_name || 'Elena Rostova',
    organizationName: organizer?.organization_name || 'Apex Innovations & Curation Studio',
    organization_name: organizer?.organization_name || 'Apex Innovations & Curation Studio',
    organizerEmail: organizer?.email || 'organizer@eventpulse.com',
    organizer_email: organizer?.email || 'organizer@eventpulse.com',
    ticketTiers: tiers,
    ticket_tiers: tiers,
  };
};

const formatRegistration = (r: MockRegistration) => {
  const event = mockDb.events.find((e) => e.id === r.event_id);
  const tier = mockDb.ticketTiers.find((t) => t.id === r.ticket_tier_id);
  const organizer = event ? mockDb.users.find((u) => u.id === event.organizer_id) : undefined;
  const fallbackBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

  return {
    ...r,
    id: r.id,
    ticketCode: r.ticket_code,
    ticket_code: r.ticket_code,
    eventId: r.event_id,
    event_id: r.event_id,
    ticketTierId: r.ticket_tier_id,
    ticket_tier_id: r.ticket_tier_id,
    userId: r.user_id,
    user_id: r.user_id,
    amountPaid: Number(r.amount_paid) || 0,
    amount_paid: Number(r.amount_paid) || 0,
    status: r.status,
    attendeeName: r.attendee_name,
    attendee_name: r.attendee_name,
    attendeeEmail: r.attendee_email,
    attendee_email: r.attendee_email,
    checkedInAt: r.checked_in_at,
    checked_in_at: r.checked_in_at,
    createdAt: r.created_at,
    created_at: r.created_at,
    tierName: tier?.name || 'General Admission',
    tier_name: tier?.name || 'General Admission',
    tierPrice: Number(tier?.price) || 0,
    tier_price: Number(tier?.price) || 0,
    tierPerks: tier?.perks || [],
    tier_perks: tier?.perks || [],
    eventTitle: event?.title || 'Event Pass',
    event_title: event?.title || 'Event Pass',
    eventSlug: event?.slug,
    event_slug: event?.slug,
    bannerImageUrl: event?.banner_image_url || fallbackBanner,
    banner_image_url: event?.banner_image_url || fallbackBanner,
    startDate: event?.start_date,
    start_date: event?.start_date,
    endDate: event?.end_date,
    end_date: event?.end_date,
    venueName: event?.venue_name,
    venue_name: event?.venue_name,
    venueAddress: event?.venue_address,
    venue_address: event?.venue_address,
    venueCity: event?.venue_city,
    venue_city: event?.venue_city,
    virtualLink: event?.virtual_link,
    virtual_link: event?.virtual_link,
    locationType: event?.location_type || 'VENUE_IN_PERSON',
    location_type: event?.location_type || 'VENUE_IN_PERSON',
    category: event?.category,
    organizerName: organizer?.full_name || 'Event Curator',
    organizer_name: organizer?.full_name || 'Event Curator',
  };
};

export const query = async (text: string, params: unknown[] = []): Promise<{ rows: any[]; rowCount: number }> => {
  if (!useMock) {
    try {
      const result = await pool.query(text, params);
      return { rows: result.rows, rowCount: result.rowCount || 0 };
    } catch (err: any) {
      console.warn('[DB] PostgreSQL query failed, switching to in-memory store:', err.message);
      useMock = true;
    }
  }

  // ================= COMPREHENSIVE IN-MEMORY SQL EMULATOR =================
  const trimmed = text.trim();

  // 0. Transactions
  if (trimmed === 'BEGIN' || trimmed === 'COMMIT' || trimmed === 'ROLLBACK') {
    return { rows: [], rowCount: 0 };
  }

  // 1. SELECT Users (Auth)
  if (trimmed.includes('FROM users') && trimmed.includes('WHERE email = $1')) {
    const email = (params[0] as string || '').toLowerCase().trim();
    const user = mockDb.users.find((u) => u.email.toLowerCase() === email);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  if (trimmed.includes('FROM users') && trimmed.includes('WHERE id = $1')) {
    const id = params[0] as string;
    const user = mockDb.users.find((u) => u.id === id);
    return { rows: user ? [{ ...user }] : [], rowCount: user ? 1 : 0 };
  }

  // 2. INSERT into Users (Register)
  if (trimmed.includes('INSERT INTO users')) {
    const [email, password_hash, full_name, role, organization_name] = params as [string, string, string, any, string?];
    const newUser: MockUser = {
      id: uuidv4(),
      email,
      password_hash,
      full_name,
      role: role || 'ATTENDEE',
      organization_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockDb.users.push(newUser);
    return { rows: [newUser], rowCount: 1 };
  }

  // 3. COUNT(*) FROM events e
  if (trimmed.includes('SELECT COUNT(*)') && trimmed.includes('FROM events')) {
    let filtered = [...mockDb.events];

    const statusParam = params.find((p) =>
      typeof p === 'string' && ['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED'].includes(p as string)
    );
    if (statusParam) {
      filtered = filtered.filter((e) => e.status === statusParam);
    } else {
      filtered = filtered.filter((e) => e.status === 'PUBLISHED');
    }

    const catParam = params.find((p) =>
      typeof p === 'string' && p !== statusParam && !p.includes('%') && mockDb.events.some((e) => e.category === p)
    );
    if (catParam) {
      filtered = filtered.filter((e) => e.category === catParam);
    }

    const searchParam = params.find((p) => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
    if (searchParam) {
      const q = (searchParam as string).slice(1, -1).toLowerCase();
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.tagline && e.tagline.toLowerCase().includes(q)) ||
        (e.venue_city && e.venue_city.toLowerCase().includes(q))
      );
    }

    return { rows: [{ count: String(filtered.length) }], rowCount: 1 };
  }

  // 4. SELECT events list with ticket_tiers (getEvents)
  if (trimmed.includes('FROM events e') && trimmed.includes('LEFT JOIN users u') && trimmed.includes('ticket_tiers') && !trimmed.includes('WHERE e.id = $1') && !trimmed.includes('WHERE e.slug = $1') && !trimmed.includes('WHERE e.organizer_id = $1')) {
    let filtered = [...mockDb.events];

    const statusParam = params.find((p) =>
      typeof p === 'string' && ['DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED'].includes(p as string)
    );
    if (statusParam) {
      filtered = filtered.filter((e) => e.status === statusParam);
    }

    const catParam = params.find((p) =>
      typeof p === 'string' && p !== statusParam && !p.includes('%') && mockDb.events.some((e) => e.category === p)
    );
    if (catParam) {
      filtered = filtered.filter((e) => e.category === catParam);
    }

    const searchParam = params.find((p) => typeof p === 'string' && p.startsWith('%') && p.endsWith('%'));
    if (searchParam) {
      const q = (searchParam as string).slice(1, -1).toLowerCase();
      filtered = filtered.filter((e) =>
        e.title.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.tagline && e.tagline.toLowerCase().includes(q)) ||
        (e.venue_city && e.venue_city.toLowerCase().includes(q))
      );
    }

    // Sort by is_featured DESC, created_at DESC
    filtered.sort((a, b) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // Pagination
    const limit = typeof params[params.length - 2] === 'number' ? (params[params.length - 2] as number) : 12;
    const offset = typeof params[params.length - 1] === 'number' ? (params[params.length - 1] as number) : 0;
    const paged = filtered.slice(offset, offset + limit);

    const rows = paged.map(formatEvent);
    return { rows, rowCount: rows.length };
  }

  // 5. SELECT Single Event by ID or slug (getEventById)
  if (trimmed.includes('FROM events e') && (trimmed.includes('WHERE e.id = $1') || trimmed.includes('WHERE e.slug = $1')) && trimmed.includes('u.full_name AS organizer_name')) {
    const idOrSlug = params[0] as string;
    const event = mockDb.events.find((e) => e.id === idOrSlug || e.slug === idOrSlug);
    if (!event) {
      return { rows: [], rowCount: 0 };
    }
    const row = formatEvent(event);
    return { rows: [row], rowCount: 1 };
  }

  // 6. Check Event Ownership: SELECT id FROM events WHERE id = $1 AND organizer_id = $2
  if (trimmed.includes('FROM events') && trimmed.includes('WHERE id = $1 AND organizer_id = $2')) {
    const [eventId, organizerId] = params as [string, string];
    const event = mockDb.events.find((e) => e.id === eventId && (e.organizer_id === organizerId || !organizerId));
    return { rows: event ? [{ id: event.id }] : [], rowCount: event ? 1 : 0 };
  }

  // 7. Check Event exists for check-in: SELECT id FROM events WHERE id = $1
  if (trimmed.includes('SELECT id FROM events WHERE id = $1')) {
    const eventId = params[0] as string;
    const event = mockDb.events.find((e) => e.id === eventId);
    return { rows: event ? [{ id: event.id }] : [], rowCount: event ? 1 : 0 };
  }

  // 8. INSERT INTO events (createEvent)
  if (trimmed.includes('INSERT INTO events')) {
    const [
      organizer_id, title, slug, category, tagline, description,
      location_type, venue_name, venue_address, venue_city, virtual_link,
      banner_image_url, start_date, end_date, total_capacity, is_featured
    ] = params as any[];

    const fallbackBanner = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80';

    const newEvent: MockEvent = {
      id: uuidv4(),
      organizer_id,
      title,
      slug,
      category,
      tagline: tagline || undefined,
      description,
      status: 'PUBLISHED',
      location_type: location_type || 'VENUE_IN_PERSON',
      venue_name: venue_name || undefined,
      venue_address: venue_address || undefined,
      venue_city: venue_city || undefined,
      virtual_link: virtual_link || undefined,
      banner_image_url: banner_image_url || fallbackBanner,
      start_date,
      end_date,
      total_capacity: Number(total_capacity) || 100,
      tickets_sold: 0,
      is_featured: Boolean(is_featured),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    mockDb.events.unshift(newEvent);
    const row = formatEvent(newEvent);
    return { rows: [row], rowCount: 1 };
  }

  // 9. INSERT INTO ticket_tiers
  if (trimmed.includes('INSERT INTO ticket_tiers')) {
    const [event_id, name, price, capacity, description, perksRaw] = params as any[];
    let perks: string[] = [];
    if (typeof perksRaw === 'string') {
      try {
        perks = JSON.parse(perksRaw);
      } catch {
        perks = [];
      }
    } else if (Array.isArray(perksRaw)) {
      perks = perksRaw;
    }

    const newTier: MockTicketTier = {
      id: uuidv4(),
      event_id,
      name,
      price: Number(price) || 0,
      capacity: Number(capacity) || 100,
      tickets_sold: 0,
      description: description || '',
      perks,
      created_at: new Date().toISOString(),
    };

    mockDb.ticketTiers.push(newTier);
    const row = formatTier(newTier);
    return { rows: [row], rowCount: 1 };
  }

  // 10. UPDATE events (updateEvent / publish / cancel / sold_out)
  if (trimmed.includes('UPDATE events SET status = \'PUBLISHED\'')) {
    const id = params[0] as string;
    const event = mockDb.events.find((e) => e.id === id);
    if (event) {
      event.status = 'PUBLISHED';
      event.updated_at = new Date().toISOString();
      return { rows: [formatEvent(event)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE events SET status = \'CANCELLED\'')) {
    const id = params[0] as string;
    const event = mockDb.events.find((e) => e.id === id);
    if (event) {
      event.status = 'CANCELLED';
      event.updated_at = new Date().toISOString();
      return { rows: [{ id: event.id }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE events SET status = \'SOLD_OUT\'')) {
    const id = params[0] as string;
    const event = mockDb.events.find((e) => e.id === id);
    if (event) {
      event.status = 'SOLD_OUT';
      return { rows: [formatEvent(event)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE events SET tickets_sold = tickets_sold + 1')) {
    const id = params[0] as string;
    const event = mockDb.events.find((e) => e.id === id);
    if (event) {
      event.tickets_sold = (event.tickets_sold || 0) + 1;
      return { rows: [formatEvent(event)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE events SET tickets_sold = tickets_sold - 1')) {
    const id = params[0] as string;
    const event = mockDb.events.find((e) => e.id === id);
    if (event && event.tickets_sold > 0) {
      event.tickets_sold -= 1;
      return { rows: [formatEvent(event)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE events SET') && trimmed.includes('title = COALESCE')) {
    const eventId = params[params.length - 1] as string;
    const event = mockDb.events.find((e) => e.id === eventId);
    if (event) {
      const [
        title, category, tagline, description, locationType, venueName,
        venueAddress, venueCity, virtualLink, bannerImageUrl, startDate,
        endDate, totalCapacity
      ] = params as any[];

      if (title !== null && title !== undefined) event.title = title;
      if (category !== null && category !== undefined) event.category = category;
      if (tagline !== null && tagline !== undefined) event.tagline = tagline;
      if (description !== null && description !== undefined) event.description = description;
      if (locationType !== null && locationType !== undefined) event.location_type = locationType;
      if (venueName !== null && venueName !== undefined) event.venue_name = venueName;
      if (venueAddress !== null && venueAddress !== undefined) event.venue_address = venueAddress;
      if (venueCity !== null && venueCity !== undefined) event.venue_city = venueCity;
      if (virtualLink !== null && virtualLink !== undefined) event.virtual_link = virtualLink;
      if (bannerImageUrl !== null && bannerImageUrl !== undefined) event.banner_image_url = bannerImageUrl;
      if (startDate !== null && startDate !== undefined) event.start_date = startDate;
      if (endDate !== null && endDate !== undefined) event.end_date = endDate;
      if (totalCapacity !== null && totalCapacity !== undefined) event.total_capacity = Number(totalCapacity);
      event.updated_at = new Date().toISOString();

      return { rows: [formatEvent(event)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 11. UPDATE ticket_tiers sold counts
  if (trimmed.includes('UPDATE ticket_tiers SET tickets_sold = tickets_sold + 1')) {
    const id = params[0] as string;
    const tier = mockDb.ticketTiers.find((t) => t.id === id);
    if (tier) {
      tier.tickets_sold = (tier.tickets_sold || 0) + 1;
      return { rows: [formatTier(tier)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE ticket_tiers SET tickets_sold = tickets_sold - 1')) {
    const id = params[0] as string;
    const tier = mockDb.ticketTiers.find((t) => t.id === id);
    if (tier && tier.tickets_sold > 0) {
      tier.tickets_sold -= 1;
      return { rows: [formatTier(tier)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 12. CHECKOUT: Lock and verify tier capacity
  if (trimmed.includes('FROM ticket_tiers tt') && trimmed.includes('JOIN events e') && trimmed.includes('tt.id = $1 AND tt.event_id = $2')) {
    const [tierId, eventId] = params as [string, string];
    const tier = mockDb.ticketTiers.find((t) => t.id === tierId && t.event_id === eventId);
    const event = mockDb.events.find((e) => e.id === eventId);
    if (!tier || !event) {
      return { rows: [], rowCount: 0 };
    }
    const row = {
      ...formatTier(tier),
      event_title: event.title,
      eventTitle: event.title,
      event_status: event.status,
      eventStatus: event.status,
    };
    return { rows: [row], rowCount: 1 };
  }

  // 13. CHECKOUT: Check if user already registered
  if (trimmed.includes('FROM registrations') && trimmed.includes('user_id = $1 AND event_id = $2')) {
    const [userId, eventId] = params as [string, string];
    const existing = mockDb.registrations.find(
      (r) => r.user_id === userId && r.event_id === eventId && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
    );
    return { rows: existing ? [{ id: existing.id }] : [], rowCount: existing ? 1 : 0 };
  }

  // 14. CHECKOUT: INSERT INTO registrations
  if (trimmed.includes('INSERT INTO registrations')) {
    const [ticket_code, event_id, ticket_tier_id, user_id, amount_paid, attendee_name, attendee_email] = params as any[];
    const newReg: MockRegistration = {
      id: uuidv4(),
      ticket_code,
      event_id,
      ticket_tier_id,
      user_id,
      amount_paid: Number(amount_paid) || 0,
      status: 'CONFIRMED',
      attendee_name,
      attendee_email,
      created_at: new Date().toISOString(),
    };
    mockDb.registrations.push(newReg);
    return { rows: [formatRegistration(newReg)], rowCount: 1 };
  }

  // 15. SELECT my-tickets
  if (trimmed.includes('FROM registrations r') && trimmed.includes('r.user_id = $1')) {
    const userId = params[0] as string;
    const userRegs = mockDb.registrations.filter((r) => r.user_id === userId);
    const rows = userRegs.map(formatRegistration);
    rows.sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
    return { rows, rowCount: rows.length };
  }

  // 16. CHECK-IN: Lookup ticket by code & event_id
  if (trimmed.includes('FROM registrations r') && (trimmed.includes('ticket_code = $1') || trimmed.includes('r.ticket_code = $1'))) {
    const code = ((params[0] as string) || '').trim().toUpperCase();
    const eventId = params[1] as string | undefined;

    const reg = mockDb.registrations.find((r) => {
      const matchesCode = r.ticket_code.toUpperCase() === code;
      return eventId ? matchesCode && r.event_id === eventId : matchesCode;
    });

    if (!reg) return { rows: [], rowCount: 0 };
    const row = formatRegistration(reg);
    return { rows: [row], rowCount: 1 };
  }

  // 17. UPDATE registrations (check-in / cancel)
  if (trimmed.includes('UPDATE registrations SET status = \'CHECKED_IN\'')) {
    const id = params[0] as string;
    const reg = mockDb.registrations.find((r) => r.id === id || r.ticket_code === id);
    if (reg) {
      reg.status = 'CHECKED_IN';
      reg.checked_in_at = new Date().toISOString();
      return { rows: [formatRegistration(reg)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (trimmed.includes('UPDATE registrations SET status = \'CANCELLED\'')) {
    const id = params[0] as string;
    const reg = mockDb.registrations.find((r) => r.id === id);
    if (reg) {
      reg.status = 'CANCELLED';
      return { rows: [formatRegistration(reg)], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  // 18. CANCEL REGISTRATION: Lookup registration + event start_date
  if (trimmed.includes('FROM registrations r') && trimmed.includes('JOIN events e ON r.event_id = e.id') && trimmed.includes('r.id = $1 AND r.user_id = $2')) {
    const [regId, userId] = params as [string, string];
    const reg = mockDb.registrations.find((r) => r.id === regId && r.user_id === userId);
    if (!reg) return { rows: [], rowCount: 0 };
    const event = mockDb.events.find((e) => e.id === reg.event_id);
    const row = {
      ...formatRegistration(reg),
      start_date: event?.start_date,
      startDate: event?.start_date,
    };
    return { rows: [row], rowCount: 1 };
  }

  // 19. Organizer Events List (getOrganizerEvents)
  if (trimmed.includes('FROM events e') && trimmed.includes('WHERE e.organizer_id = $1')) {
    const orgId = params[0] as string;
    const orgEvents = mockDb.events.filter((e) => e.organizer_id === orgId || !orgId);
    const rows = orgEvents.map((e) => {
      const formatted = formatEvent(e);
      const regs = mockDb.registrations.filter((r) => r.event_id === e.id && (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN'));
      const rev = regs.reduce((sum, r) => sum + (Number(r.amount_paid) || 0), 0);
      return {
        ...formatted,
        totalRegistrations: regs.length,
        total_registrations: regs.length,
        totalRevenue: rev,
        total_revenue: rev,
      };
    });
    return { rows, rowCount: rows.length };
  }

  // 20. Event Attendees List (getEventAttendees)
  if (trimmed.includes('FROM registrations r') && trimmed.includes('WHERE r.event_id = $1')) {
    const eventId = params[0] as string;
    const regs = mockDb.registrations.filter((r) => r.event_id === eventId);
    const rows = regs.map(formatRegistration);
    rows.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return { rows, rowCount: rows.length };
  }

  // 21. Event Analytics (getEventAnalytics)
  if (trimmed.includes('FROM events e') && trimmed.includes('LEFT JOIN registrations r') && trimmed.includes('LEFT JOIN ticket_tiers tt') && trimmed.includes('WHERE e.id = $1')) {
    const eventId = params[0] as string;
    const event = mockDb.events.find((e) => e.id === eventId);
    if (!event) return { rows: [], rowCount: 0 };

    const regs = mockDb.registrations.filter((r) => r.event_id === eventId);
    const confirmedRegs = regs.filter((r) => r.status === 'CONFIRMED' || r.status === 'CHECKED_IN');
    const checkedInCount = regs.filter((r) => r.status === 'CHECKED_IN').length;
    const totalRev = confirmedRegs.reduce((sum, r) => sum + (Number(r.amount_paid) || 0), 0);

    const tiers = mockDb.ticketTiers.filter((tt) => tt.event_id === eventId);
    const tierBreakdown = tiers.map((tt) => ({
      tierName: tt.name,
      sold: Number(tt.tickets_sold) || 0,
      capacity: Number(tt.capacity) || 100,
      revenue: (Number(tt.tickets_sold) || 0) * (Number(tt.price) || 0),
    }));

    const analyticsRow = {
      total_registrations: confirmedRegs.length,
      totalRegistrations: confirmedRegs.length,
      checked_in_count: checkedInCount,
      checkedInCount: checkedInCount,
      total_revenue: totalRev,
      totalRevenue: totalRev,
      tier_breakdown: tierBreakdown,
      tierBreakdown: tierBreakdown,
    };

    return { rows: [analyticsRow], rowCount: 1 };
  }

  // 22. AI Context: Marketing Copy Query
  if (trimmed.includes('FROM events e') && trimmed.includes('LEFT JOIN ticket_tiers tt') && trimmed.includes('WHERE e.id = $1') && !trimmed.includes('LEFT JOIN users u')) {
    const eventId = params[0] as string;
    const event = mockDb.events.find((e) => e.id === eventId);
    if (!event) return { rows: [], rowCount: 0 };
    const tiers = mockDb.ticketTiers
      .filter((tt) => tt.event_id === event.id)
      .map((tt) => ({ name: tt.name, price: Number(tt.price), perks: tt.perks }));
    return { rows: [{ ...formatEvent(event), ticket_tiers: tiers, ticketTiers: tiers }], rowCount: 1 };
  }

  // 23. AI Context: Concierge Query
  if (trimmed.includes('FROM events e') && trimmed.includes('LEFT JOIN users u') && trimmed.includes('LEFT JOIN ticket_tiers tt') && trimmed.includes('WHERE e.id = $1')) {
    const eventId = params[0] as string;
    const event = mockDb.events.find((e) => e.id === eventId);
    if (!event) return { rows: [], rowCount: 0 };
    const organizer = mockDb.users.find((u) => u.id === event.organizer_id);
    const tiers = mockDb.ticketTiers
      .filter((tt) => tt.event_id === event.id)
      .map((tt) => ({
        name: tt.name,
        price: Number(tt.price),
        capacity: tt.capacity,
        ticketsRemaining: Math.max(0, tt.capacity - tt.tickets_sold),
        description: tt.description,
        perks: tt.perks,
      }));
    const row = {
      title: event.title,
      tagline: event.tagline,
      description: event.description,
      category: event.category,
      start_date: event.start_date,
      end_date: event.end_date,
      status: event.status,
      venue_name: event.venue_name,
      venue_address: event.venue_address,
      venue_city: event.venue_city,
      virtual_link: event.virtual_link,
      location_type: event.location_type,
      banner_image_url: event.banner_image_url,
      organizer_name: organizer?.full_name || 'Event Curator',
      organizer_email: organizer?.email || 'organizer@eventpulse.com',
      ticket_tiers: tiers,
    };
    return { rows: [row], rowCount: 1 };
  }

  // Default catch-all
  console.log('[DB Emulator Unhandled SQL]:', trimmed.substring(0, 100));
  return { rows: [], rowCount: 0 };
};

export const getClient = async () => {
  if (!useMock) {
    try {
      return await pool.connect();
    } catch {
      useMock = true;
    }
  }

  return {
    query: async (text: string, params: unknown[] = []) => query(text, params),
    release: () => {},
  } as any;
};

export default pool;
