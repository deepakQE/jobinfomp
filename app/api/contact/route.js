import { NextResponse } from 'next/server';
import { z } from 'zod';

const schema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  message: z.string().trim().min(10).max(2000),
  company: z.string().max(0).optional().or(z.literal('')),
});
const attempts = new Map();

export async function POST(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recent = attempts.get(ip) || [];
  const active = recent.filter((timestamp) => now - timestamp < 60 * 60 * 1000);
  if (active.length >= 5) return NextResponse.json({ message: 'Too many messages. Please try again later.' }, { status: 429 });
  const form = await request.formData();
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return NextResponse.json({ message: 'Please check the form and try again.' }, { status: 400 });
  if (parsed.data.company) return NextResponse.json({ message: 'Message received.' });
  attempts.set(ip, [...active, now]);
  return NextResponse.json({ message: 'Message received. We will review it shortly.' });
}