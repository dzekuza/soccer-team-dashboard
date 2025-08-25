import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    // Fetch both event drafts and fixture drafts
    const [eventDraftsResult, fixtureDraftsResult] = await Promise.all([
      supabase
        .from('event_drafts')
        .select('*')
        .order('date', { ascending: true }),
      supabase
        .from('fixtures_all_new')
        .select('*')
        .eq('is_draft', true)
        .order('match_date', { ascending: true })
    ]);

    if (eventDraftsResult.error) {
      console.error('Error fetching event drafts:', eventDraftsResult.error);
    }

    if (fixtureDraftsResult.error) {
      console.error('Error fetching fixture drafts:', fixtureDraftsResult.error);
    }

    // Transform fixture drafts to match event draft format
    const fixtureDrafts = (fixtureDraftsResult.data || []).map(fixture => ({
      id: fixture.id,
      title: `${fixture.team1} vs ${fixture.team2}`,
      date: fixture.match_date,
      time: fixture.match_time,
      team1_name: fixture.team1,
      team2_name: fixture.team2,
      location: fixture.venue,
      league: fixture.league_key,
      status: fixture.status,
      round: fixture.round,
      used_at: fixture.used_at,
      created_at: fixture.created_at,
      updated_at: fixture.updated_at,
      is_fixture: true // Flag to identify fixture drafts
    }));

    // Combine both types of drafts
    const allDrafts = [
      ...(eventDraftsResult.data || []),
      ...fixtureDrafts
    ].sort((a, b) => {
      const dateA = new Date(a.date || a.match_date);
      const dateB = new Date(b.date || b.match_date);
      return dateA.getTime() - dateB.getTime();
    });

    return NextResponse.json(allDrafts);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
