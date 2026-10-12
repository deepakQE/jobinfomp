import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request) {
  const query = new URL(request.url).searchParams.get('q')?.trim().slice(0, 80) || '';
  if (query.length < 2) return NextResponse.json([]);
  const { data } = await supabase.from('job_posts').select('slug, title, category').eq('is_published', true).ilike('title', `%${query.replace(/[%_]/g, '')}%`).order('created_at', { ascending: false }).limit(6);
  return NextResponse.json((data || []).map(({ slug, title, category }) => ({ slug, title, category })));
}