import { POST } from '../update-hold/route';
import { NextRequest } from 'next/server';
import * as airtableLib from '@/lib/airtable';

// Mock the airtable library
jest.mock('@/lib/airtable', () => ({
  updateHoldRecord: jest.fn()
}));

describe('/api/admin/update-hold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/admin/update-hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  it('should update hold successfully with all fields', async () => {
    const validRequestBody = {
      holdId: 'hold123',
      hold_status: 'active',
      hold_expires_at: '2024-03-20T10:00:00.000Z',
      pickup_day: '2024-03-18T14:00:00.000Z',
      pickup_custom: 'Saturday afternoon',
      notes: 'Customer requested weekend pickup'
    };

    const mockUpdatedHold = {
      id: 'hold123',
      fields: {
        hold_status: 'active',
        hold_expires_at: '2024-03-20T10:00:00.000Z',
        pickup_day: '2024-03-18T14:00:00.000Z',
        pickup_custom: 'Saturday afternoon',
        notes: 'Customer requested weekend pickup'
      }
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockResolvedValue(mockUpdatedHold);

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.hold).toEqual(mockUpdatedHold);
    
    expect(airtableLib.updateHoldRecord).toHaveBeenCalledWith('hold123', {
      hold_status: 'active',
      hold_expires_at: '2024-03-20T10:00:00.000Z',
      pickup_day: '2024-03-18T14:00:00.000Z',
      pickup_custom: 'Saturday afternoon',
      notes: 'Customer requested weekend pickup'
    });
  });

  it('should update hold with partial fields', async () => {
    const partialRequestBody = {
      holdId: 'hold123',
      hold_expires_at: '2024-03-25T10:00:00.000Z'
    };

    const mockUpdatedHold = {
      id: 'hold123',
      fields: {
        hold_expires_at: '2024-03-25T10:00:00.000Z'
      }
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockResolvedValue(mockUpdatedHold);

    const request = createRequest(partialRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    
    expect(airtableLib.updateHoldRecord).toHaveBeenCalledWith('hold123', {
      hold_expires_at: '2024-03-25T10:00:00.000Z'
    });
  });

  it('should return 400 for missing holdId', async () => {
    const invalidRequestBody = {
      hold_status: 'active'
    };

    const request = createRequest(invalidRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.error).toBe('Hold ID is required');
    expect(airtableLib.updateHoldRecord).not.toHaveBeenCalled();
  });

  it('should handle Airtable update errors', async () => {
    const validRequestBody = {
      holdId: 'hold123',
      hold_status: 'expired'
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockRejectedValue(
      new Error('Hold not found')
    );

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Hold not found');
  });

  it('should handle undefined values correctly', async () => {
    const requestBodyWithUndefined = {
      holdId: 'hold123',
      hold_status: 'active',
      hold_expires_at: undefined,
      pickup_day: null,
      notes: ''
    };

    const mockUpdatedHold = {
      id: 'hold123',
      fields: { hold_status: 'active', notes: '' }
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockResolvedValue(mockUpdatedHold);

    const request = createRequest(requestBodyWithUndefined);
    const response = await POST(request);

    expect(response.status).toBe(200);
    
    // Should only include defined values in the update
    expect(airtableLib.updateHoldRecord).toHaveBeenCalledWith('hold123', {
      hold_status: 'active',
      pickup_day: null,
      notes: ''
    });
  });

  it('should handle JSON parsing errors', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/update-hold', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json'
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toContain('Failed to update hold');
  });

  it('should handle database connection errors', async () => {
    const validRequestBody = {
      holdId: 'hold123',
      hold_status: 'expired'
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockRejectedValue(
      new Error('Unable to connect to Airtable')
    );

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.error).toBe('Unable to connect to Airtable');
  });

  it('should handle extending hold expiration (24 hour extension)', async () => {
    const currentTime = new Date('2024-03-15T10:00:00.000Z');
    const extendedTime = new Date('2024-03-16T10:00:00.000Z');

    const extendRequestBody = {
      holdId: 'hold123',
      hold_expires_at: extendedTime.toISOString()
    };

    const mockUpdatedHold = {
      id: 'hold123',
      fields: {
        hold_expires_at: extendedTime.toISOString()
      }
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockResolvedValue(mockUpdatedHold);

    const request = createRequest(extendRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.hold.fields.hold_expires_at).toBe(extendedTime.toISOString());
  });

  it('should update hold status to expired', async () => {
    const expireRequestBody = {
      holdId: 'hold123',
      hold_status: 'expired'
    };

    const mockUpdatedHold = {
      id: 'hold123',
      fields: {
        hold_status: 'expired'
      }
    };

    (airtableLib.updateHoldRecord as jest.Mock).mockResolvedValue(mockUpdatedHold);

    const request = createRequest(expireRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.hold.fields.hold_status).toBe('expired');
  });
});