import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDatabase } from '@/lib/db';
import { getServiceRoleSupabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { device_id, pair_code } = body;

    // Validate inputs
    if (!device_id || typeof device_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing device_id. Example: "LP-4B89"' },
        { status: 400 }
      );
    }

    if (!pair_code || typeof pair_code !== 'string') {
      return NextResponse.json(
        { error: 'Invalid or missing pair_code. Must be a 6-digit code e.g. "839201"' },
        { status: 400 }
      );
    }

    const cleanDeviceId = device_id.trim().toUpperCase();
    const cleanPairCode = pair_code.trim();

    const db = getDatabase();
    const existing = db.prepare('SELECT id, device_id, status FROM devices WHERE device_id = ? OR device_identifier = ?').get(cleanDeviceId, cleanDeviceId) as any;

    const deviceUuid = existing?.id || crypto.randomUUID();
    const nowIso = new Date().toISOString();

    if (existing) {
      // Update existing device with new pair code & set to UNPAIRED
      db.prepare(`
        UPDATE devices 
        SET pair_code = ?, status = 'UNPAIRED', user_id = NULL, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(cleanPairCode, existing.id);
    } else {
      // Insert new device entry
      db.prepare(`
        INSERT INTO devices (id, device_id, device_identifier, pair_code, status, user_id, name, created_at, updated_at)
        VALUES (?, ?, ?, ?, 'UNPAIRED', NULL, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        deviceUuid,
        cleanDeviceId,
        cleanDeviceId,
        cleanPairCode,
        `LecturePod (${cleanDeviceId})`
      );
    }

    // Mirror to Supabase if configured
    if (isSupabaseConfigured) {
      const supabaseAdmin = getServiceRoleSupabase();
      if (supabaseAdmin) {
        await supabaseAdmin.from('devices').upsert(
          {
            id: deviceUuid,
            device_id: cleanDeviceId,
            pair_code: cleanPairCode,
            status: 'UNPAIRED',
            user_id: null,
            updated_at: nowIso,
          },
          { onConflict: 'device_id' }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Device successfully registered and waiting for pairing code verification.',
        device: {
          id: deviceUuid,
          device_id: cleanDeviceId,
          pair_code: cleanPairCode,
          status: 'UNPAIRED',
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error in /api/register-device:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while registering device.' },
      { status: 500 }
    );
  }
}
