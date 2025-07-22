import { NextRequest, NextResponse } from 'next/server';
import { convertHoldToSale } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const {
      holdId,
      payment_method,
      transaction_id,
      final_price,
      admin_notes
    } = await request.json();
    
    if (!holdId) {
      return NextResponse.json({ error: 'Hold ID is required' }, { status: 400 });
    }

    const result = await convertHoldToSale(holdId, {
      payment_method,
      transaction_id,
      final_price: final_price ? parseFloat(final_price) : undefined,
      admin_notes
    });

    return NextResponse.json({
      success: true,
      sale: result.sale,
      updatedProducts: result.updatedProducts
    });
  } catch (error) {
    console.error('[Complete Hold Sale] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to complete sale',
    }, { status: 500 });
  }
}