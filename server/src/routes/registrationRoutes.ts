import { Router } from 'express';
import { checkout, getMyTickets, checkIn, cancelRegistration } from '../controllers/registrationController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import { CheckoutSchema, CheckInSchema } from '../schemas/validationSchemas';

const router = Router();

// Attendee routes
router.post('/checkout', authenticateToken, validate(CheckoutSchema), checkout);
router.get('/my-tickets', authenticateToken, getMyTickets);
router.patch('/cancel/:registrationId', authenticateToken, cancelRegistration);

// Organizer routes
router.post(
  '/check-in',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(CheckInSchema),
  checkIn
);

export default router;
