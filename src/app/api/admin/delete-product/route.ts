import { NextRequest, NextResponse } from 'next/server';
import { deleteProductRecord } from '@/lib/airtable';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    await deleteProductRecord(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Delete Product] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to delete product',
    }, { status: 500 });
  }
}