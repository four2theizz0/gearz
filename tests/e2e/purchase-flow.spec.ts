import { test, expect } from '@playwright/test';

test.describe('Purchase Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should complete full purchase flow successfully', async ({ page }) => {
    // 1. Navigate to homepage and verify product listing
    await expect(page.locator('h1')).toContainText('MMA Gear');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]', { timeout: 10000 });
    
    // Verify at least one product is displayed
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();

    // 2. Click on the first product to view details
    await productCards.first().click();
    
    // Verify product details are displayed
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="product-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="purchase-button"]')).toBeVisible();

    // 3. Click purchase button to open form
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Verify purchase form is displayed
    await expect(page.locator('[data-testid="purchase-form"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"]')).toBeVisible();

    // 4. Fill form with valid data
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    // Select pickup day
    await page.selectOption('select[name="pickupDay"]', 'Today');
    
    // Add optional notes
    await page.fill('textarea[name="notes"]', 'Test purchase via Playwright');

    // 5. Submit the form
    await page.locator('button[type="submit"]').click();
    
    // 6. Verify success state
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Request submitted successfully');
    
    // Verify form is cleared/hidden after successful submission
    await expect(page.locator('[data-testid="purchase-form"]')).not.toBeVisible();
  });

  test('should show validation errors for empty form', async ({ page }) => {
    // Navigate to first product and open purchase form
    const productCards = page.locator('[data-testid="product-card"]');
    await productCards.first().click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Try to submit empty form
    await page.locator('button[type="submit"]').click();
    
    // Verify validation errors appear
    await expect(page.locator('text=Name is required')).toBeVisible();
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Phone is required')).toBeVisible();
    await expect(page.locator('text=Pickup day is required')).toBeVisible();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    // Navigate to first product and open purchase form
    const productCards = page.locator('[data-testid="product-card"]');
    await productCards.first().click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Fill form with invalid email
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="pickupDay"]', 'Today');
    
    await page.locator('button[type="submit"]').click();
    
    // Verify email validation error
    await expect(page.locator('text=Please enter a valid email address')).toBeVisible();
  });

  test('should handle custom pickup time selection', async ({ page }) => {
    // Navigate to first product and open purchase form
    const productCards = page.locator('[data-testid="product-card"]');
    await productCards.first().click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Fill required fields
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    
    // Select "Other" pickup option
    await page.selectOption('select[name="pickupDay"]', 'Other');
    
    // Verify custom pickup input appears
    await expect(page.locator('input[name="otherPickup"]')).toBeVisible();
    
    // Fill custom pickup time
    await page.fill('input[name="otherPickup"]', 'Saturday afternoon at 2 PM');
    
    await page.locator('button[type="submit"]').click();
    
    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state during form submission', async ({ page }) => {
    // Navigate to first product and open purchase form
    const productCards = page.locator('[data-testid="product-card"]');
    await productCards.first().click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Fill form
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="pickupDay"]', 'Today');
    
    // Submit form and immediately check for loading state
    await page.locator('button[type="submit"]').click();
    
    // Verify loading spinner appears
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Verify submit button is disabled during loading
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    
    // Wait for success state
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/purchase-email', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' })
      });
    });
    
    // Navigate to first product and open purchase form
    const productCards = page.locator('[data-testid="product-card"]');
    await productCards.first().click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Fill and submit form
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="pickupDay"]', 'Today');
    
    await page.locator('button[type="submit"]').click();
    
    // Verify error message appears
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Server error');
    
    // Verify form remains visible for retry
    await expect(page.locator('[data-testid="purchase-form"]')).toBeVisible();
  });
});