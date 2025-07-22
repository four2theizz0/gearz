import { NextRequest, NextResponse } from 'next/server';
import { fetchAirtableRecords, AIRTABLE_PRODUCTS_TABLE } from '@/lib/airtable';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const field = searchParams.get('field');
    
    if (!field) {
      return NextResponse.json(
        { success: false, error: 'Field parameter is required' },
        { status: 400 }
      );
    }

    // Valid fields that we want to fetch values for
    const validFields = ['category', 'quality', 'brand', 'size', 'weight', 'color'];
    
    if (!validFields.includes(field)) {
      return NextResponse.json(
        { success: false, error: 'Invalid field name' },
        { status: 400 }
      );
    }

    // Fetch all products
    const records = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);
    
    // Extract unique values for the specified field
    const values = new Set<string>();
    records.forEach(record => {
      const value = record.fields[field];
      if (value && typeof value === 'string' && value.trim()) {
        values.add(value.trim());
      }
    });

    // Convert to sorted array
    const uniqueValues = Array.from(values).sort();

    return NextResponse.json({ 
      success: true, 
      field,
      values: uniqueValues 
    });
  } catch (error: any) {
    console.error('Error fetching field values:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch field values' },
      { status: 500 }
    );
  }
} 