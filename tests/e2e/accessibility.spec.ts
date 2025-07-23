import { test, expect } from '@playwright/test';

test.describe('Accessibility Tests', () => {
  test('should have proper heading hierarchy on homepage', async ({ page }) => {
    await page.goto('/');
    
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveCount(1); // Only one h1 per page
    
    // Verify heading hierarchy (h1 -> h2 -> h3, etc.)
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    
    for (let i = 0; i < headings.length - 1; i++) {
      const currentLevel = parseInt(await headings[i].evaluate(el => el.tagName.charAt(1)));
      const nextLevel = parseInt(await headings[i + 1].evaluate(el => el.tagName.charAt(1)));
      
      // Next heading should not skip more than one level
      expect(nextLevel - currentLevel).toBeLessThanOrEqual(1);
    }
  });

  test('should have skip-to-content link', async ({ page }) => {
    await page.goto('/');
    
    // Tab to focus the skip link
    await page.keyboard.press('Tab');
    
    // Verify skip link becomes visible when focused
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
    await expect(skipLink).toContainText('Skip to main content');
    
    // Click skip link and verify focus moves to main content
    await skipLink.click();
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('should have proper form labels and accessibility attributes', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to a product and open purchase form
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Verify all form inputs have proper labels
    const nameInput = page.locator('input[name="name"]');
    await expect(nameInput).toHaveAttribute('aria-label');
    
    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toHaveAttribute('aria-label');
    
    const phoneInput = page.locator('input[name="phone"]');
    await expect(phoneInput).toHaveAttribute('aria-label');
    
    // Verify required fields are marked appropriately
    await expect(nameInput).toHaveAttribute('required');
    await expect(emailInput).toHaveAttribute('required');
    await expect(phoneInput).toHaveAttribute('required');
    
    // Verify form has proper ARIA attributes
    const form = page.locator('[data-testid="purchase-form"]');
    await expect(form).toHaveAttribute('role', 'form');
  });

  test('should be navigable using keyboard only', async ({ page }) => {
    await page.goto('/');
    
    // Navigate through the page using only keyboard
    let tabCount = 0;
    const maxTabs = 20; // Reasonable limit to prevent infinite loop
    
    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;
      
      // Check if we can reach a product card
      const focusedElement = page.locator(':focus');
      const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase()).catch(() => '');
      
      if (tagName === 'button' || tagName === 'a') {
        const text = await focusedElement.textContent().catch(() => '');
        if (text && (text.includes('Purchase') || text.includes('View'))) {
          // Found a product interaction element
          await focusedElement.press('Enter');
          break;
        }
      }
    }
    
    // Verify we can navigate the purchase form with keyboard
    await page.keyboard.press('Tab'); // Should focus first form field
    await page.keyboard.type('Test Customer');
    
    await page.keyboard.press('Tab'); // Move to email field
    await page.keyboard.type('test@example.com');
    
    await page.keyboard.press('Tab'); // Move to phone field
    await page.keyboard.type('+1234567890');
    
    // Use keyboard to select pickup day
    await page.keyboard.press('Tab'); // Move to pickup select
    await page.keyboard.press('ArrowDown'); // Select an option
    
    await page.keyboard.press('Tab'); // Move to submit button
    await page.keyboard.press('Enter'); // Submit form
    
    // Verify form submission worked
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible({ timeout: 10000 });
  });

  test('should have proper image alt text', async ({ page }) => {
    await page.goto('/');
    
    // Wait for images to load
    await page.waitForLoadState('networkidle');
    
    // Check all images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      
      // Alt text should exist and not be empty
      expect(alt).toBeTruthy();
      expect(alt?.trim()).not.toBe('');
      
      // Decorative images should have empty alt=""
      const role = await img.getAttribute('role');
      if (role === 'presentation' || role === 'none') {
        expect(alt).toBe('');
      }
    }
  });

  test('should have sufficient color contrast', async ({ page }) => {
    await page.goto('/');
    
    // This is a basic test - in real scenarios you'd use axe-core or similar
    // Check that text is visible and readable
    const textElements = page.locator('p, h1, h2, h3, h4, h5, h6, span, div').filter({ hasText: /.+/ });
    const count = await textElements.count();
    
    for (let i = 0; i < Math.min(count, 10); i++) { // Check first 10 text elements
      const element = textElements.nth(i);
      await expect(element).toBeVisible();
      
      // Verify text is not hidden or transparent
      const opacity = await element.evaluate(el => getComputedStyle(el).opacity);
      expect(parseFloat(opacity)).toBeGreaterThan(0.1);
    }
  });

  test('should handle focus management properly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to product and open modal/form
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Focus should move to the first form element
    const firstInput = page.locator('input[name="name"]');
    await expect(firstInput).toBeFocused();
    
    // Close form/modal and verify focus returns
    const closeButton = page.locator('[data-testid="close-form"]');
    if (await closeButton.isVisible()) {
      await closeButton.click();
      
      // Focus should return to the purchase button or product card
      const purchaseButton = page.locator('[data-testid="purchase-button"]');
      await expect(purchaseButton).toBeFocused();
    }
  });

  test('should announce dynamic content changes to screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to product form
    const productCard = page.locator('[data-testid="product-card"]').first();
    await productCard.click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Fill form to trigger success message
    await page.fill('input[name="name"]', 'Test Customer');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="phone"]', '+1234567890');
    await page.selectOption('select[name="pickupDay"]', 'Today');
    
    await page.locator('button[type="submit"]').click();
    
    // Verify success message has proper ARIA live region
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toHaveAttribute('aria-live', 'polite');
    
    // Test error message aria-live as well
    await page.goto('/');
    await productCard.click();
    await page.locator('[data-testid="purchase-button"]').click();
    
    // Submit empty form to trigger errors
    await page.locator('button[type="submit"]').click();
    
    const errorMessage = page.locator('[data-testid="error-message"]').first();
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    }
  });

  test('should have proper landmarks and regions', async ({ page }) => {
    await page.goto('/');
    
    // Verify main landmark exists
    const main = page.locator('main, [role="main"]');
    await expect(main).toBeVisible();
    
    // Verify navigation landmark
    const nav = page.locator('nav, [role="navigation"]');
    await expect(nav).toBeVisible();
    
    // Check for header/banner
    const header = page.locator('header, [role="banner"]');
    await expect(header).toBeVisible();
    
    // Check for footer/contentinfo if it exists
    const footer = page.locator('footer, [role="contentinfo"]');
    if (await footer.count() > 0) {
      await expect(footer).toBeVisible();
    }
  });
});