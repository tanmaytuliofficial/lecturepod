import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getDatabase } from '@/lib/db';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  try {
    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Device name cannot be empty.' }, { status: 400 });
    }

    const db = getDatabase();
    const result = db.prepare(`
      UPDATE devices 
      SET name = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).run(name.trim(), id, user.id);

    if (result.changes === 0) {
      return NextResponse.json({ error: 'Device not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Device renamed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update device' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const db = getDatabase();

  const result = db.prepare('DELETE FROM devices WHERE id = ? AND user_id = ?').run(id, user.id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Device not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Device unlinked from account.' });
}
