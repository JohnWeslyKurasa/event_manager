import { Request, Response } from 'express';
import { query, getClient } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CreateEventInput, UpdateEventInput } from '../schemas/validationSchemas';
import { generateSlug } from '../utils/ticketGenerator';

export const getEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '12',
      search = '',
      category = '',
      status = 'PUBLISHED',
      city = '',
    } = req.query as Record<string, string>;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params: unknown[] = [];
    let paramIndex = 1;
    const conditions: string[] = ['e.status = $' + paramIndex++];
    params.push(status);

    if (search) {
      conditions.push(`(e.title ILIKE $${paramIndex} OR e.description ILIKE $${paramIndex} OR e.tagline ILIKE $${paramIndex})`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (category) {
      conditions.push(`e.category = $${paramIndex++}`);
      params.push(category);
    }

    if (city) {
      conditions.push(`e.venue_city ILIKE $${paramIndex++}`);
      params.push(`%${city}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const eventsQuery = `
      SELECT
        e.*,
        u.full_name AS organizer_name,
        u.organization_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tt.id,
              'name', tt.name,
              'price', tt.price,
              'capacity', tt.capacity,
              'ticketsSold', tt.tickets_sold,
              'description', tt.description,
              'perks', tt.perks
            ) ORDER BY tt.price ASC
          ) FILTER (WHERE tt.id IS NOT NULL),
          '[]'
        ) AS ticket_tiers
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      ${whereClause}
      GROUP BY e.id, u.full_name, u.organization_name
      ORDER BY e.is_featured DESC, e.created_at DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    params.push(parseInt(limit), offset);

    const countQuery = `
      SELECT COUNT(*) FROM events e ${whereClause}
    `;
    const countParams = params.slice(0, params.length - 2);

    const [eventsResult, countResult] = await Promise.all([
      query(eventsQuery, params),
      query(countQuery, countParams),
    ]);

    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / parseInt(limit));

    res.status(200).json({
      success: true,
      data: eventsResult.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalCount,
        totalPages,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1,
      },
    });
  } catch (error) {
    console.error('[Events] getEvents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events.' });
  }
};

export const getEventById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        e.*,
        u.full_name AS organizer_name,
        u.organization_name,
        u.email AS organizer_email,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tt.id,
              'name', tt.name,
              'price', tt.price,
              'capacity', tt.capacity,
              'ticketsSold', tt.tickets_sold,
              'description', tt.description,
              'perks', tt.perks,
              'salesStart', tt.sales_start,
              'salesEnd', tt.sales_end
            ) ORDER BY tt.price ASC
          ) FILTER (WHERE tt.id IS NOT NULL),
          '[]'
        ) AS ticket_tiers
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, u.full_name, u.organization_name, u.email`,
      [id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('[Events] getEventById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch event.' });
  }
};

export const createEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const {
      title,
      category,
      tagline,
      description,
      locationType,
      venueName,
      venueAddress,
      venueCity,
      virtualLink,
      bannerImageUrl,
      startDate,
      endDate,
      totalCapacity,
      isFeatured,
      ticketTiers,
    } = req.body as CreateEventInput;

    const organizerId = req.user!.userId;
    const slug = generateSlug(title);

    const eventResult = await client.query(
      `INSERT INTO events (
        organizer_id, title, slug, category, tagline, description,
        location_type, venue_name, venue_address, venue_city, virtual_link,
        banner_image_url, start_date, end_date, total_capacity, is_featured
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
      RETURNING *`,
      [
        organizerId, title, slug, category, tagline || null, description,
        locationType, venueName || null, venueAddress || null, venueCity || null,
        virtualLink || null, bannerImageUrl, startDate, endDate, totalCapacity,
        isFeatured || false,
      ]
    );

    const event = eventResult.rows[0];

    // Insert ticket tiers
    const tierInserts = ticketTiers.map((tier) =>
      client.query(
        `INSERT INTO ticket_tiers (event_id, name, price, capacity, description, perks)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [event.id, tier.name, tier.price, tier.capacity, tier.description || '', JSON.stringify(tier.perks || [])]
      )
    );

    const tierResults = await Promise.all(tierInserts);
    const tiers = tierResults.map((r) => r.rows[0]);

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: { ...event, ticket_tiers: tiers },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Events] createEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to create event.' });
  } finally {
    client.release();
  }
};

