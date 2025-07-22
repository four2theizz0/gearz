import 'server-only';

export interface AirtableRecord {
  id: string;
  fields: Record<string, any>;
}

export interface HoldRecord {
  id: string;
  fields: {
    Products?: string[];
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    hold_status?: string;
    hold_expires_at?: string;
    pickup_day?: string;
    pickup_custom?: string;
    notes?: string;
  };
}

export interface ProductRecord {
  name: string;
  description: string;
  price: number;
  inventory: number;
  category: string;
  quality: string;
  brand?: string;
  size?: string;
  weight?: string;
  color?: string;
  image_url?: string;
  image_url_2?: string;
  image_url_3?: string;
  image_url_4?: string;
}

export const AIRTABLE_PAT = process.env.AIRTABLE_PAT;
export const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
export const AIRTABLE_PRODUCTS_TABLE = process.env.AIRTABLE_PRODUCTS_TABLE || 'Products';
export const AIRTABLE_HOLDS_TABLE = process.env.AIRTABLE_HOLDS_TABLE || 'Holds';
export const AIRTABLE_SALES_TABLE = process.env.AIRTABLE_SALES_TABLE || 'Sales';


export async function fetchAirtableRecords(tableName: string): Promise<AirtableRecord[]> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable API configuration');
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${tableName}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Airtable fetch failed: ${res.status}`);
  }

  const data = await res.json();
  return data.records;
}

export async function createProductRecord(productData: ProductRecord): Promise<AirtableRecord> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable API configuration');
  }

  // Clean up the data - remove undefined values and ensure proper types
  const cleanFields: Record<string, any> = {};
  
  // Required fields
  cleanFields.name = productData.name;
  cleanFields.description = productData.description;
  cleanFields.price = productData.price;
  cleanFields.inventory = productData.inventory;
  cleanFields.category = productData.category;
  cleanFields.quality = productData.quality;
  
  // Optional fields - only add if they have values
  const optionalFields = ['brand', 'size', 'weight', 'color', 'image_url', 'image_url_2', 'image_url_3', 'image_url_4'] as const;
  for (const field of optionalFields) {
    const value = productData[field];
    if (value && value.trim()) {
      cleanFields[field] = value.trim();
    }
  }


  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PRODUCTS_TABLE}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: cleanFields,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Airtable Create] Error response:', errorText);
    throw new Error(`Airtable create failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data;
}

export async function updateProductRecord(recordId: string, productData: Partial<ProductRecord>): Promise<AirtableRecord> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable API configuration');
  }

  // Clean up the data - remove undefined values and ensure proper types
  const cleanFields: Record<string, any> = {};
  
  // Handle all possible fields
  const allFields = ['name', 'description', 'price', 'inventory', 'category', 'quality', 'brand', 'size', 'weight', 'color', 'image_url', 'image_url_2', 'image_url_3', 'image_url_4'] as const;
  
  for (const field of allFields) {
    const value = productData[field];
    if (value !== undefined) {
      if (typeof value === 'string') {
        cleanFields[field] = value.trim() || null; // Use null to clear empty strings
      } else {
        cleanFields[field] = value;
      }
    }
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PRODUCTS_TABLE}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: cleanFields,
      typecast: true,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Airtable Update] Error response:', errorText);
    throw new Error(`Airtable update failed: ${res.status} - ${errorText}`);
  }

  const data = await res.json();
  return data;
}

export async function deleteProductRecord(recordId: string): Promise<void> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable API configuration');
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PRODUCTS_TABLE}/${recordId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
    },
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Airtable Delete] Error response:', errorText);
    throw new Error(`Airtable delete failed: ${res.status} - ${errorText}`);
  }
}

export async function markProductAsSold(recordId: string): Promise<AirtableRecord> {
  return updateProductRecord(recordId, { inventory: 0 });
}
