import { NextRequest, NextResponse } from 'next/server';
import { uploadMultipleImagesToImageKit } from '@/lib/imagekit';
import { createProductRecord } from '@/lib/airtable';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Validate required fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const priceStr = formData.get('price') as string;
    const inventoryStr = formData.get('inventory') as string;
    const category = formData.get('category') as string;
    const quality = formData.get('quality') as string;
    
    if (!name || !description || !priceStr || !inventoryStr || !category || !quality) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const price = parseFloat(priceStr);
    const inventory = parseInt(inventoryStr);
    
    if (isNaN(price) || price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid price value' },
        { status: 400 }
      );
    }
    
    if (isNaN(inventory) || inventory < 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid inventory value' },
        { status: 400 }
      );
    }
    
    // Extract product data
    const productData = {
      name,
      description,
      price,
      inventory,
      category,
      quality,
      brand: formData.get('brand') as string || undefined,
      size: formData.get('size') as string || undefined,
      weight: formData.get('weight') as string || undefined,
      color: formData.get('color') as string || undefined,
    };

    // Extract images
    const images: (File | null)[] = [];
    for (let i = 0; i < 4; i++) {
      const image = formData.get(`image_${i}`) as File | null;
      images.push(image);
    }

    // Upload images to ImageKit
    let imageUrls: string[] = [];
    try {
      imageUrls = await uploadMultipleImagesToImageKit(images);
    } catch (error) {
      // Continue without images if upload fails
      imageUrls = [];
    }

    // Prepare final product data with image URLs
    const finalProductData = {
      ...productData,
      image_url: imageUrls[0] || undefined,
      image_url_2: imageUrls[1] || undefined,
      image_url_3: imageUrls[2] || undefined,
      image_url_4: imageUrls[3] || undefined,
    };

    // Create product in Airtable
    const result = await createProductRecord(finalProductData);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 500 }
    );
  }
} 