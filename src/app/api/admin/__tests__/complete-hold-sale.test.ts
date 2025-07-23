import { POST } from '../complete-hold-sale/route';
import { NextRequest } from 'next/server';
import * as airtableLib from '@/lib/airtable';

// Mock the airtable library
jest.mock('@/lib/airtable', () => ({
  convertHoldToSale: jest.fn()
}));

describe('/api/admin/complete-hold-sale', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/admin/complete-hold-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  it('should complete hold sale successfully', async () => {
    const validRequestBody = {
      holdId: 'hold123',
      payment_method: 'cash',
      transaction_id: 'txn456',
      final_price: 150,
      admin_notes: 'Customer paid in cash'
    };

    const mockSaleResult = {
      sale: { id: 'sale123', fields: { customer_name: 'John Doe' } },
      updatedProducts: [{ id: 'rec123', fields: { inventory: 0 } }]
    };

    (airtableLib.convertHoldToSale as jest.Mock).mockResolvedValue(mockSaleResult);

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    expect(responseData.sale).toEqual(mockSaleResult.sale);
    expect(responseData.updatedProducts).toEqual(mockSaleResult.updatedProducts);
    
    expect(airtableLib.convertHoldToSale).toHaveBeenCalledWith('hold123', {
      payment_method: 'cash',
      transaction_id: 'txn456',
      final_price: 150,
      admin_notes: 'Customer paid in cash'
    });
  });

  it('should return 400 for missing holdId', async () => {
    const incompleteRequestBody = {
      payment_method: 'cash',
      final_price: 150
    };

    const request = createRequest(incompleteRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Hold ID is required');
  });

  it('should handle Airtable conversion errors', async () => {
    const validRequestBody = {
      holdId: 'hold123',
      payment_method: 'cash'
    };

    (airtableLib.convertHoldToSale as jest.Mock).mockRejectedValue(
      new Error('Hold not found or already processed')
    );

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Hold not found or already processed');
  });

  it('should accept optional fields', async () => {
    const minimalRequestBody = {
      holdId: 'hold123'
    };

    const mockSaleResult = {
      sale: { id: 'sale123' },
      updatedProducts: []
    };

    (airtableLib.convertHoldToSale as jest.Mock).mockResolvedValue(mockSaleResult);

    const request = createRequest(minimalRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    
    expect(airtableLib.convertHoldToSale).toHaveBeenCalledWith('hold123', {
      payment_method: undefined,
      transaction_id: undefined,
      final_price: undefined,
      admin_notes: undefined
    });
  });

  it('should validate final_price as number', async () => {
    const requestBody = {
      holdId: 'hold123',
      final_price: 'not-a-number'
    };

    const request = createRequest(requestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Final price must be a valid number');
  });

  it('should handle JSON parsing errors', async () => {
    const request = new NextRequest('http://localhost:3000/api/admin/complete-hold-sale', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid-json'
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });

  it('should handle database connection errors', async () => {
    const validRequestBody = {
      holdId: 'hold123',
      payment_method: 'card'
    };

    (airtableLib.convertHoldToSale as jest.Mock).mockRejectedValue(
      new Error('Unable to connect to Airtable')
    );

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Unable to connect to Airtable');
  });
});