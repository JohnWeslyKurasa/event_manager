import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export interface MockUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'ATTENDEE' | 'ORGANIZER' | 'ADMIN';
  organization_name?: string;
  created_at: string;
  updated_at: string;
}

export interface MockTicketTier {
  id: string;
  event_id: string;
  name: string;
  price: number;
  capacity: number;
  tickets_sold: number;
  description: string;
  perks: string[];
  sales_start?: string;
  sales_end?: string;
  created_at: string;
}

export interface MockEvent {
  id: string;
  organizer_id: string;
  title: string;
  slug: string;
  category: string;
  tagline?: string;
  description: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SOLD_OUT' | 'CANCELLED' | 'COMPLETED';
  location_type: 'VENUE_IN_PERSON' | 'VIRTUAL' | 'HYBRID';
  venue_name?: string;
  venue_address?: string;
  venue_city?: string;
  virtual_link?: string;
  banner_image_url?: string;
  start_date: string;
  end_date: string;
  total_capacity: number;
  tickets_sold: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockRegistration {
  id: string;
  ticket_code: string;
  event_id: string;
  ticket_tier_id: string;
  user_id: string;
  amount_paid: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED';
  attendee_name: string;
  attendee_email: string;
  checked_in_at?: string;
  created_at: string;
}

class MockDatabase {
  users: MockUser[] = [];
  events: MockEvent[] = [];
  ticketTiers: MockTicketTier[] = [];
  registrations: MockRegistration[] = [];

  constructor() {
    this.seed();
  }

