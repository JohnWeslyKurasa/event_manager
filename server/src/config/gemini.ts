import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from both local and root workspace directories
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ [Gemini] GEMINI_API_KEY not found in environment. AI features will run in mock demonstration mode.');
}

export const ai = new GoogleGenAI({ apiKey: apiKey || 'demo_key_placeholder' });
export const isGeminiConfigured = Boolean(apiKey && !apiKey.startsWith('demo_key'));

export const EVENTPULSE_SYSTEM_PROMPT = `You are EventPulse AI, an expert event production strategist, copywriter, and virtual concierge assistant. Your mandate is to assist event organizers in crafting high-converting, professional, detailed event experiences and to provide attendees with accurate, helpful, welcoming event guidance. When outputting structured schemas, adhere strictly to the JSON format provided. Do not hallucinate venue details or policies not explicitly provided. Maintain an engaging, professional, and accessible tone.`;
