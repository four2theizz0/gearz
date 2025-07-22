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

// Hold Management Functions
export async function updateHoldRecord(holdId: string, updates: {
  hold_status?: string;
  hold_expires_at?: string;
  pickup_day?: string;
  pickup_custom?: string;
  notes?: string;
}): Promise<AirtableRecord> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable API configuration');
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HOLDS_TABLE}/${holdId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: updates,
      typecast: true,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Airtable Update Hold] Error response:', errorText);
    throw new Error(`Airtable hold update failed: ${res.status} - ${errorText}`);
  }

  return await res.json();
}

// Sales Record Management
export async function createSaleRecord(saleData: {
  product_ids: string[];
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  sale_date: string;
  payment_method?: string;
  transaction_id?: string;
  final_price: number;
  admin_notes?: string;
}): Promise<AirtableRecord> {
  if (!AIRTABLE_PAT || !AIRTABLE_BASE_ID) {
    throw new Error('Missing Airtable API configuration');
  }

  const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_SALES_TABLE}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        Products: saleData.product_ids, // Link to products
        customer_name: saleData.customer_name,
        customer_email: saleData.customer_email,
        customer_phone: saleData.customer_phone || '',
        sale_date: saleData.sale_date,
        payment_method: saleData.payment_method || '',
        transaction_id: saleData.transaction_id || '',
        final_price: saleData.final_price,
        admin_notes: saleData.admin_notes || '',
      },
      typecast: true,
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('[Airtable Create Sale] Error response:', errorText);
    throw new Error(`Airtable sale creation failed: ${res.status} - ${errorText}`);
  }

  return await res.json();
}

// Complete Hold → Sale Conversion
export async function convertHoldToSale(holdId: string, saleDetails: {
  payment_method?: string;
  transaction_id?: string;
  final_price?: number;
  admin_notes?: string;
}): Promise<{ sale: AirtableRecord; updatedProducts: AirtableRecord[] }> {
  // First, get the hold details
  const holdUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_HOLDS_TABLE}/${holdId}`;
  const holdRes = await fetch(holdUrl, {
    headers: {
      Authorization: `Bearer ${AIRTABLE_PAT}`,
    },
  });

  if (!holdRes.ok) {
    throw new Error('Hold not found');
  }

  const hold = await holdRes.json();
  const holdFields = hold.fields;

  if (!holdFields.Products || holdFields.Products.length === 0) {
    throw new Error('No products associated with this hold');
  }

  // Calculate final price if not provided
  let finalPrice = saleDetails.final_price;
  if (!finalPrice) {
    // Get product prices to calculate total
    const productPrices = await Promise.all(
      holdFields.Products.map(async (productId: string) => {
        const productUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_PRODUCTS_TABLE}/${productId}`;
        const productRes = await fetch(productUrl, {
          headers: { Authorization: `Bearer ${AIRTABLE_PAT}` },
        });
        const product = await productRes.json();
        return parseFloat(product.fields.price) || 0;
      })
    );
    finalPrice = productPrices.reduce((sum, price) => sum + price, 0);
  }

  // Create sale record
  const sale = await createSaleRecord({
    product_ids: holdFields.Products,
    customer_name: holdFields.customer_name,
    customer_email: holdFields.customer_email,
    customer_phone: holdFields.customer_phone,
    sale_date: new Date().toISOString(),
    payment_method: saleDetails.payment_method,
    transaction_id: saleDetails.transaction_id,
    final_price: finalPrice!,
    admin_notes: saleDetails.admin_notes,
  });

  // Update products inventory to 0 (sold)
  const updatedProducts = await Promise.all(
    holdFields.Products.map((productId: string) =>
      updateProductRecord(productId, { inventory: 0 })
    )
  );

  // Update hold status to completed
  await updateHoldRecord(holdId, {
    hold_status: 'Completed',
  });

  return { sale, updatedProducts };
}
