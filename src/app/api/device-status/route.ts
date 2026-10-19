import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import { getServiceRoleSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceIdParam = searchParams.get('device_id');

    if (!deviceIdParam || typeof deviceIdParam !== 'string') {
      return NextResponse.json(
        { error: 'Missing required query parameter: device_id. Example: ?device_id=LP-4B89' },
        { status: 400 }
      );
    }

    const cleanDeviceId = deviceIdParam.trim().toUpperCase();
    const db = getDatabase();

    // Query device in SQLite database
    const device = db.prepare(`
      SELECT d.id, d.device_id, d.device_identifier, d.status, d.user_id, d.updated_at,
             p.full_name as owner_name, p.email as owner_email
      FROM devices d
      LEFT JOIN profiles p ON d.user_id = p.id
      WHERE UPPER(d.device_id) = ? OR UPPER(d.device_identifier) = ?
    `).get(cleanDeviceId, cleanDeviceId) as any;

    if (!device) {
      // Optional check in Supabase if configured
      if (isSupabaseConfigured) {
        const supabaseAdmin = getServiceRoleSupabase();
        if (supabaseAdmin) {
          const { data: supaDevice } = await supabaseAdmin
            .from('devices')
            .select('*, profiles:user_id(full_name, email)')
            .ilike('device_id', cleanDeviceId)
            .maybeSingle();

          if (supaDevice) {
            const isPaired = supaDevice.status === 'PAIRED' && Boolean(supaDevice.user_id);
            return NextResponse.json({
              status: isPaired ? 'PAIRED' : 'UNPAIRED',
              user_name: isPaired ? (supaDevice.profiles?.full_name || 'Tanmay Tuli') : null,
              device_id: supaDevice.device_id,
            });
          }
        }
      }

      return NextResponse.json(
        { 
          status: 'UNPAIRED',
          user_name: null,
          device_id: cleanDeviceId,
          error: `Device ${cleanDeviceId} is not yet registered in system.` 
        },
        { status: 404 }
      );
    }

    const isPaired = device.status === 'PAIRED' && Boolean(device.user_id);
    const resolvedOwnerName = isPaired ? (device.owner_name || 'Tanmay Tuli') : null;

    // Return the exact JSON required for Raspberry Pi edge polling
    return NextResponse.json({
      status: isPaired ? 'PAIRED' : 'UNPAIRED',
      user_name: resolvedOwnerName,
      device_id: device.device_id || device.device_identifier || cleanDeviceId,
      ...(isPaired && {
        user_id: device.user_id,
        owner_email: device.owner_email,
        paired_at: device.updated_at,
      }),
    });
  } catch (err: any) {
    console.error('Error in /api/device-status:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error checking device status.' },
      { status: 500 }
    );
  }
}
