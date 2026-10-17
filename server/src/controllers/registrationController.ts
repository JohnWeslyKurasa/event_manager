import { Request, Response } from 'express';
import { query, getClient } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { CheckoutInput, CheckInInput } from '../schemas/validationSchemas';
import { generateTicketCode } from '../utils/ticketGenerator';

export const checkout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { eventId, ticketTierId, attendeeName, attendeeEmail } = req.body as CheckoutInput;
    const userId = req.user!.userId;

    // Lock and verify tier capacity (atomic check)
    const tierResult = await client.query(
      `SELECT tt.*, e.title AS event_title, e.status AS event_status
       FROM ticket_tiers tt
       JOIN events e ON tt.event_id = e.id
       WHERE tt.id = $1 AND tt.event_id = $2
       FOR UPDATE`,
      [ticketTierId, eventId]
    );

    if (tierResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, message: 'Ticket tier not found.' });
      return;
    }

    const tier = tierResult.rows[0];

    if (tier.event_status !== 'PUBLISHED') {
      await client.query('ROLLBACK');
      res.status(400).json({ success: false, message: 'This event is not currently accepting registrations.' });
      return;
    }

    if (tier.tickets_sold >= tier.capacity) {
      await client.query('ROLLBACK');
      res.status(409).json({ success: false, message: 'Sorry, this ticket tier is sold out.' });
      return;
    }

    // Check if user already has a ticket for this event
    const existingReg = await client.query(
      `SELECT id FROM registrations
       WHERE user_id = $1 AND event_id = $2 AND status IN ('CONFIRMED', 'CHECKED_IN')`,
      [userId, eventId]
    );

    if (existingReg.rows.length > 0) {
      await client.query('ROLLBACK');
      res.status(409).json({ success: false, message: 'You already have a ticket for this event.' });
      return;
    }

    // Generate unique ticket code
    const ticketCode = generateTicketCode();

    // Create registration
    const registrationResult = await client.query(
      `INSERT INTO registrations (ticket_code, event_id, ticket_tier_id, user_id, amount_paid, attendee_name, attendee_email)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [ticketCode, eventId, ticketTierId, userId, tier.price, attendeeName, attendeeEmail]
    );

    // Increment tier tickets_sold
    await client.query(
      `UPDATE ticket_tiers SET tickets_sold = tickets_sold + 1 WHERE id = $1`,
      [ticketTierId]
    );

    // Increment event tickets_sold
    await client.query(
      `UPDATE events SET tickets_sold = tickets_sold + 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [eventId]
    );

    // Update event status to SOLD_OUT if at capacity
    await client.query(
      `UPDATE events SET status = 'SOLD_OUT'
       WHERE id = $1 AND tickets_sold >= total_capacity AND status = 'PUBLISHED'`,
      [eventId]
    );

    await client.query('COMMIT');

    const registration = registrationResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Registration confirmed! Your ticket has been issued.',
      data: {
        ...registration,
        tierName: tier.name,
        eventTitle: tier.event_title,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Registration] Checkout error:', error);
    res.status(500).json({ success: false, message: 'Checkout failed. Please try again.' });
  } finally {
    client.release();
  }
};

export const getMyTickets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const result = await query(
      `SELECT
        r.*,
        tt.name AS tier_name,
        tt.price AS tier_price,
        tt.perks AS tier_perks,
        e.title AS event_title,
        e.slug AS event_slug,
        e.banner_image_url,
        e.start_date,
        e.end_date,
        e.venue_name,
        e.venue_address,
        e.venue_city,
        e.virtual_link,
        e.location_type,
        e.category,
        u.full_name AS organizer_name
      FROM registrations r
      JOIN ticket_tiers tt ON r.ticket_tier_id = tt.id
      JOIN events e ON r.event_id = e.id
      JOIN users u ON e.organizer_id = u.id
      WHERE r.user_id = $1
      ORDER BY e.start_date DESC`,
      [userId]
    );

    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error('[Registration] getMyTickets error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tickets.' });
  }
};

export const checkIn = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const { ticketCode, eventId } = req.body as CheckInInput;
    const organizerId = req.user!.userId;

    // Verify organizer owns this event
    const eventCheck = await client.query(
      'SELECT id FROM events WHERE id = $1 AND organizer_id = $2',
      [eventId, organizerId]
    );

    if (eventCheck.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(403).json({ success: false, message: 'Access denied. You do not manage this event.' });
      return;
    }

    // Find and lock registration
    const regResult = await client.query(
      `SELECT r.*, tt.name AS tier_name
       FROM registrations r
       JOIN ticket_tiers tt ON r.ticket_tier_id = tt.id
       WHERE r.ticket_code = $1 AND r.event_id = $2
       FOR UPDATE`,
      [ticketCode.toUpperCase(), eventId]
    );

    if (regResult.rows.length === 0) {
      await client.query('ROLLBACK');
      res.status(404).json({ success: false, message: 'Ticket not found. Please verify the ticket code.' });
      return;
    }

    const registration = regResult.rows[0];

    if (registration.status === 'CHECKED_IN') {
      await client.query('ROLLBACK');
      res.status(409).json({
        success: false,
        message: `Ticket already used. Checked in at: ${new Date(registration.checked_in_at).toLocaleString()}`,
        data: registration,
      });
      return;
    }

    if (registration.status === 'CANCELLED' || registration.status === 'REFUNDED') {
      await client.query('ROLLBACK');
      res.status(400).json({
        success: false,
        message: `Ticket is ${registration.status.toLowerCase()}. Entry denied.`,
      });
      return;
    }

    // Mark as checked in
    const updatedReg = await client.query(
      `UPDATE registrations
       SET status = 'CHECKED_IN', checked_in_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING *`,
      [registration.id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      success: true,
      message: `✅ Check-in successful! Welcome, ${registration.attendee_name}!`,
      data: {
        ...updatedReg.rows[0],
        tierName: registration.tier_name,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('[Registration] checkIn error:', error);
    res.status(500).json({ success: false, message: 'Check-in failed. Please try again.' });
  } finally {
    client.release();
  }
};

export const cancelRegistration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { registrationId } = req.params;
    const userId = req.user!.userId;

    const regResult = await query(
      `SELECT r.*, e.start_date FROM registrations r
       JOIN events e ON r.event_id = e.id
       WHERE r.id = $1 AND r.user_id = $2`,
      [registrationId, userId]
    );

    if (regResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Registration not found.' });
      return;
    }

    const reg = regResult.rows[0];

    if (reg.status === 'CHECKED_IN') {
      res.status(400).json({ success: false, message: 'Cannot cancel a ticket that has already been used.' });
      return;
    }

    await query(
      `UPDATE registrations SET status = 'CANCELLED' WHERE id = $1`,
      [registrationId]
    );

    // Decrement counts
    await query(
      `UPDATE ticket_tiers SET tickets_sold = tickets_sold - 1 WHERE id = $1 AND tickets_sold > 0`,
      [reg.ticket_tier_id]
    );
    await query(
      `UPDATE events SET tickets_sold = tickets_sold - 1, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND tickets_sold > 0`,
      [reg.event_id]
    );

    res.status(200).json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (error) {
    console.error('[Registration] cancelRegistration error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
};