  private seed() {
    const passwordHash = bcrypt.hashSync('12345678', 10);

    const organizerId = '11111111-1111-1111-1111-111111111111';
    const attendeeId = '22222222-2222-2222-2222-222222222222';

    this.users.push(
      {
        id: organizerId,
        email: 'organizer@eventpulse.com',
        password_hash: passwordHash,
        full_name: 'Elena Rostova',
        role: 'ORGANIZER',
        organization_name: 'Apex Innovations & Curation Studio',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: attendeeId,
        email: 'attendee@eventpulse.com',
        password_hash: passwordHash,
        full_name: 'Marcus Vance',
        role: 'ATTENDEE',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    const event1Id = '33333333-3333-3333-3333-333333333331';
    const event2Id = '33333333-3333-3333-3333-333333333332';
    const event3Id = '33333333-3333-3333-3333-333333333333';
    const event4Id = '33333333-3333-3333-3333-333333333334';

    this.events.push(
      {
        id: event1Id,
        organizer_id: organizerId,
        title: 'Global Intelligence & Autonomous Systems Summit 2026',
        slug: 'global-intelligence-autonomous-systems-summit-2026',
        category: 'TECHNOLOGY_INNOVATION',
        tagline: 'An executive symposium exploring autonomous reasoning and neural architecture.',
        description: 'Join world-renowned researchers, founders, and system architects for two intensive days of keynotes, breakout tracks, and executive networking focused on next-generation artificial intelligence, multi-agent frameworks, and scalable cloud compute.',
        status: 'PUBLISHED',
        location_type: 'VENUE_IN_PERSON',
        venue_name: 'The Conservatory Hall',
        venue_address: '450 Mission Street',
        venue_city: 'San Francisco, CA',
        banner_image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
        start_date: new Date(Date.now() + 86400000 * 14).toISOString(),
        end_date: new Date(Date.now() + 86400000 * 16).toISOString(),
        total_capacity: 450,
        tickets_sold: 142,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: event2Id,
        organizer_id: organizerId,
        title: 'Botanical Living & Sustainable Architecture Forum',
        slug: 'botanical-living-sustainable-architecture-forum',
        category: 'HEALTH_WELLNESS',
        tagline: 'Designing living spaces that harmonize modern living with sustainable ecology.',
        description: 'A curated masterclass and exhibition on bio-climatic design, organic building materials, regenerative landscape architecture, and carbon-negative urban developments.',
        status: 'PUBLISHED',
        location_type: 'HYBRID',
        venue_name: 'Greenhouse Atrium Center',
        venue_address: '120 Commonwealth Ave',
        venue_city: 'Boston, MA',
        virtual_link: 'https://meet.google.com/botanical-living-2026',
        banner_image_url: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
        start_date: new Date(Date.now() + 86400000 * 25).toISOString(),
        end_date: new Date(Date.now() + 86400000 * 26).toISOString(),
        total_capacity: 250,
        tickets_sold: 89,
        is_featured: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: event3Id,
        organizer_id: organizerId,
        title: 'Nordic Chamber Music & Acoustic Reflections',
        slug: 'nordic-chamber-music-acoustic-reflections',
        category: 'MUSIC_CONCERTS',
        tagline: 'An evening of minimalist neoclassical compositions and acoustic strings.',
        description: 'Experience an enchanting acoustic performance featuring chamber ensembles from Oslo, Copenhagen, and Reykjavik performing rare neoclassical and contemporary works.',
        status: 'PUBLISHED',
        location_type: 'VENUE_IN_PERSON',
        venue_name: 'St. Claire Symphony Hall',
        venue_address: '280 Symphony Lane',
        venue_city: 'New York, NY',
        banner_image_url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6',
        start_date: new Date(Date.now() + 86400000 * 30).toISOString(),
        end_date: new Date(Date.now() + 86400000 * 30 + 14400000).toISOString(),
        total_capacity: 320,
        tickets_sold: 215,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: event4Id,
        organizer_id: organizerId,
        title: 'Venture Capital & Seed Syndication Masterclass',
        slug: 'venture-capital-seed-syndication-masterclass',
        category: 'BUSINESS_ENTREPRENEURSHIP',
        tagline: 'Practical frameworks for early-stage capital formation and term sheet negotiation.',
        description: 'A dedicated virtual symposium for emerging fund managers, angel investors, and founders seeking insights into cap table architecture, syndication mechanics, and governance models.',
        status: 'PUBLISHED',
        location_type: 'VIRTUAL',
        virtual_link: 'https://meet.google.com/venture-masterclass-2026',
        banner_image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
        start_date: new Date(Date.now() + 86400000 * 40).toISOString(),
        end_date: new Date(Date.now() + 86400000 * 41).toISOString(),
        total_capacity: 1000,
        tickets_sold: 412,
        is_featured: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    );

    // Ticket Tiers
    const tier1Id = '44444444-4444-4444-4444-444444444441';
    const tier2Id = '44444444-4444-4444-4444-444444444442';

    this.ticketTiers.push(
      {
        id: tier1Id,
        event_id: event1Id,
        name: 'General Delegate Pass',
        price: 149.00,
        capacity: 350,
        tickets_sold: 100,
        description: 'Access to keynote sessions, exhibit hall, and catered luncheon.',
        perks: ['Main Stage Access', 'Networking Luncheon', 'Conference Proceedings'],
        created_at: new Date().toISOString(),
      },
      {
        id: tier2Id,
        event_id: event1Id,
        name: 'Executive Patron Pass',
        price: 399.00,
        capacity: 100,
        tickets_sold: 42,
        description: 'Priority front-row seating, private VIP lounge access, and speaker banquet.',
        perks: ['VIP Private Lounge', 'Speaker Dinner Gala', 'Fast-Track Check-in', '1-on-1 Advisory Session'],
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        event_id: event2Id,
        name: 'Standard Registration',
        price: 65.00,
        capacity: 200,
        tickets_sold: 70,
        description: 'Includes full symposium access and botanical garden entry.',
        perks: ['Full Session Access', 'Exhibition Pass', 'Botanical Guidebook'],
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        event_id: event2Id,
        name: 'Architect VIP Workshop',
        price: 180.00,
        capacity: 50,
        tickets_sold: 19,
        description: 'Includes hands-on bio-climatic design workshop.',
        perks: ['Hands-on Design Lab', 'Private Curator Reception', 'Digital Resource Bundle'],
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        event_id: event3Id,
        name: 'Orchestra Seating',
        price: 85.00,
        capacity: 220,
        tickets_sold: 165,
        description: 'Prime central acoustics in the grand orchestra level.',
        perks: ['Orchestra Level Seat', 'Complimentary Program Note'],
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        event_id: event3Id,
        name: 'Balcony Tier',
        price: 45.00,
        capacity: 100,
        tickets_sold: 50,
        description: 'Elevated panoramic perspective.',
        perks: ['Balcony Admission'],
        created_at: new Date().toISOString(),
      },
      {
        id: uuidv4(),
        event_id: event4Id,
        name: 'Virtual Broadcast Pass',
        price: 0.00,
        capacity: 1000,
        tickets_sold: 412,
        description: 'High-definition live interactive streaming access.',
        perks: ['Interactive Q&A Access', 'On-Demand Recording'],
        created_at: new Date().toISOString(),
      }
    );

    // Initial Registration
    this.registrations.push({
      id: '55555555-5555-5555-5555-555555555551',
      ticket_code: 'EP-9821-DEL',
      event_id: event1Id,
      ticket_tier_id: tier1Id,
      user_id: attendeeId,
      amount_paid: 149.00,
      status: 'CONFIRMED',
      attendee_name: 'Marcus Vance',
      attendee_email: 'attendee@eventpulse.com',
      created_at: new Date().toISOString(),
    });
  }
}

export const mockDb = new MockDatabase();
