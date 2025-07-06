import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { z } from 'zod';

const searchSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number().default(25), // miles
  specialty: z.string().optional(),
  insurance: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = {
      latitude: parseFloat(searchParams.get('lat') || '0'),
      longitude: parseFloat(searchParams.get('lng') || '0'),
      radius: parseInt(searchParams.get('radius') || '25'),
      specialty: searchParams.get('specialty') || undefined,
      insurance: searchParams.get('insurance') || undefined,
    };

    const { latitude, longitude, radius, specialty, insurance } = searchSchema.parse(params);

    // Build query
    let query = supabaseAdmin
      .from('healthcare_providers')
      .select('*');

    // Add specialty filter
    if (specialty && specialty !== 'all') {
      query = query.ilike('specialty', `%${specialty}%`);
    }

    // Add insurance filter
    if (insurance) {
      query = query.contains('accepted_insurance', [insurance]);
    }

    const { data: providers, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Calculate distances and filter by radius
    const providersWithDistance = providers
      .map(provider => {
        const distance = calculateDistance(
          latitude,
          longitude,
          provider.latitude,
          provider.longitude
        );
        return { ...provider, distance };
      })
      .filter(provider => provider.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json({ providers: providersWithDistance });
  } catch (error) {
    console.error('Provider search error:', error);
    return NextResponse.json(
      { error: 'Failed to search providers' },
      { status: 500 }
    );
  }
}

// Haversine formula to calculate distance between two points
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI/180);
}