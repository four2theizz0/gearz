import { NextRequest, NextResponse } from 'next/server';
import { markProductAsSold } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updatedProduct = await markProductAsSold(id);

    return NextResponse.json({ 
      success: true,
      product: updatedProduct
    });
  } catch (error) {
    console.error('[Mark Product as Sold] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to mark product as sold',
    }, { status: 500 });
  }
}