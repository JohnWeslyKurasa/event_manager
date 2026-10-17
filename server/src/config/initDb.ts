import { query } from './db';
import bcrypt from 'bcryptjs';
import { mockDb } from './mockStore';

const seedDemoData = async () => {
  const organizer = mockDb.users.find((user) => user.role === 'ORGANIZER')!;
  const attendee = mockDb.users.find((user) => user.role === 'ATTENDEE')!;
  const passwordHash = await bcrypt.hash('12345678', 10);

  for (const user of [organizer, attendee]) {
    await query(
      `INSERT INTO users (id, email, password_hash, full_name, role, organization_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         organization_name = EXCLUDED.organization_name,
         updated_at = CURRENT_TIMESTAMP`,
      [user.id, user.email, passwordHash, user.full_name, user.role, user.organization_name || null]
    );
  }

  for (const event of mockDb.events) {
    await query(
      `INSERT INTO events (
        id, organizer_id, title, slug, category, tagline, description, status, location_type,
        venue_name, venue_address, venue_city, virtual_link, banner_image_url, start_date,
        end_date, total_capacity, tickets_sold, is_featured
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19
      ) ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title, slug = EXCLUDED.slug, category = EXCLUDED.category,
        tagline = EXCLUDED.tagline, description = EXCLUDED.description, status = EXCLUDED.status,
        location_type = EXCLUDED.location_type, venue_name = EXCLUDED.venue_name,
        venue_address = EXCLUDED.venue_address, venue_city = EXCLUDED.venue_city,
        virtual_link = EXCLUDED.virtual_link, banner_image_url = EXCLUDED.banner_image_url,
        start_date = EXCLUDED.start_date, end_date = EXCLUDED.end_date,
        total_capacity = EXCLUDED.total_capacity, is_featured = EXCLUDED.is_featured,
        updated_at = CURRENT_TIMESTAMP`,
      [
        event.id, event.organizer_id, event.title, event.slug, event.category, event.tagline || null,
        event.description, event.status, event.location_type, event.venue_name || null,
        event.venue_address || null, event.venue_city || null, event.virtual_link || null,
        event.banner_image_url || null, event.start_date, event.end_date, event.total_capacity,
        event.tickets_sold, event.is_featured,
      ]
    );
  }

  for (const [index, tier] of mockDb.ticketTiers.entries()) {
    const id = `44444444-4444-4444-4444-${String(index + 1).padStart(12, '0')}`;
    await query(
      `INSERT INTO ticket_tiers (
        id, event_id, name, price, capacity, tickets_sold, description, perks, sales_start, sales_end
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        event_id = EXCLUDED.event_id, name = EXCLUDED.name, price = EXCLUDED.price,
        capacity = EXCLUDED.capacity, description = EXCLUDED.description, perks = EXCLUDED.perks,
        sales_start = EXCLUDED.sales_start, sales_end = EXCLUDED.sales_end`,
      [
        id, tier.event_id, tier.name, tier.price, tier.capacity, tier.tickets_sold, tier.description,
        JSON.stringify(tier.perks), tier.sales_start || null, tier.sales_end || null,
      ]
    );
  }
};

const initializeDatabase = async () => {
  console.log('[DB Init] Checking database initialization...');

  const sql = `
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

    DO $$ BEGIN
      CREATE TYPE user_role AS ENUM ('ATTENDEE', 'ORGANIZER', 'ADMIN');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE event_status AS ENUM ('DRAFT', 'PUBLISHED', 'SOLD_OUT', 'CANCELLED', 'COMPLETED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE location_type AS ENUM ('VENUE_IN_PERSON', 'VIRTUAL', 'HYBRID');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    DO $$ BEGIN
      CREATE TYPE registration_status AS ENUM ('CONFIRMED', 'CHECKED_IN', 'CANCELLED', 'REFUNDED');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;

    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(150) NOT NULL,
      role user_role NOT NULL DEFAULT 'ATTENDEE',
      organization_name VARCHAR(200),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      organizer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      category VARCHAR(100) NOT NULL,
      tagline VARCHAR(300),
      description TEXT NOT NULL,
      status event_status NOT NULL DEFAULT 'DRAFT',
      location_type location_type NOT NULL DEFAULT 'VENUE_IN_PERSON',
      venue_name VARCHAR(255),
      venue_address TEXT,
      venue_city VARCHAR(100),
      virtual_link TEXT,
      banner_image_url TEXT,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE NOT NULL,
      total_capacity INT NOT NULL CHECK (total_capacity >= 0),
      tickets_sold INT NOT NULL DEFAULT 0,
      is_featured BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ticket_tiers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      name VARCHAR(100) NOT NULL,
      price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
      capacity INT NOT NULL CHECK (capacity > 0),
      tickets_sold INT NOT NULL DEFAULT 0,
      description TEXT,
      perks JSONB DEFAULT '[]'::jsonb,
      sales_start TIMESTAMP WITH TIME ZONE,
      sales_end TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      ticket_code VARCHAR(50) UNIQUE NOT NULL,
      event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      ticket_tier_id UUID NOT NULL REFERENCES ticket_tiers(id) ON DELETE RESTRICT,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
      status registration_status NOT NULL DEFAULT 'CONFIRMED',
      attendee_name VARCHAR(150) NOT NULL,
      attendee_email VARCHAR(255) NOT NULL,
      checked_in_at TIMESTAMP WITH TIME ZONE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
    CREATE INDEX IF NOT EXISTS idx_ticket_tiers_event ON ticket_tiers(event_id);
    CREATE INDEX IF NOT EXISTS idx_registrations_event ON registrations(event_id);
  `;

  try {
    await query(sql);
    await seedDemoData();
    console.log('[DB Init] Database schema initialized.');
  } catch (error) {
    console.log('[DB Init] Using memory store.');
  }
};

export default initializeDatabase;
