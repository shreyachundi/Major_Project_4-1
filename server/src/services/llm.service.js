import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import { env } from '../config/env.js';

const gemini = new GoogleGenAI({ apiKey: env.geminiApiKey });
const groq = env.groqApiKey ? new Groq({ apiKey: env.groqApiKey }) : null;

/**
 * Call an LLM with automatic fallback across providers.
 * Tries Groq first (1,000/day free), falls back to Gemini (20/day free).
 */
export async function callLLM(prompt) {
  const errors = [];

  // Try Groq first (much higher free tier)
  if (groq) {
    try {
      console.log('🔵 Calling Groq (GPT-OSS 120B)...');
      const response = await groq.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2048,
      });
      const text = response.choices?.[0]?.message?.content || '';
      if (text) {
        console.log('✅ Groq responded');
        return { text, provider: 'groq' };
      }
    } catch (error) {
      console.error('❌ Groq failed:', error.message);
      errors.push({ provider: 'groq', error: error.message });
      // Fall through to Gemini
    }
  }

  // Fallback: Gemini
  try {
    console.log('🔵 Calling Gemini (fallback)...');
    const response = await gemini.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });
    console.log('✅ Gemini responded');
    return { text: response.text, provider: 'gemini' };
  } catch (error) {
    console.error('❌ Gemini failed:', error.message);
    errors.push({ provider: 'gemini', error: error.message });
  }

  // Both failed
  throw new Error(
    'All LLM providers failed. Errors: ' +
    errors.map(e => `${e.provider}: ${e.error}`).join(' | ')
  );
}

/**
 * Extract JSON from an LLM response even if it contains markdown fences.
 */
export function parseJSON(text) {
  const cleaned = text.trim().replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}