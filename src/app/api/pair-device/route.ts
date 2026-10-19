import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';
import { getServiceRoleSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate web student
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required. Please sign in to link your Lecture Pod.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { pair_code } = body;

    // 2. Validate input
    if (!pair_code || typeof pair_code !== 'string') {
      return NextResponse.json(
        { error: 'Missing pair_code. Please provide the 6-digit code displayed on your device.' },
        { status: 400 }
      );
    }

    const cleanPairCode = pair_code.trim();
    if (cleanPairCode.length < 4) {
      return NextResponse.json(
        { error: 'Invalid pairing code format. Please check the code on your Lecture Pod screen.' },
        { status: 400 }
      );
    }

    const db = getDatabase();

    // 3. Find UNPAIRED device with matching pair_code
    const device = db.prepare(`
      SELECT id, device_id, device_identifier, status, pair_code, created_at 
      FROM devices 
      WHERE (pair_code = ? OR pair_code = ?) AND status = 'UNPAIRED'
    `).get(cleanPairCode, cleanPairCode.toUpperCase()) as any;

    if (!device) {
      return NextResponse.json(
        { 
          error: 'No unpaired Lecture Pod found matching this code. Please verify the code on your device screen or generate a new code.' 
        },
        { status: 404 }
      );
    }

    const resolvedDeviceId = device.device_id || device.device_identifier || 'LP-UNKNOWN';
    const nowIso = new Date().toISOString();

    // 4. Update status to PAIRED and associate with logged in user
    db.prepare(`
      UPDATE devices 
      SET status = 'PAIRED', user_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(user.id, device.id);

    // 5. Update Supabase if configured
    if (isSupabaseConfigured) {
      const supabaseAdmin = getServiceRoleSupabase();
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('devices')
          .update({
            status: 'PAIRED',
            user_id: user.id,
            updated_at: nowIso,
          })
          .eq('id', device.id);
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: `Device ${resolvedDeviceId} successfully linked to ${user.full_name}'s account!`,
        device: {
          id: device.id,
          device_id: resolvedDeviceId,
          status: 'PAIRED',
        },
        owner: {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('Error in /api/pair-device:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while pairing device.' },
      { status: 500 }
    );
  }
}
