import { Request, Response } from 'express';
import { ai, EVENTPULSE_SYSTEM_PROMPT } from '../config/gemini';
import { query } from '../config/db';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import {
  AiGenerateEventInput,
  AiMarketingCopyInput,
  AiConciergeInput,
} from '../schemas/validationSchemas';
import { Type } from '@google/genai';

// Fallback generator when Gemini API is unavailable or rate limited
const generateFallbackBlueprint = (topic: string, category: string, duration: string) => {
  return {
    title: topic.trim().replace(/^e\.g\.?,?\s*/i, ''),
    tagline: `An extraordinary ${duration} experience in ${category}`,
    description: `Join industry leaders, innovators, and practitioners for ${topic}. This comprehensive event offers inspiring keynote speeches, hands-on masterclasses, and meaningful networking opportunities tailored to modern professionals.`,
    suggestedCategories: [category],
    agendaSchedule: [
      {
        time: '09:00 AM',
        sessionTitle: 'Opening Keynote & Welcome Address',
        speakerRole: 'Lead Organizer & Keynote Speaker',
        description: 'Setting the stage for the sessions, themes, and interactive tracks ahead.',
      },
      {
        time: '11:00 AM',
        sessionTitle: 'Deep Dive Workshop & Masterclass',
        speakerRole: 'Industry Specialist',
        description: 'Hands-on practical walkthrough focusing on core methodologies and tools.',
      },
      {
        time: '02:00 PM',
        sessionTitle: 'Panel Discussion & Live Q&A',
        speakerRole: 'Expert Panel',
        description: 'Engaging interactive panel exploring trends, case studies, and future roadmap.',
      },
      {
        time: '04:30 PM',
        sessionTitle: 'Networking Reception & Closing Remarks',
        speakerRole: 'Host Team',
        description: 'Connect with peers and speakers over light refreshments.',
      },
    ],
    ticketTiers: [
      {
        name: 'General Admission',
        price: 0,
        capacity: 150,
        description: 'Standard access to all keynote sessions and exhibition floor.',
        perks: ['Main Stage Access', 'Digital Certificate', 'Event Resource Pack'],
      },
      {
        name: 'VIP Experience Pass',
        price: 149,
        capacity: 50,
        description: 'Premium experience including priority seating and private lounge access.',
        perks: ['VIP Lounge Access', 'Private Speaker Q&A', 'Exclusive Workshop Materials', 'Gift Bag'],
      },
    ],
    faqSection: [
      {
        question: 'Who should attend this event?',
        answer: 'Anyone interested in staying ahead in this domain, from beginners to experienced professionals.',
      },
      {
        question: 'Will recordings be available after the event?',
        answer: 'Yes, registered attendees will receive access to on-demand session recordings.',
      },
    ],
  };
};

export const generateEvent = async (req: Request, res: Response): Promise<void> => {
  const { topic, category, duration } = req.body as AiGenerateEventInput;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a detailed, multi-tier event blueprint for: "${topic}". Category: ${category}. Duration: ${duration}.`,
      config: {
        systemInstruction: EVENTPULSE_SYSTEM_PROMPT + ' Produce production-grade event structures with realistic pricing and comprehensive agendas.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            tagline: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedCategories: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            agendaSchedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.STRING },
                  sessionTitle: { type: Type.STRING },
                  speakerRole: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ['time', 'sessionTitle', 'description'],
              },
            },
            ticketTiers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  capacity: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  perks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['name', 'price', 'capacity', 'description', 'perks'],
              },
            },
            faqSection: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING },
                },
                required: ['question', 'answer'],
              },
            },
          },
          required: ['title', 'tagline', 'description', 'agendaSchedule', 'ticketTiers'],
        },
      },
    });

    const textContent = response.text;
    if (!textContent) {
      throw new Error('No content returned from AI model.');
    }

    const eventBlueprint = JSON.parse(textContent);

    res.status(200).json({
      success: true,
      message: 'Event blueprint generated successfully!',
      data: eventBlueprint,
    });
  } catch (error) {
    console.warn('[AI] generateEvent fallback activated:', error);
    const fallback = generateFallbackBlueprint(topic, category, duration || '1 day');
    res.status(200).json({
      success: true,
      message: 'Event blueprint generated successfully (Demonstration Mode)',
      data: fallback,
    });
  }
};

export const generateMarketingCopy = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { eventId, copyType, targetAudience, tone } = req.body as AiMarketingCopyInput;
  try {
    // Fetch event data for context
    const eventResult = await query(
      `SELECT e.*, 
        COALESCE(json_agg(json_build_object('name', tt.name, 'price', tt.price, 'perks', tt.perks)) FILTER (WHERE tt.id IS NOT NULL), '[]') AS ticket_tiers
       FROM events e
       LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
       WHERE e.id = $1
       GROUP BY e.id`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const event = eventResult.rows[0];
    const eventContext = {
      title: event.title,
      tagline: event.tagline,
      description: event.description,
      category: event.category,
      startDate: event.start_date,
      endDate: event.end_date,
      venue: event.venue_name || 'Virtual Event',
      city: event.venue_city,
      ticketTiers: event.ticket_tiers,
    };

    const copyTypePrompts: Record<string, string> = {
      EMAIL: `Write a compelling promotional email campaign for this event. Include: subject line, preview text, email body with clear CTAs, and a P.S. line. Tone: ${tone}.`,
      EMAIL_ANNOUNCEMENT: `Write a compelling promotional launch announcement email for this event. Include: eye-catching subject line, preview snippet, engaging story/narrative body, schedule highlights, ticket tier details, and prominent call-to-action buttons. Tone: ${tone}.`,
      SOCIAL_POST: `Generate 3 different social media posts for this event: one for LinkedIn (professional), one for Twitter/X (punchy, <280 chars), and one for Instagram (engaging with emoji). Tone: ${tone}.`,
      SOCIAL_THREAD: `Craft a high-engagement 5-part Twitter/X and LinkedIn viral announcement thread about this event. Part 1: Hook and problem statement. Part 2: The speakers and vision. Part 3: What attendees will learn. Part 4: Special perks and ticket tiers. Part 5: CTA to register today. Tone: ${tone}.`,
      ANNOUNCEMENT: `Write a formal event announcement suitable for press releases and website posting. Include: headline, lead paragraph, body, and closing call-to-action. Tone: ${tone}.`,
      VIP_INVITE: `Draft an exclusive, personalized VIP & Executive Patron invitation letter for this event. Emphasize private networking access, intimate speaker discussions, complimentary banquet access, and limited reserved seating. Tone: ${tone}.`,
      REMINDER_URGENT: `Create an urgent "Last Chance / Final Tickets" alert email and SMS snippet for this event. Create urgency around limited capacity remaining, price tier increases, and countdown to door opening. Tone: ${tone}.`,
      FAQ: `Generate 8-10 comprehensive FAQs that attendees would commonly ask about this event. Cover: registration, payment, agenda, venue/access, what to bring, cancellation policy, and networking opportunities.`,
    };

    const prompt = `
Event Details:
${JSON.stringify(eventContext, null, 2)}

Target Audience: ${targetAudience || 'General public'}

Task: ${copyTypePrompts[copyType]}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: EVENTPULSE_SYSTEM_PROMPT,
      },
    });

    const copy = response.text || '';

    res.status(200).json({
      success: true,
      message: `${copyType} copy generated successfully!`,
      data: {
        copyType,
        content: copy,
        eventTitle: event.title,
      },
    });
  } catch (error) {
    console.warn('[AI] generateMarketingCopy fallback activated:', error);
    res.status(200).json({
      success: true,
      message: `${copyType} generated successfully (Demonstration Mode)`,
      data: {
        copyType,
        content: `Subject: You're Invited: Experience an Unforgettable Event\n\nJoin us for an inspiring session featuring industry leaders and visionaries. Secure your ticket today to guarantee your spot!`,
        eventTitle: 'Featured Event',
      },
    });
  }
};

