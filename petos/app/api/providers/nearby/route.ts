import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') ?? '');
    const lng = parseFloat(searchParams.get('lng') ?? '');
    const radius_km = parseFloat(searchParams.get('radius_km') ?? '10');
    const specialty = searchParams.get('specialty') ?? null;

    if (isNaN(lat) || isNaN(lng)) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    // Use Google Places API if available, otherwise return mock data
    const googleKey = process.env.GOOGLE_PLACES_API_KEY;
    if (googleKey) {
      const query = specialty ? `${specialty} veterinarian` : 'veterinarian';
      const googleUrl =
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
        `?location=${lat},${lng}&radius=${radius_km * 1000}&keyword=${encodeURIComponent(query)}&key=${googleKey}`;
      const res = await fetch(googleUrl);
      const json = await res.json();
      const providers = (json.results ?? []).slice(0, 10).map((p: any) => ({
        id: p.place_id,
        name: p.name,
        address: p.vicinity,
        rating: p.rating,
        open_now: p.opening_hours?.open_now ?? null,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        distance_km: null,
      }));
      return NextResponse.json({ providers });
    }

    // Fallback: query supabase vet_providers table
    const { data: providers } = await supabase
      .from('vet_providers')
      .select('id, name, address, phone, specialty, rating, lat, lng')
      .limit(20);

    return NextResponse.json({ providers: providers ?? [] });
  } catch (err) {
    console.error('[Providers Nearby]', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to fetch providers' },
      { status: 500 }
    );
  }
}
