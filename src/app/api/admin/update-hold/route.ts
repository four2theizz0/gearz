import { NextRequest, NextResponse } from 'next/server';
import { updateHoldRecord } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const {
      holdId,
      hold_status,
      hold_expires_at,
      pickup_day,
      pickup_custom,
      notes
    } = await request.json();
    
    if (!holdId) {
      return NextResponse.json({ error: 'Hold ID is required' }, { status: 400 });
    }

    const updates: any = {};
    if (hold_status !== undefined) updates.hold_status = hold_status;
    if (hold_expires_at !== undefined) updates.hold_expires_at = hold_expires_at;
    if (pickup_day !== undefined) updates.pickup_day = pickup_day;
    if (pickup_custom !== undefined) updates.pickup_custom = pickup_custom;
    if (notes !== undefined) updates.notes = notes;

    const updatedHold = await updateHoldRecord(holdId, updates);

    return NextResponse.json({
      success: true,
      hold: updatedHold
    });
  } catch (error) {
    console.error('[Update Hold] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update hold',
    }, { status: 500 });
  }
}