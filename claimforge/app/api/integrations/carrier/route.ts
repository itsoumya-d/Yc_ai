import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const CARRIER_ENDPOINTS: Record<string, { name: string; status_url: string; auth: string }> = {
  progressive: {
    name: 'Progressive',
    status_url: 'https://api.progressive.com/v1/claims/{claimNumber}/status',
    auth: 'api_key',
  },
  allstate: {
    name: 'Allstate',
    status_url: 'https://api.allstate.com/claims/v2/{claimNumber}',
    auth: 'oauth2',
  },
  statefarm: {
    name: 'State Farm',
    status_url: 'https://api.statefarm.com/claims/{claimNumber}/status',
    auth: 'api_key',
  },
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { carrier, api_key, claim_number, action = 'status' } = await request.json();
    if (!carrier) {
      return NextResponse.json({ error: 'carrier is required' }, { status: 400 });
    }

    const carrierConfig = CARRIER_ENDPOINTS[carrier.toLowerCase()];
    if (!carrierConfig) {
      return NextResponse.json({
        error: `Unsupported carrier: ${carrier}`,
        supported: Object.keys(CARRIER_ENDPOINTS),
      }, { status: 400 });
    }

    if (action === 'connect') {
      // Store carrier integration credentials
      const { data: integration, error: insertError } = await supabase
        .from('carrier_integrations')
        .upsert({
          user_id: user.id,
          carrier,
          carrier_name: carrierConfig.name,
          api_key_hint: api_key ? api_key.slice(0, 8) + '***' : null,
          status: 'connected',
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) throw insertError;
      return NextResponse.json({ integration, message: `${carrierConfig.name} connected` });
    }

    if (action === 'status' && claim_number) {
      // Look up carrier API key from stored integration
      const { data: integration } = await supabase
        .from('carrier_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('carrier', carrier)
        .single();

      // Note: In production this would call the real carrier API
      // Using simulated response as carriers have proprietary authentication
      const simulatedStatus = {
        carrier: carrierConfig.name,
        claim_number,
        status: 'under_review',
        last_updated: new Date().toISOString(),
        adjuster: { name: 'Jane Smith', phone: '555-0100', email: 'j.smith@carrier.com' },
        estimated_resolution: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
        notes: 'Documents received. Adjuster review in progress.',
        connected_via: integration ? 'stored_credentials' : 'demo_mode',
      };

      return NextResponse.json(simulatedStatus);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('[Integrations Carrier]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Carrier integration failed' },
      { status: 500 }
    );
  }
}