export const updateEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const organizerId = req.user!.userId;

    // Verify ownership
    const ownerCheck = await client.query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, organizerId]
    );

    if (ownerCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(403).json({ success: false, message: 'You do not have permission to edit this event.' });
      return;
    }

    const body = req.body as UpdateEventInput;

    const updateResult = await client.query(
      `UPDATE events SET
        title = COALESCE($1, title),
        category = COALESCE($2, category),
        tagline = COALESCE($3, tagline),
        description = COALESCE($4, description),
        location_type = COALESCE($5, location_type),
        venue_name = COALESCE($6, venue_name),
        venue_address = COALESCE($7, venue_address),
        venue_city = COALESCE($8, venue_city),
        virtual_link = COALESCE($9, virtual_link),
        banner_image_url = COALESCE($10, banner_image_url),
        start_date = COALESCE($11, start_date),
        end_date = COALESCE($12, end_date),
        total_capacity = COALESCE($13, total_capacity),
        is_featured = COALESCE($14, is_featured),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $15
      RETURNING *`,
      [
        body.title, body.category, body.tagline, body.description,
        body.locationType, body.venueName, body.venueAddress, body.venueCity,
        body.virtualLink, body.bannerImageUrl, body.startDate, body.endDate,
        body.totalCapacity, body.isFeatured, id,
      ]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Event updated successfully.',
      data: updateResult.rows[0],
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Events] updateEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to update event.' });
  } finally {
    client.release();
  }
};

export const deleteEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;
    const isAdmin = req.user!.role === 'ADMIN';

    const whereClause = isAdmin
      ? 'WHERE id = $1'
      : 'WHERE id = $1 AND organizer_id = $2';
    const params = isAdmin ? [id] : [id, organizerId];

    const result = await query(
      `UPDATE events SET status = 'CANCELLED', updated_at = CURRENT_TIMESTAMP ${whereClause} RETURNING id`,
      params
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found or you lack permission.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Event cancelled successfully.' });
  } catch (error) {
    console.error('[Events] deleteEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel event.' });
  }
};

export const publishEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;

    const result = await query(
      `UPDATE events SET status = 'PUBLISHED', updated_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND organizer_id = $2 RETURNING *`,
      [id, organizerId]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found or you lack permission.' });
      return;
    }

    res.status(200).json({ success: true, message: 'Event published!', data: result.rows[0] });
  } catch (error) {
    console.error('[Events] publishEvent error:', error);
    res.status(500).json({ success: false, message: 'Failed to publish event.' });
  }
};

export const getOrganizerEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const organizerId = req.user!.userId;

    const result = await query(
      `SELECT
        e.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', tt.id,
              'name', tt.name,
              'price', tt.price,
              'capacity', tt.capacity,
              'ticketsSold', tt.tickets_sold,
              'description', tt.description,
              'perks', tt.perks
            ) ORDER BY tt.price ASC
          ) FILTER (WHERE tt.id IS NOT NULL),
          '[]'
        ) AS ticket_tiers,
        COUNT(r.id) AS total_registrations,
        COALESCE(SUM(r.amount_paid), 0) AS total_revenue
      FROM events e
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      LEFT JOIN registrations r ON r.event_id = e.id AND r.status IN ('CONFIRMED', 'CHECKED_IN')
      WHERE e.organizer_id = $1
      GROUP BY e.id
      ORDER BY e.created_at DESC`,
      [organizerId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('[Events] getOrganizerEvents error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch organizer events.' });
  }
};

export const getEventAttendees = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;

    // Verify ownership
    const ownerCheck = await query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, organizerId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const result = await query(
      `SELECT
        r.*,
        tt.name AS tier_name,
        tt.price AS tier_price
      FROM registrations r
      LEFT JOIN ticket_tiers tt ON r.ticket_tier_id = tt.id
      WHERE r.event_id = $1
      ORDER BY r.created_at DESC`,
      [id]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('[Events] getEventAttendees error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendees.' });
  }
};

export const getEventAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const organizerId = req.user!.userId;

    const ownerCheck = await query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [id, organizerId]
    );

    if (ownerCheck.rows.length === 0) {
      res.status(403).json({ success: false, message: 'Access denied.' });
      return;
    }

    const analyticsQuery = await query(
      `SELECT
        COUNT(r.id) FILTER (WHERE r.status IN ('CONFIRMED', 'CHECKED_IN')) AS total_registrations,
        COUNT(r.id) FILTER (WHERE r.status = 'CHECKED_IN') AS checked_in_count,
        COALESCE(SUM(r.amount_paid) FILTER (WHERE r.status IN ('CONFIRMED', 'CHECKED_IN')), 0) AS total_revenue,
        json_agg(
          json_build_object(
            'tierName', tt.name,
            'sold', tt.tickets_sold,
            'capacity', tt.capacity,
            'revenue', (tt.tickets_sold * tt.price)
          )
        ) FILTER (WHERE tt.id IS NOT NULL) AS tier_breakdown
      FROM events e
      LEFT JOIN registrations r ON r.event_id = e.id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id`,
      [id]
    );

    res.status(200).json({ success: true, data: analyticsQuery.rows[0] || {} });
  } catch (error) {
    console.error('[Events] getEventAnalytics error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics.' });
  }
};
