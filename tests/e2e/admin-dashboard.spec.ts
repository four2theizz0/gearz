import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin');
  });

  test('should require authentication to access admin panel', async ({ page }) => {
    // Should redirect to login or show login form
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toContainText('Sign in');
  });

  test('should reject invalid login credentials', async ({ page }) => {
    // Try to log in with invalid credentials
    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.locator('button[type="submit"]').click();
    
    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
  });

  test('should successfully log in with valid credentials', async ({ page }) => {
    // Use environment variables for admin credentials
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@mmageardemo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    await page.fill('input[name="email"]', adminEmail);
    await page.fill('input[name="password"]', adminPassword);
    await page.locator('button[type="submit"]').click();
    
    // Should redirect to admin dashboard
    await expect(page).toHaveURL('/admin/dashboard');
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
  });

  test.describe('Authenticated Admin Actions', () => {
    test.beforeEach(async ({ page }) => {
      // Log in before each test
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@mmageardemo.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      
      await page.fill('input[name="email"]', adminEmail);
      await page.fill('input[name="password"]', adminPassword);
      await page.locator('button[type="submit"]').click();
      
      await expect(page).toHaveURL('/admin/dashboard');
    });

    test('should display holds dashboard', async ({ page }) => {
      // Verify holds table is visible
      await expect(page.locator('[data-testid="holds-table"]')).toBeVisible();
      
      // Verify table headers
      await expect(page.locator('th')).toContainText(['Customer', 'Product', 'Status', 'Expires', 'Actions']);
      
      // Check if refresh button works
      await page.locator('[data-testid="refresh-holds-button"]').click();
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    });

    test('should extend hold expiration', async ({ page }) => {
      // Wait for holds to load
      await page.waitForSelector('[data-testid="holds-table"]');
      
      // Find first active hold and extend it
      const extendButton = page.locator('[data-testid="extend-hold-button"]').first();
      
      if (await extendButton.isVisible()) {
        // Get initial expiration time
        const initialExpiration = await page.locator('[data-testid="hold-expires"]').first().textContent();
        
        await extendButton.click();
        
        // Verify success toast
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        await expect(page.locator('[data-testid="toast-success"]')).toContainText('Hold extended');
        
        // Verify expiration time updated
        await page.waitForTimeout(1000); // Wait for UI update
        const newExpiration = await page.locator('[data-testid="hold-expires"]').first().textContent();
        expect(newExpiration).not.toBe(initialExpiration);
      }
    });

    test('should complete hold sale', async ({ page }) => {
      // Wait for holds to load
      await page.waitForSelector('[data-testid="holds-table"]');
      
      // Find first active hold and complete sale
      const completeButton = page.locator('[data-testid="complete-sale-button"]').first();
      
      if (await completeButton.isVisible()) {
        await completeButton.click();
        
        // Fill sale completion form
        await expect(page.locator('[data-testid="sale-form"]')).toBeVisible();
        
        await page.selectOption('select[name="payment_method"]', 'cash');
        await page.fill('input[name="transaction_id"]', 'TEST-TXN-001');
        await page.fill('input[name="final_price"]', '150');
        await page.fill('textarea[name="admin_notes"]', 'Playwright test completion');
        
        await page.locator('button[type="submit"]').click();
        
        // Verify success
        await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
        await expect(page.locator('[data-testid="toast-success"]')).toContainText('Sale completed');
        
        // Verify form closes
        await expect(page.locator('[data-testid="sale-form"]')).not.toBeVisible();
      }
    });

    test('should navigate to create product page', async ({ page }) => {
      await page.locator('[data-testid="create-product-link"]').click();
      
      await expect(page).toHaveURL('/admin/create');
      await expect(page.locator('h1')).toContainText('Create New Product');
      
      // Verify form fields are present
      await expect(page.locator('input[name="sku"]')).toBeVisible();
      await expect(page.locator('input[name="name"]')).toBeVisible();
      await expect(page.locator('input[name="price"]')).toBeVisible();
      await expect(page.locator('input[name="inventory"]')).toBeVisible();
    });

    test('should create new product', async ({ page }) => {
      // Navigate to create product page
      await page.locator('[data-testid="create-product-link"]').click();
      
      // Fill product form
      await page.fill('input[name="sku"]', 'TEST-E2E-001');
      await page.fill('input[name="name"]', 'Test Product via Playwright');
      await page.fill('textarea[name="description"]', 'This is a test product created by Playwright');
      await page.fill('input[name="price"]', '99.99');
      await page.fill('input[name="inventory"]', '5');
      await page.selectOption('select[name="category"]', 'Gloves');
      await page.selectOption('select[name="quality"]', 'New');
      await page.fill('input[name="brand"]', 'Test Brand');
      await page.fill('input[name="size"]', 'Large');
      await page.fill('input[name="weight"]', '2 lbs');
      await page.fill('input[name="color"]', 'Black');
      
      // Submit form
      await page.locator('button[type="submit"]').click();
      
      // Verify success
      await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
      await expect(page.locator('[data-testid="toast-success"]')).toContainText('Product created successfully');
      
      // Verify redirect to products list or dashboard
      await expect(page).toHaveURL(/\/(admin\/dashboard|admin\/products)/);
    });

    test('should handle form validation errors', async ({ page }) => {
      // Navigate to create product page
      await page.locator('[data-testid="create-product-link"]').click();
      
      // Try to submit empty form
      await page.locator('button[type="submit"]').click();
      
      // Verify validation errors
      await expect(page.locator('text=SKU is required')).toBeVisible();
      await expect(page.locator('text=Name is required')).toBeVisible();
      await expect(page.locator('text=Price is required')).toBeVisible();
    });

    test('should filter holds by status', async ({ page }) => {
      // Wait for holds table to load
      await page.waitForSelector('[data-testid="holds-table"]');
      
      // Check if status filter exists
      const statusFilter = page.locator('[data-testid="status-filter"]');
      
      if (await statusFilter.isVisible()) {
        // Filter by active holds
        await statusFilter.selectOption('active');
        
        // Verify only active holds are shown
        const holdRows = page.locator('[data-testid="hold-row"]');
        const count = await holdRows.count();
        
        for (let i = 0; i < count; i++) {
          const status = await holdRows.nth(i).locator('[data-testid="hold-status"]').textContent();
          expect(status?.toLowerCase()).toContain('active');
        }
        
        // Filter by expired holds
        await statusFilter.selectOption('expired');
        
        // Verify only expired holds are shown
        const expiredCount = await holdRows.count();
        for (let i = 0; i < expiredCount; i++) {
          const status = await holdRows.nth(i).locator('[data-testid="hold-status"]').textContent();
          expect(status?.toLowerCase()).toContain('expired');
        }
      }
    });

    test('should logout successfully', async ({ page }) => {
      // Click logout button
      await page.locator('[data-testid="logout-button"]').click();
      
      // Should redirect to login page
      await expect(page).toHaveURL('/admin');
      await expect(page.locator('input[name="email"]')).toBeVisible();
      
      // Verify user is logged out by trying to access dashboard directly
      await page.goto('/admin/dashboard');
      await expect(page).toHaveURL('/admin'); // Should redirect back to login
    });
  });
});