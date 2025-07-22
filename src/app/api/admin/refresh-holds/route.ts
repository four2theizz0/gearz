import { NextResponse } from 'next/server';
import { fetchAirtableRecords, AIRTABLE_HOLDS_TABLE } from '@/lib/airtable';

export async function GET() {
  try {
    const holds = await fetchAirtableRecords(AIRTABLE_HOLDS_TABLE);
    
    return NextResponse.json({
      success: true,
      holds: holds
    });
  } catch (error) {
    console.error('[Refresh Holds] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to refresh holds data',
    }, { status: 500 });
  }
}