import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name required'),
  role: z.enum(['ATTENDEE', 'ORGANIZER', 'ADMIN']).default('ATTENDEE'),
  organizationName: z.string().optional(),
});

export const LoginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateEventSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(250),
  category: z.string().min(1, 'Category is required'),
  tagline: z.string().max(300).optional(),
  description: z.string().min(20, 'Description must be detailed'),
  locationType: z.enum(['VENUE_IN_PERSON', 'VIRTUAL', 'HYBRID']),
  venueName: z.string().optional(),
  venueAddress: z.string().optional(),
  venueCity: z.string().optional(),
  virtualLink: z.string().url().optional().or(z.literal('')),
  bannerImageUrl: z.string().url('Must be a valid image URL').optional().or(z.literal('')).or(z.null()),
  startDate: z.string().datetime('Invalid start date ISO format'),
  endDate: z.string().datetime('Invalid end date ISO format'),
  totalCapacity: z.number().int().positive(),
  isFeatured: z.boolean().optional().default(false),
  ticketTiers: z
    .array(
      z.object({
        name: z.string().min(1),
        price: z.number().min(0),
        capacity: z.number().int().positive(),
        description: z.string().optional(),
        perks: z.array(z.string()).optional(),
      })
    )
    .min(1, 'At least one ticket tier is required'),
});

export const UpdateEventSchema = CreateEventSchema.partial();

export const CheckoutSchema = z.object({
  eventId: z.string().uuid(),
  ticketTierId: z.string().uuid(),
  attendeeName: z.string().min(2),
  attendeeEmail: z.string().email(),
});

export const CheckInSchema = z.object({
  ticketCode: z.string().min(1, 'Ticket code is required'),
  eventId: z.string().uuid(),
});

export const AiGenerateEventSchema = z.object({
  topic: z.string().min(5, 'Topic is required'),
  category: z.string().min(1, 'Category is required'),
  duration: z.string().optional().default('1 day'),
});

export const AiMarketingCopySchema = z.object({
  eventId: z.string().uuid(),
  copyType: z.enum([
    'EMAIL',
    'SOCIAL_POST',
    'ANNOUNCEMENT',
    'FAQ',
    'EMAIL_ANNOUNCEMENT',
    'SOCIAL_THREAD',
    'VIP_INVITE',
    'REMINDER_URGENT',
  ]),
  targetAudience: z.string().optional(),
  tone: z.enum(['PROFESSIONAL', 'CASUAL', 'EXCITING', 'INFORMATIVE']).optional().default('PROFESSIONAL'),
});

export const AiConciergeSchema = z.object({
  eventId: z.string().uuid(),
  question: z.string().min(3, 'Please provide a question'),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string(),
      })
    )
    .optional()
    .default([]),
});

export type RegisterUserInput = z.infer<typeof RegisterUserSchema>;
export type LoginUserInput = z.infer<typeof LoginUserSchema>;
export type CreateEventInput = z.infer<typeof CreateEventSchema>;
export type UpdateEventInput = z.infer<typeof UpdateEventSchema>;
export type CheckoutInput = z.infer<typeof CheckoutSchema>;
export type CheckInInput = z.infer<typeof CheckInSchema>;
export type AiGenerateEventInput = z.infer<typeof AiGenerateEventSchema>;
export type AiMarketingCopyInput = z.infer<typeof AiMarketingCopySchema>;
export type AiConciergeInput = z.infer<typeof AiConciergeSchema>;
