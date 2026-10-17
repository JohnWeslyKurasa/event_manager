import { Router } from 'express';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  publishEvent,
  getOrganizerEvents,
  getEventAttendees,
  getEventAnalytics,
} from '../controllers/eventController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { CreateEventSchema, UpdateEventSchema } from '../schemas/validationSchemas';

const router = Router();

// Public routes
router.get('/', getEvents);
router.get('/organizer/mine', authenticateToken, requireRole('ORGANIZER', 'ADMIN'), getOrganizerEvents);
router.get('/:id', getEventById);

// Organizer-protected routes
router.post(
  '/',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(CreateEventSchema),
  createEvent
);

router.put(
  '/:id',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(UpdateEventSchema),
  updateEvent
);

router.delete('/:id', authenticateToken, requireRole('ORGANIZER', 'ADMIN'), deleteEvent);

router.patch('/:id/publish', authenticateToken, requireRole('ORGANIZER', 'ADMIN'), publishEvent);

router.get(
  '/:id/attendees',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  getEventAttendees
);

router.get(
  '/:id/analytics',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  getEventAnalytics
);

export default router;
