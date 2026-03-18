import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function GET() {
  const results: { v1: string[]; v1beta: string[] } = { v1: [], v1beta: [] };

  // v1 API 모델 목록
  try {
    const ai_v1 = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
      httpOptions: { apiVersion: 'v1' },
    });
    for await (const m of await ai_v1.models.list()) {
      if (m.name) results.v1.push(m.name);
    }
  } catch (e) {
    results.v1.push(`ERROR: ${String(e)}`);
  }

  // v1beta API 모델 목록
  try {
    const ai_v1beta = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY!,
    });
    for await (const m of await ai_v1beta.models.list()) {
      if (m.name) results.v1beta.push(m.name);
    }
  } catch (e) {
    results.v1beta.push(`ERROR: ${String(e)}`);
  }

  return NextResponse.json(results, { headers: { 'Content-Type': 'application/json' } });
}