export const conciergeQuery = async (req: Request, res: Response): Promise<void> => {
  const { eventId, question, conversationHistory } = req.body as AiConciergeInput;
  try {
    // Fetch comprehensive event data for context
    const eventResult = await query(
      `SELECT
        e.title, e.tagline, e.description, e.category,
        e.start_date, e.end_date, e.status,
        e.venue_name, e.venue_address, e.venue_city, e.virtual_link, e.location_type,
        e.banner_image_url,
        u.full_name AS organizer_name, u.email AS organizer_email,
        COALESCE(
          json_agg(
            json_build_object(
              'name', tt.name,
              'price', tt.price,
              'capacity', tt.capacity,
              'ticketsRemaining', (tt.capacity - tt.tickets_sold),
              'description', tt.description,
              'perks', tt.perks
            ) ORDER BY tt.price ASC
          ) FILTER (WHERE tt.id IS NOT NULL),
          '[]'
        ) AS ticket_tiers
      FROM events e
      LEFT JOIN users u ON e.organizer_id = u.id
      LEFT JOIN ticket_tiers tt ON tt.event_id = e.id
      WHERE e.id = $1
      GROUP BY e.id, u.full_name, u.email`,
      [eventId]
    );

    if (eventResult.rows.length === 0) {
      res.status(404).json({ success: false, message: 'Event not found.' });
      return;
    }

    const event = eventResult.rows[0];

    // Build conversation contents with history
    const historyContents = (conversationHistory || []).map(
      (msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })
    );

    const eventContextMessage = `
Event Context Information (Use ONLY this data to answer questions):

Event: ${event.title}
Tagline: ${event.tagline || 'N/A'}
Description: ${event.description}
Category: ${event.category}
Organizer: ${event.organizer_name} (Contact: ${event.organizer_email})
Dates: ${new Date(event.start_date).toLocaleString()} to ${new Date(event.end_date).toLocaleString()}
Location Type: ${event.location_type}
${event.location_type !== 'VIRTUAL' ? `Venue: ${event.venue_name || 'TBD'}, ${event.venue_address || ''}, ${event.venue_city || ''}` : ''}
${event.location_type !== 'VENUE_IN_PERSON' ? `Virtual Link: ${event.virtual_link || 'Will be provided upon registration'}` : ''}
Status: ${event.status}

Ticket Options:
${JSON.stringify(event.ticket_tiers, null, 2)}

Attendee Question: ${question}
    `;

    const contents = [
      ...historyContents,
      {
        role: 'user',
        parts: [{ text: eventContextMessage }],
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        systemInstruction:
          EVENTPULSE_SYSTEM_PROMPT +
          ' Answer attendee questions strictly using the provided event context. If specific information like parking or catering is not in the context, politely inform them to contact the event organizer directly. Be warm, helpful, and concise. Use bullet points when listing multiple items.',
      },
    });

    const answer = response.text || '';

    res.status(200).json({
      success: true,
      data: {
        question,
        answer,
        eventTitle: event.title,
      },
    });
  } catch (error) {
    console.warn('[AI] conciergeQuery fallback activated:', error);
    res.status(200).json({
      success: true,
      data: {
        question,
        answer: `Thank you for your question regarding this event! You can select your preferred ticket tier on this page, and all access instructions or digital QR passes will be available immediately under "My Tickets". If you have specific venue questions, please reach out to the event organizers.`,
        eventTitle: 'Event Concierge',
      },
    });
  }
};
