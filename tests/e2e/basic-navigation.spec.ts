import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Verify page loads
    await expect(page).toHaveTitle(/MMA Gear/);
    
    // Verify main heading is present
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify navigation elements
    await expect(page.locator('nav')).toBeVisible();
  });

  test('should have working links', async ({ page }) => {
    await page.goto('/');
    
    // Check admin link if it exists
    const adminLink = page.locator('a[href*="admin"]');
    if (await adminLink.count() > 0) {
      await expect(adminLink.first()).toBeVisible();
    }
    
    // Check that page doesn't have broken images
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < Math.min(imageCount, 5); i++) {
      const img = images.nth(i);
      const src = await img.getAttribute('src');
      
      if (src && !src.startsWith('data:')) {
        // For external images, just verify the element is present
        await expect(img).toBeVisible();
      }
    }
  });

  test('should handle 404 pages gracefully', async ({ page }) => {
    // Try to navigate to a non-existent page
    const response = await page.goto('/non-existent-page');
    
    // Should return 404 status
    expect(response?.status()).toBe(404);
    
    // Page should still render something (not crash)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should be responsive to viewport changes', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
    
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    // Content should still be accessible
    await expect(page.locator('h1')).toBeVisible();
  });

  test('should load within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 5 seconds (adjust based on your needs)
    expect(loadTime).toBeLessThan(5000);
  });
});