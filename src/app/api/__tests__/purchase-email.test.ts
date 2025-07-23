import { POST } from '../purchase-email/route';
import { NextRequest } from 'next/server';

// Mock environment variables
const mockEnv = {
  RESEND_API_KEY: 'test-api-key',
  RESEND_FROM_EMAIL: 'noreply@mmageardemo.com',
  ADMIN_EMAIL: 'admin@test.com',
  AIRTABLE_PAT: 'test-pat',
  AIRTABLE_BASE_ID: 'test-base',
  AIRTABLE_HOLDS_TABLE: 'Holds'
};

describe('/api/purchase-email', () => {
  beforeEach(() => {
    // Mock environment variables
    process.env = { ...process.env, ...mockEnv };
    jest.clearAllMocks();
    
    // Reset fetch mock
    global.fetch = jest.fn();
  });

  afterEach(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach(key => {
      delete process.env[key];
    });
  });

  const createRequest = (body: any) => {
    return new NextRequest('http://localhost:3000/api/purchase-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  };

  it('should send purchase email successfully', async () => {
    const validRequestBody = {
      productId: 'rec123',
      productName: 'Boxing Gloves',
      productPrice: 150,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      pickupDay: 'Today',
      notes: 'Please call before delivery'
    };

    // Mock fetch responses for Airtable and Resend
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        // First call: Airtable hold creation
        ok: true,
        json: async () => ({ id: 'hold123' })
      })
      .mockResolvedValueOnce({
        // Second call: Admin email
        ok: true,
        text: async () => 'success'
      })
      .mockResolvedValueOnce({
        // Third call: User confirmation email
        ok: true,
        text: async () => 'success'
      });

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(200);
    expect(responseData.success).toBe(true);
    
    // Verify fetch was called 3 times (Airtable + 2 emails)
    expect(global.fetch).toHaveBeenCalledTimes(3);
    
    // Verify Airtable call
    expect(global.fetch).toHaveBeenNthCalledWith(1, 
      expect.stringContaining('api.airtable.com'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-pat'
        })
      })
    );
    
    // Verify Resend admin email call
    expect(global.fetch).toHaveBeenNthCalledWith(2,
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-api-key'
        }),
        body: expect.stringContaining('New Local Pickup Request: Boxing Gloves')
      })
    );
    
    // Verify Resend user email call
    expect(global.fetch).toHaveBeenNthCalledWith(3,
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('Thank you for your purchase request')
      })
    );
  });

  it('should return 400 for missing required fields', async () => {
    const incompleteRequestBody = {
      productName: 'Boxing Gloves',
      // Missing productId, productPrice, name, email, phone, pickupDay
    };

    const request = createRequest(incompleteRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Missing required fields');
  });

  it('should return 400 for invalid email format', async () => {
    const invalidEmailBody = {
      productId: 'rec123',
      productName: 'Boxing Gloves',
      productPrice: 150,
      name: 'John Doe',
      email: 'invalid-email',
      phone: '+1234567890',
      pickupDay: 'Today'
    };

    const request = createRequest(invalidEmailBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Invalid email format');
  });

  it('should handle email service failures', async () => {
    const validRequestBody = {
      productId: 'rec123',
      productName: 'Boxing Gloves',
      productPrice: 150,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      pickupDay: 'Today'
    };

    // Mock Airtable success, then Resend failure
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'hold123' })
      })
      .mockResolvedValueOnce({
        ok: false,
        text: async () => 'Email service unavailable'
      });

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toBe('Email service unavailable');
  });

  it('should handle missing environment variables', async () => {
    // Remove required environment variables
    delete process.env.RESEND_API_KEY;
    delete process.env.ADMIN_EMAIL;

    const validRequestBody = {
      productId: 'rec123',
      productName: 'Boxing Gloves',
      productPrice: 150,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      pickupDay: 'Today'
    };

    const request = createRequest(validRequestBody);
    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(500);
    expect(responseData.success).toBe(false);
    expect(responseData.error).toContain('Missing email configuration');
  });

  it('should include all provided information in email', async () => {
    const completeRequestBody = {
      productId: 'rec123',
      productName: 'Boxing Gloves',
      productPrice: 150,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      pickupDay: 'Tomorrow',
      otherPickup: 'Saturday afternoon',
      notes: 'Please handle with care'
    };

    // Mock all three API calls successfully
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'hold123' })
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'success'
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => 'success'
      });

    const request = createRequest(completeRequestBody);
    await POST(request);

    // Check the admin email call (2nd fetch call)
    const adminEmailCall = (global.fetch as jest.Mock).mock.calls[1];
    const adminEmailBody = JSON.parse(adminEmailCall[1].body);
    
    expect(adminEmailBody.html).toContain('John Doe');
    expect(adminEmailBody.html).toContain('john@example.com');
    expect(adminEmailBody.html).toContain('+1234567890');
    expect(adminEmailBody.html).toContain('Boxing Gloves');
    expect(adminEmailBody.html).toContain('$150');
    expect(adminEmailBody.html).toContain('Tomorrow');
    expect(adminEmailBody.html).toContain('Please handle with care');
    
    // Check the user email call (3rd fetch call)
    const userEmailCall = (global.fetch as jest.Mock).mock.calls[2];
    const userEmailBody = JSON.parse(userEmailCall[1].body);
    
    expect(userEmailBody.html).toContain('John Doe');
    expect(userEmailBody.html).toContain('Boxing Gloves');
    expect(userEmailBody.html).toContain('$150');
    expect(userEmailBody.html).toContain('Tomorrow');
    expect(userEmailBody.html).toContain('Please handle with care');
  });

  it('should handle non-JSON request body', async () => {
    const request = new NextRequest('http://localhost:3000/api/purchase-email', {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: 'invalid-json'
    });

    const response = await POST(request);
    const responseData = await response.json();

    expect(response.status).toBe(400);
    expect(responseData.success).toBe(false);
  });
});