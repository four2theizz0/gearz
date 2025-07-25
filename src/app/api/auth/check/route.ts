import { NextRequest, NextResponse } from 'next/server';
import { getAdminFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request);
    
    if (admin && admin.role === 'admin') {
      return NextResponse.json({ 
        authenticated: true, 
        user: { email: admin.email, role: admin.role }
      });
    } else {
      return NextResponse.json({ 
        authenticated: false 
      });
    }
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ 
      authenticated: false 
    });
  }
}