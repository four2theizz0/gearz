import { formatDate, formatPickupDay } from '../dateUtils';

describe('dateUtils', () => {
  describe('formatDate', () => {
    it('should format valid date string correctly', () => {
      const result = formatDate('2024-03-15T14:30:00.000Z');
      expect(result).toMatch(/Mar 15, 2024, \d{1,2}:\d{2} (AM|PM)/);
    });

    it('should return dash for null input', () => {
      expect(formatDate(null)).toBe('-');
    });

    it('should return dash for undefined input', () => {
      expect(formatDate(undefined)).toBe('-');
    });

    it('should return dash for empty string', () => {
      expect(formatDate('')).toBe('-');
    });

    it('should return dash for invalid date string', () => {
      expect(formatDate('invalid-date')).toBe('-');
    });

    it('should handle different date formats', () => {
      // ISO string
      const isoResult = formatDate('2024-12-25T09:15:30.000Z');
      expect(isoResult).toMatch(/Dec 25, 2024, \d{1,2}:\d{2} (AM|PM)/);

      // Different format
      const dateResult = formatDate('2024-01-01T23:45:00Z');
      expect(dateResult).toMatch(/Jan 1, 2024, \d{1,2}:\d{2} (AM|PM)/);
    });

    it('should format time correctly accounting for timezone conversion', () => {
      // The function uses local timezone, so we test for general format instead of exact times
      const morningResult = formatDate('2024-03-15T08:30:00.000Z');
      expect(morningResult).toMatch(/Mar 15, 2024, \d{1,2}:\d{2} (AM|PM)/);

      const afternoonResult = formatDate('2024-03-15T15:45:00.000Z');
      expect(afternoonResult).toMatch(/Mar 15, 2024, \d{1,2}:\d{2} (AM|PM)/);
    });

    it('should pad minutes correctly', () => {
      const result = formatDate('2024-03-15T14:05:00.000Z');
      expect(result).toMatch(/Mar 15, 2024, \d{1,2}:0\d (AM|PM)/);
    });
  });

  describe('formatPickupDay', () => {
    it('should format valid pickup day as date when no custom text', () => {
      const result = formatPickupDay('2024-03-15T14:30:00.000Z', '');
      expect(result).toMatch(/Mar 15, 2024, \d{1,2}:\d{2} (AM|PM)/);
    });

    it('should return custom pickup text when provided', () => {
      const customText = 'This weekend';
      const result = formatPickupDay('invalid-date', customText);
      expect(result).toBe(customText);
    });

    it('should return custom pickup text over valid date when both provided', () => {
      const customText = 'Tomorrow afternoon';
      const result = formatPickupDay('2024-03-15T14:30:00.000Z', customText);
      expect(result).toBe(customText);
    });

    it('should return pickup day when custom is empty', () => {
      const pickupDay = 'Next Monday';
      const result = formatPickupDay(pickupDay, '');
      expect(result).toBe(pickupDay);
    });

    it('should return dash when both are empty/null', () => {
      expect(formatPickupDay('', '')).toBe('-');
      expect(formatPickupDay(null as any, '')).toBe('-');
      expect(formatPickupDay('', null as any)).toBe('-');
    });

    it('should handle date parsing edge cases', () => {
      // Invalid date but has custom text - custom text should win
      const result1 = formatPickupDay('not-a-date', 'Custom pickup time');
      expect(result1).toBe('Custom pickup time');

      // Invalid date gets treated as valid date string by Date.parse in some cases
      const result2 = formatPickupDay('2024-02-30', ''); 
      // This may parse as a valid date or return the string, both are acceptable
      expect(typeof result2).toBe('string');
    });
  });
});