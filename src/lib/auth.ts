import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET!;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

if (!process.env.JWT_SECRET || !process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
  throw new Error('Missing required environment variables: JWT_SECRET, ADMIN_EMAIL, or ADMIN_PASSWORD');
}

export interface AdminUser {
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

/**
 * Verify admin credentials against environment variables
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  try {
    // Check email
    if (email.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      return false;
    }

    // For simplicity, we'll do a direct password comparison
    // In production, you might want to hash the password in the env vars
    return password === ADMIN_PASSWORD;
  } catch (error) {
    console.error('Error verifying admin credentials:', error);
    return false;
  }
}

/**
 * Generate JWT token for admin user
 */
export function generateAdminToken(email: string): string {
  const payload: AdminUser = {
    email: email.toLowerCase(),
    role: 'admin'
  };

  return jwt.sign(payload, JWT_SECRET, { 
    expiresIn: '24h' // Token expires in 24 hours
  });
}

/**
 * Verify and decode JWT token
 */
export function verifyToken(token: string): AdminUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Type guard to ensure the decoded token has the expected structure
    if (
      typeof decoded === 'object' &&
      decoded !== null &&
      'email' in decoded &&
      'role' in decoded &&
      typeof decoded.email === 'string' &&
      decoded.role === 'admin'
    ) {
      return {
        email: decoded.email,
        role: 'admin',
        iat: 'iat' in decoded && typeof decoded.iat === 'number' ? decoded.iat : undefined,
        exp: 'exp' in decoded && typeof decoded.exp === 'number' ? decoded.exp : undefined,
      };
    }
    
    return null;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Get admin user from request cookies
 */
export function getAdminFromRequest(request: NextRequest): AdminUser | null {
  try {
    const token = request.cookies.get('admin-token')?.value;
    if (!token) {
      return null;
    }
    return verifyToken(token);
  } catch (error) {
    console.error('Error getting admin from request:', error);
    return null;
  }
}

/**
 * Get admin user from server-side cookies
 */
export function getAdminFromCookies(): AdminUser | null {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('admin-token')?.value;
    if (!token) {
      return null;
    }
    return verifyToken(token);
  } catch (error) {
    console.error('Error getting admin from cookies:', error);
    return null;
  }
}

/**
 * Check if user is authenticated admin
 */
export function isAuthenticated(): boolean {
  try {
    const admin = getAdminFromCookies();
    return admin !== null && admin.role === 'admin';
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
}

/**
 * Middleware helper to verify admin authentication
 */
export function requireAdminAuth(request: NextRequest): AdminUser | null {
  const admin = getAdminFromRequest(request);
  
  if (!admin || admin.role !== 'admin') {
    return null;
  }
  
  return admin;
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(token: string): string {
  // Return cookie string for Set-Cookie header
  // Only use Secure flag in production (HTTPS)
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  return `admin-token=${token}; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`; // 24 hours
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(): string {
  // Only use Secure flag in production (HTTPS)
  const secure = process.env.NODE_ENV === 'production' ? 'Secure; ' : '';
  return `admin-token=; HttpOnly; ${secure}SameSite=Strict; Path=/; Max-Age=0`;
}