import 'server-only';

interface ImageKitResponse {
  url: string;
  fileId: string;
  name: string;
}

interface ImageKitOptions {
  width?: number;
  height?: number;
  format?: string;
  quality?: number;
  crop?: string;
}

/**
 * ImageKit.io Integration
 * 
 * ImageKit.io is an image optimization and delivery service. This module handles
 * image uploads to ImageKit and URL generation for optimized image delivery.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create an ImageKit account at https://imagekit.io
 * 2. Get your Public Key, Private Key, and URL Endpoint from the dashboard
 * 3. Add the keys to your .env file
 * 
 * API DOCUMENTATION:
 * https://imagekit.io/docs/api-reference/upload-file/upload-file#Upload-file-V1
 */

const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export async function uploadImageToImageKit(file: File): Promise<string> {
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_URL_ENDPOINT) {
    throw new Error('Missing ImageKit configuration.');
  }

  // Get base64 and prefix
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString('base64');
  const mimeType = file.type || 'image/jpeg';
  const fileString = `data:${mimeType};base64,${base64}`;

  // Prepare form data
  const params = new URLSearchParams();
  params.append('file', fileString);
  params.append('fileName', file.name);
  params.append('folder', 'gear');
  params.append('useUniqueFileName', 'true');
  params.append('tags', 'mma-gear,product');
  params.append('responseFields', 'url,fileId,name');

  const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`ImageKit upload failed: ${response.status} - ${errorText}`);
  }

  const data: ImageKitResponse = await response.json();
  return data.url;
}

export async function uploadMultipleImagesToImageKit(files: (File | null)[]): Promise<string[]> {
  const uploadPromises = files
    .filter((file): file is File => file !== null)
    .map(uploadImageToImageKit);

  return Promise.all(uploadPromises);
}

export function getImageKitUrl(imagePath: string, options?: ImageKitOptions): string {
  if (!IMAGEKIT_URL_ENDPOINT) {
    throw new Error('Missing ImageKit URL endpoint');
  }

  const baseUrl = `https://${IMAGEKIT_URL_ENDPOINT}`;
  const params = new URLSearchParams();
  
  if (options?.width) params.append('w', options.width.toString());
  if (options?.height) params.append('h', options.height.toString());
  if (options?.format) params.append('f', options.format);
  if (options?.quality) params.append('q', options.quality.toString());
  if (options?.crop) params.append('c', options.crop);
  
  const queryString = params.toString();
  return `${baseUrl}/${imagePath}${queryString ? `?${queryString}` : ''}`;
}

export function deleteImageFromImageKit(fileId: string): Promise<void> {
  if (!IMAGEKIT_PRIVATE_KEY) {
    throw new Error('Missing ImageKit private key');
  }

  return fetch('https://api.imagekit.io/v1/files/' + fileId, {
    method: 'DELETE',
    headers: {
      'Authorization': `Basic ${Buffer.from(IMAGEKIT_PRIVATE_KEY + ':').toString('base64')}`,
      'Content-Type': 'application/json',
    },
  }).then(response => {
    if (!response.ok) {
      throw new Error(`Failed to delete image: ${response.status}`);
    }
  });
} 