import { isProductOnHold, getProductImages } from '../utils';

describe('utils', () => {
  describe('isProductOnHold', () => {
    const mockProductId = 'rec123';
    
    it('should return true when product is on active hold', () => {
      const holds = [
        {
          id: 'hold1',
          fields: {
            Products: ['rec123'],
            hold_status: 'Active',
            hold_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
          }
        }
      ];
      
      expect(isProductOnHold(mockProductId, holds)).toBe(true);
    });

    it('should return false when product has no holds', () => {
      const holds: any[] = [];
      expect(isProductOnHold(mockProductId, holds)).toBe(false);
    });

    it('should return false when hold is expired', () => {
      const holds = [
        {
          id: 'hold1',
          fields: {
            Products: ['rec123'],
            hold_status: 'Active',
            hold_expires_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 24 hours ago
          }
        }
      ];
      
      expect(isProductOnHold(mockProductId, holds)).toBe(false);
    });

    it('should return false when hold status is not Active', () => {
      const holds = [
        {
          id: 'hold1',
          fields: {
            Products: ['rec123'],
            hold_status: 'Cancelled',
            hold_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          }
        }
      ];
      
      expect(isProductOnHold(mockProductId, holds)).toBe(false);
    });

    it('should return true when hold has no expiration date', () => {
      const holds = [
        {
          id: 'hold1',
          fields: {
            Products: ['rec123'],
            hold_status: 'Active',
            hold_expires_at: null
          }
        }
      ];
      
      expect(isProductOnHold(mockProductId, holds)).toBe(true);
    });

    it('should handle case insensitive hold status', () => {
      const holds = [
        {
          id: 'hold1',
          fields: {
            Products: ['rec123'],
            hold_status: 'active',
            hold_expires_at: null
          }
        }
      ];
      
      expect(isProductOnHold(mockProductId, holds)).toBe(false); // Should be false as it's case sensitive
    });
  });

  describe('getProductImages', () => {
    it('should return all available image URLs', () => {
      const product = {
        image_url: 'https://example.com/image1.jpg',
        image_url_2: 'https://example.com/image2.jpg',
        image_url_3: 'https://example.com/image3.jpg',
        image_url_4: 'https://example.com/image4.jpg'
      };

      const result = getProductImages(product);
      expect(result).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image2.jpg',
        'https://example.com/image3.jpg',
        'https://example.com/image4.jpg'
      ]);
    });

    it('should filter out null/undefined image URLs', () => {
      const product = {
        image_url: 'https://example.com/image1.jpg',
        image_url_2: null,
        image_url_3: 'https://example.com/image3.jpg',
        image_url_4: undefined
      };

      const result = getProductImages(product);
      expect(result).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image3.jpg'
      ]);
    });

    it('should return empty array when no images are available', () => {
      const product = {
        name: 'Test Product',
        price: '$100'
      };

      const result = getProductImages(product);
      expect(result).toEqual([]);
    });

    it('should filter out empty string image URLs', () => {
      const product = {
        image_url: 'https://example.com/image1.jpg',
        image_url_2: '',
        image_url_3: 'https://example.com/image3.jpg',
        image_url_4: '   '
      };

      const result = getProductImages(product);
      expect(result).toEqual([
        'https://example.com/image1.jpg',
        'https://example.com/image3.jpg'
      ]);
    });
  });
});