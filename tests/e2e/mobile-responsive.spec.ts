import { test, expect } from '@playwright/test';

test.describe('Mobile Responsive Design', () => {
  test.beforeEach(async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
  });

  test('should display mobile-friendly navigation', async ({ page }) => {
    await page.goto('/');
    
    // On mobile, navigation might be collapsed into a hamburger menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    
    if (await mobileMenuButton.isVisible()) {
      // Test hamburger menu functionality
      await mobileMenuButton.click();
      
      // Menu should expand
      const mobileMenu = page.locator('[data-testid="mobile-menu"]');
      await expect(mobileMenu).toBeVisible();
      
      // Should contain navigation links
      await expect(page.locator('[data-testid="mobile-menu"] a')).toHaveCount(2); // Home, Admin
      
      // Close menu
      await mobileMenuButton.click();
      await expect(mobileMenu).not.toBeVisible();
    }
  });

  test('should have touch-friendly product cards', async ({ page }) => {
    await page.goto('/');
    
    // Wait for products to load
    await page.waitForSelector('[data-testid="product-card"]');
    
    // Product cards should be appropriately sized for touch
    const productCard = page.locator('[data-testid="product-card"]').first();
    
    // Check minimum touch target size (44px recommended)
    const boundingBox = await productCard.boundingBox();
    expect(boundingBox!.height).toBeGreaterThanOrEqual(44);
    
    // Should be tappable
    await productCard.tap();
    
    // Should navigate to product details
    await expect(page.locator('[data-testid="product-name"]')).toBeVisible();
  });

  test('should have mobile-optimized purchase form', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to product
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.tap();
    
    // Open purchase form
    await page.locator('[data-testid="purchase-button"]').tap();
    
    // Form should be properly sized for mobile
    const form = page.locator('[data-testid="purchase-form"]');
    await expect(form).toBeVisible();
    
    // Form inputs should be properly sized
    const nameInput = page.locator('input[name="name"]');
    const inputBox = await nameInput.boundingBox();
    expect(inputBox!.height).toBeGreaterThanOrEqual(44); // Touch-friendly height
    
    // Test form submission on mobile
    await nameInput.fill('Mobile Test User');
    await page.locator('input[name="email"]').fill('mobile@test.com');
    await page.locator('input[name="phone"]').fill('+1234567890');
    await page.locator('select[name="pickupDay"]').selectOption('Today');
    
    // Submit button should be touch-friendly
    const submitButton = page.locator('button[type="submit"]');
    const buttonBox = await submitButton.boundingBox();
    expect(buttonBox!.height).toBeGreaterThanOrEqual(44);
    
    await submitButton.tap();
    
    // Should show success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should handle image carousel on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to product with multiple images
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.tap();
    
    // Check if image carousel exists
    const carousel = page.locator('[data-testid="image-carousel"]');
    
    if (await carousel.isVisible()) {
      // Test swipe gestures (simulate with touch events)
      const carouselImage = carousel.locator('img').first();
      const imageBox = await carouselImage.boundingBox();
      
      if (imageBox) {
        // Swipe left (next image)
        await page.touchscreen.tap(imageBox.x + imageBox.width - 50, imageBox.y + imageBox.height / 2);
        
        // Wait for transition
        await page.waitForTimeout(500);
        
        // Verify carousel navigation worked
        const nextButton = page.locator('[data-testid="carousel-next"]');
        if (await nextButton.isVisible()) {
          await nextButton.tap();
          await page.waitForTimeout(500);
        }
        
        // Test previous navigation
        const prevButton = page.locator('[data-testid="carousel-prev"]');
        if (await prevButton.isVisible()) {
          await prevButton.tap();
        }
      }
    }
  });

  test('should display content properly in portrait orientation', async ({ page }) => {
    await page.goto('/');
    
    // Verify content fits within viewport
    const body = page.locator('body');
    const bodyBox = await body.boundingBox();
    
    // No horizontal scrolling should be needed
    expect(bodyBox!.width).toBeLessThanOrEqual(375);
    
    // Text should be readable (not too small)
    const productTitle = page.locator('[data-testid="product-title"]').first();
    if (await productTitle.isVisible()) {
      const fontSize = await productTitle.evaluate(el => getComputedStyle(el).fontSize);
      const fontSizeNum = parseFloat(fontSize);
      expect(fontSizeNum).toBeGreaterThanOrEqual(14); // Minimum readable size
    }
  });

  test('should handle landscape orientation', async ({ page }) => {
    // Switch to landscape
    await page.setViewportSize({ width: 667, height: 375 });
    await page.goto('/');
    
    // Content should still be properly arranged
    const productGrid = page.locator('[data-testid="product-grid"]');
    await expect(productGrid).toBeVisible();
    
    // Should show more products per row in landscape
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    if (count >= 2) {
      // Check that products are arranged horizontally
      const firstCard = await productCards.first().boundingBox();
      const secondCard = await productCards.nth(1).boundingBox();
      
      // Second card should be to the right of first card (not below)
      expect(secondCard!.x).toBeGreaterThan(firstCard!.x);
    }
  });

  test('should have proper spacing and margins on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Check that content has appropriate margins from screen edges
    const mainContent = page.locator('main');
    const contentBox = await mainContent.boundingBox();
    
    // Should have some margin from edges
    expect(contentBox!.x).toBeGreaterThan(0);
    expect(contentBox!.x).toBeLessThan(50); // But not too much on mobile
    
    // Elements should not overlap
    const productCards = page.locator('[data-testid="product-card"]');
    const cardCount = Math.min(await productCards.count(), 3); // Check first 3 cards
    
    for (let i = 0; i < cardCount - 1; i++) {
      const currentCard = await productCards.nth(i).boundingBox();
      const nextCard = await productCards.nth(i + 1).boundingBox();
      
      // Cards should not overlap
      const noOverlap = 
        currentCard!.y + currentCard!.height <= nextCard!.y || // One below the other
        currentCard!.x + currentCard!.width <= nextCard!.x ||  // One beside the other
        nextCard!.x + nextCard!.width <= currentCard!.x ||     // Other way around
        nextCard!.y + nextCard!.height <= currentCard!.y;
      
      expect(noOverlap).toBeTruthy();
    }
  });

  test('should show loading states properly on mobile', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to form
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.tap();
    await page.locator('[data-testid="purchase-button"]').tap();
    
    // Fill form
    await page.fill('input[name="name"]', 'Mobile User');
    await page.fill('input[name="email"]', 'mobile@test.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="pickupDay"]', 'Today');
    
    // Submit and check loading state
    await page.locator('button[type="submit"]').tap();
    
    // Loading spinner should be visible and appropriately sized
    const loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    await expect(loadingSpinner).toBeVisible();
    
    // Should not block the entire screen inappropriately
    const spinnerBox = await loadingSpinner.boundingBox();
    expect(spinnerBox!.width).toBeLessThan(100); // Reasonable size
    expect(spinnerBox!.height).toBeLessThan(100);
  });

  test('should handle tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    
    // Should show more products per row than mobile
    const productCards = page.locator('[data-testid="product-card"]');
    const count = await productCards.count();
    
    if (count >= 2) {
      const firstCard = await productCards.first().boundingBox();
      const secondCard = await productCards.nth(1).boundingBox();
      
      // On tablet, products might be side by side
      const sideBySide = secondCard!.x > firstCard!.x + firstCard!.width / 2;
      
      // Or in a grid layout - either way, layout should be different from mobile
      expect(sideBySide || secondCard!.y === firstCard!.y).toBeTruthy();
    }
    
    // Form should have better layout on tablet
    const productCard = productCards.first();
    await productCard.tap();
    await page.locator('[data-testid="purchase-button"]').tap();
    
    const form = page.locator('[data-testid="purchase-form"]');
    const formBox = await form.boundingBox();
    
    // Form might be wider on tablet
    expect(formBox!.width).toBeGreaterThan(300);
  });
});