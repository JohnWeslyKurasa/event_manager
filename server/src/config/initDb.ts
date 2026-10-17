import { query } from './db';

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
    console.log('[DB Init] Database schema initialized.');
  } catch (error) {
    console.log('[DB Init] Using memory store.');
  }
};

export default initializeDatabase;
