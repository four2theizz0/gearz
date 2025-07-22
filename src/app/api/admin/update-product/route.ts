import { NextRequest, NextResponse } from 'next/server';
import { updateProductRecord } from '@/lib/airtable';
import { uploadImageToImageKit } from '@/lib/imagekit';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const id = formData.get('id') as string;
    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Extract form fields
    const productData: any = {};
    
    // Basic fields
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = formData.get('price') as string;
    const inventory = formData.get('inventory') as string;
    const category = formData.get('category') as string;
    const quality = formData.get('quality') as string;

    if (name) productData.name = name;
    if (description) productData.description = description;
    if (price) productData.price = parseFloat(price);
    if (inventory) productData.inventory = parseInt(inventory, 10);
    if (category) productData.category = category;
    if (quality) productData.quality = quality;

    // Optional fields
    const optionalFields = ['brand', 'size', 'weight', 'color'] as const;
    for (const field of optionalFields) {
      const value = formData.get(field) as string;
      if (value !== null) {
        productData[field] = value || null; // Use null for empty strings
      }
    }

    // Handle existing images
    for (let i = 0; i < 4; i++) {
      const existingImage = formData.get(`image_url_${i}`) as string;
      const imageField = i === 0 ? 'image_url' : `image_url_${i + 1}`;
      
      if (existingImage !== null) {
        productData[imageField] = existingImage || null;
      }
    }

    // Handle new image uploads
    for (let i = 0; i < 4; i++) {
      const newImage = formData.get(`new_image_${i}`) as File;
      if (newImage && newImage.size > 0) {
        try {
          const imageUrl = await uploadImageToImageKit(newImage);
          const imageField = i === 0 ? 'image_url' : `image_url_${i + 1}`;
          productData[imageField] = imageUrl;
        } catch (error) {
          console.error(`Failed to upload new image ${i}:`, error);
          return NextResponse.json({ 
            error: `Failed to upload image ${i + 1}` 
          }, { status: 500 });
        }
      }
    }

    // Update the product in Airtable
    const updatedProduct = await updateProductRecord(id, productData);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('[Update Product] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update product',
    }, { status: 500 });
  }
}