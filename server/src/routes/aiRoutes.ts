import { Router } from 'express';
import { generateEvent, generateMarketingCopy, conciergeQuery } from '../controllers/aiController';
import { authenticateToken, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validateMiddleware';
import {
  AiGenerateEventSchema,
  AiMarketingCopySchema,
  AiConciergeSchema,
} from '../schemas/validationSchemas';

const router = Router();

// Organizer tools
router.post(
  '/generate-event',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(AiGenerateEventSchema),
  generateEvent
);

router.post(
  '/marketing-copy',
  authenticateToken,
  requireRole('ORGANIZER', 'ADMIN'),
  validate(AiMarketingCopySchema),
  generateMarketingCopy
);

// Public/Attendee concierge
router.post('/concierge', validate(AiConciergeSchema), conciergeQuery);

export default router;
