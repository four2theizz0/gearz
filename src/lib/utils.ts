import { AirtableRecord, HoldRecord } from './airtable';

export function isProductOnHold(productId: string, holds: AirtableRecord[]): boolean {
  const now = new Date();
  return holds.some(hold => {
    const f = hold.fields;
    return (
      Array.isArray(f.Products) && f.Products.includes(productId) &&
      f.hold_status === 'Active' &&
      (!f.hold_expires_at || new Date(f.hold_expires_at) > now)
    );
  });
}

export function getProductImages(product: Record<string, any>): string[] {
  return [
    product.image_url,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4,
  ].filter(url => url && typeof url === 'string' && url.trim() !== '');
}