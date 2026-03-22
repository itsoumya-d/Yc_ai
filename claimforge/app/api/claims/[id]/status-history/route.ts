import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify claim ownership
    const { data: claim, error: claimError } = await supabase
      .from('claims')
      .select('id, title, status, created_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 });
    }

    // Fetch audit trail
    const { data: history, error } = await supabase
      .from('claim_status_history')
      .select('id, previous_status, new_status, changed_by, notes, metadata, created_at')
      .eq('claim_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      claim_id: id,
      claim_title: claim.title,
      current_status: claim.status,
      history: history ?? [],
      total_transitions: history?.length ?? 0,
    });
  } catch (err) {
    console.error('[Status History]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch status history' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { new_status, notes, metadata } = await request.json();
    if (!new_status) {
      return NextResponse.json({ error: 'new_status is required' }, { status: 400 });
    }

    // Get current status
    const { data: claim } = await supabase
      .from('claims')
      .select('status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!claim) return NextResponse.json({ error: 'Claim not found' }, { status: 404 });

    // Insert history record
    const { data: entry, error } = await supabase
      .from('claim_status_history')
      .insert({
        claim_id: id,
        previous_status: claim.status,
        new_status,
        changed_by: user.id,
        notes: notes ?? null,
        metadata: metadata ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    // Update claim status
    await supabase.from('claims').update({ status: new_status }).eq('id', id);

    return NextResponse.json({ entry, message: `Status updated to ${new_status}` });
  } catch (err) {
    console.error('[Status History POST]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Status update failed' },
      { status: 500 }
    );
  }
}
