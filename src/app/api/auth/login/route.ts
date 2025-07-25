import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminCredentials, generateAdminToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Verify credentials
    const isValid = await verifyAdminCredentials(email, password);
    
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateAdminToken(email);
    
    // Create response with token
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: { email: email.toLowerCase(), role: 'admin' }
    });

    // Set HttpOnly cookie
    response.headers.set('Set-Cookie', setAuthCookie(token));

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}