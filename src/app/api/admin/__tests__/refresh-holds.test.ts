import { GET } from '../refresh-holds/route';
import * as airtableLib from '@/lib/airtable';

// Mock the airtable library
jest.mock('@/lib/airtable', () => ({
  fetchAirtableRecords: jest.fn(),
  AIRTABLE_HOLDS_TABLE: 'tblHolds123'
}));

describe('/api/admin/refresh-holds', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch holds successfully', async () => {
    const mockHolds = [
      {
        id: 'hold1',
        fields: {
          customer_name: 'John Doe',
          customer_email: 'john@example.com',
          product_sku: 'GLOVES-001',
          hold_status: 'active',
          hold_expires_at: '2024-03-20T10:00:00.000Z',
          pickup_day: '2024-03-18T14:00:00.000Z'
        }
      },
      {
        id: 'hold2',
        fields: {
          customer_name: 'Jane Smith',
          customer_email: 'jane@example.com',
          product_sku: 'SHORTS-001',
          hold_status: 'expired',
          hold_expires_at: '2024-03-15T10:00:00.000Z',
          pickup_day: '2024-03-14T14:00:00.000Z'
        }
      }
    ];

    (airtableLib.fetchAirtableRecords as jest.Mock).mockResolvedValue(mockHolds);

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.holds).toEqual(mockHolds);
    expect(responseData.holds).toHaveLength(2);
    
    expect(airtableLib.fetchAirtableRecords).toHaveBeenCalledWith('tblHolds123');
  });

  it('should return empty array when no holds exist', async () => {
    (airtableLib.fetchAirtableRecords as jest.Mock).mockResolvedValue([]);

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.holds).toEqual([]);
    expect(responseData.holds).toHaveLength(0);
  });

  it('should handle Airtable fetch errors', async () => {
    (airtableLib.fetchAirtableRecords as jest.Mock).mockRejectedValue(
      new Error('Unable to connect to Airtable')
    );

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBeFalsy();
    expect(responseData.error).toBe('Unable to connect to Airtable');
  });

  it('should handle network timeout errors', async () => {
    (airtableLib.fetchAirtableRecords as jest.Mock).mockRejectedValue(
      new Error('Request timeout')
    );

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Request timeout');
  });

  it('should handle authentication errors', async () => {
    (airtableLib.fetchAirtableRecords as jest.Mock).mockRejectedValue(
      new Error('Invalid API key')
    );

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Invalid API key');
  });

  it('should handle non-Error exceptions', async () => {
    (airtableLib.fetchAirtableRecords as jest.Mock).mockRejectedValue(
      'Something went wrong'
    );

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Failed to refresh holds data');
  });

  it('should fetch holds with various statuses', async () => {
    const mockHolds = [
      {
        id: 'hold1',
        fields: {
          customer_name: 'Active Customer',
          hold_status: 'active',
          hold_expires_at: '2024-03-25T10:00:00.000Z'
        }
      },
      {
        id: 'hold2',
        fields: {
          customer_name: 'Expired Customer',
          hold_status: 'expired',
          hold_expires_at: '2024-03-10T10:00:00.000Z'
        }
      },
      {
        id: 'hold3',
        fields: {
          customer_name: 'Completed Customer',
          hold_status: 'completed',
          hold_expires_at: '2024-03-12T10:00:00.000Z'
        }
      }
    ];

    (airtableLib.fetchAirtableRecords as jest.Mock).mockResolvedValue(mockHolds);

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.holds).toHaveLength(3);
    
    const statuses = responseData.holds.map((hold: any) => hold.fields.hold_status);
    expect(statuses).toContain('active');
    expect(statuses).toContain('expired');
    expect(statuses).toContain('completed');
  });

  it('should handle holds with missing or null fields', async () => {
    const mockHolds = [
      {
        id: 'hold1',
        fields: {
          customer_name: 'John Doe',
          hold_status: 'active'
          // Missing some fields
        }
      },
      {
        id: 'hold2',
        fields: {
          customer_name: null,
          hold_status: 'expired',
          hold_expires_at: null
        }
      }
    ];

    (airtableLib.fetchAirtableRecords as jest.Mock).mockResolvedValue(mockHolds);

    const response = await GET();
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.holds).toEqual(mockHolds);
  });

  it('should maintain data integrity across refresh calls', async () => {
    const mockHolds = [
      {
        id: 'hold1',
        fields: {
          customer_name: 'Test Customer',
          product_sku: 'TEST-001',
          hold_status: 'active'
        }
      }
    ];

    (airtableLib.fetchAirtableRecords as jest.Mock).mockResolvedValue(mockHolds);

    // Make two consecutive calls
    const response1 = await GET();
    const response2 = await GET();
    
    const responseData1 = await response1.json();
    const responseData2 = await response2.json();

    expect(responseData1).toEqual(responseData2);
    expect(airtableLib.fetchAirtableRecords).toHaveBeenCalledTimes(2);
  });
});