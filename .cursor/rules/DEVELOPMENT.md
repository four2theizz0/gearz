# MMA Gear E-commerce Site - Development Guide

> **Updated with Phase 2 Quality & Reliability improvements including comprehensive testing, accessibility enhancements, and mobile-first responsive design.**

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Airtable account with Personal Access Token (PAT)
- ImageKit account with API keys
- Resend account for email notifications
- Modern browser with developer tools

### Initial Setup

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd mma-gear-site
npm install
```

2. **Environment Setup**
```bash
# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual values
# See "Environment Variables" section below
```

3. **Start Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see your site.
Admin dashboard: `http://localhost:3000/admin`

## 🎯 Current Features & Status

### ✅ Completed Features (Phase 1 & 2)
- **E-commerce Core**: Product browsing, purchase requests, hold management
- **Admin Dashboard**: Authentication, hold management, sales completion
- **Accessibility**: WCAG 2.1 AA compliance, keyboard navigation, screen reader support
- **Mobile Responsive**: Touch-friendly, responsive design across all devices
- **Testing Suite**: Unit tests, integration tests, end-to-end tests
- **Error Handling**: Comprehensive error states and user feedback
- **Loading States**: Loading indicators for all async operations
- **Toast Notifications**: Success/error feedback system
- **Image Management**: Multi-image support with ImageKit optimization

### 🧪 Testing Infrastructure
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API route testing with mocking
- **E2E Tests**: Playwright cross-browser testing
- **Accessibility Tests**: Automated WCAG compliance checking
- **Mobile Tests**: Responsive design validation

## 📋 Environment Variables Setup

### Required Services Setup

#### 1. Airtable Setup
1. Go to Airtable (https://airtable.com) and create/access your base
2. Get your API key from Account Settings (https://airtable.com/account)
3. Find your Base ID from the API documentation for your base
4. Ensure your table has all required fields (see schema below)

#### 2. ImageKit Setup
1. Create an account at ImageKit.io (https://imagekit.io)
2. Get your Public Key, Private Key, and URL Endpoint from the dashboard
3. Add the keys to your .env file (see Environment Variables below)
4. Create a folder structure for organizing images (e.g., `mma-gear-products`)

#### 3. Email Service Setup

**Option A: EmailJS (Recommended for MVP)**
1. Create account at EmailJS (https://emailjs.com)
2. Create email service (Gmail, Outlook, etc.)
3. Create email template for contact form
4. Get Service ID, Template ID, and Public Key

**Option B: Resend (Alternative)**
1. Create account at Resend (https://resend.com)
2. Verify your domain
3. Get API key from dashboard

### Environment Variables Reference

```bash
# Core Configuration
NEXT_PUBLIC_SITE_URL=https://gear.maineventlive.ca
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
# Server-side (API routes) - keep private
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key

# Client-side (components) - can be public
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint
JWT_SECRET=your_32_character_secret
ADMIN_EMAIL=admin@gear.maineventlive.ca
ADMIN_PASSWORD=your_secure_password
```

## 🗄️ Airtable Database Schema (Updated)

### Products Table
| Field Name      | Type              | Description                        |
|-----------------|-------------------|------------------------------------|
| sku             | Single line text  | Unique product SKU (primary field) |
| id              | Auto number       | Sequential product ID (optional)   |
| name            | Single line text  | Product name                       |
| description     | Long text         | Product description                |
| price           | Currency          | Individual item price              |
| inventory       | Number            | Current stock level                |
| image_url       | URL               | Primary ImageKit URL               |
| image_url_2     | URL               | Second ImageKit URL                |
| image_url_3     | URL               | Third ImageKit URL                 |
| image_url_4     | URL               | Fourth ImageKit URL                |
| category        | Single select     | Product category                   |
| quality         | Single select     | Condition rating                   |
| created_at      | Date              | Creation timestamp                 |
| updated_at      | Date              | Last modification                  |
| category_icon   | Single line text  | Icon identifier                    |
| brand           | Single line text  | Product brand                      |
| size            | Single line text  | Size (e.g., S, M, L, XL, etc.)     |
| weight          | Single line text  | Weight (e.g., 12oz, 16oz, etc.)    |
| color           | Single line text  | Color                              |

---

## 📸 Image Handling with ImageKit (Multiple URL Fields)

### Implementation Method
- **Multiple URL Fields**: Each product can have up to 4 ImageKit URLs
- **Direct URL Storage**: ImageKit URLs stored directly in Airtable URL fields
- **Automatic Upload Process**: Images uploaded through admin panel, processed via ImageKit API

### Image Upload Flow
1. **Admin Upload**: User uploads images via admin panel
2. **ImageKit Processing**: App automatically uploads to ImageKit API
3. **URL Storage**: ImageKit URLs stored in `image_url`, `image_url_2`, `image_url_3`, `image_url_4` fields
4. **Display**: Use ImageKit URLs for optimized image display

### ImageKit URL Format
```
https://ik.imagekit.io/your-endpoint/mma-gear-products/product1.jpg
https://ik.imagekit.io/your-endpoint/mma-gear-products/product2.jpg
https://ik.imagekit.io/your-endpoint/mma-gear-products/product3.jpg
https://ik.imagekit.io/your-endpoint/mma-gear-products/product4.jpg
```

### Implementation Notes
- Use ImageKit API for automatic image optimization and transformation
- Store up to 4 images per product
- `image_url` is the primary/featured image
- Handle image deletion/updates through ImageKit API
- Empty URL fields indicate no additional images
- Images are organized in `mma-gear-products` folder with tags

### Holds Table
| Field Name        | Type            | Description                                 |
|-------------------|-----------------|---------------------------------------------|
| product           | Linked record   | Link to Products table (by SKU)             |
| quantity          | Number          | Number of units on hold                     |
| customer_email    | Email           | Customer's email                            |
| customer_phone    | Phone number    | Customer's phone number                     |
| customer_name     | Single line text| Customer's name                             |
| hold_status       | Single select   | Active, Released, Expired                   |
| hold_created_at   | Date            | When the hold was placed                    |
| hold_expires_at   | Date            | When the hold expires                       |
| notes             | Long text       | Any additional notes                        |

### Sales Table
| Field Name        | Type            | Description                                 |
|-------------------|-----------------|---------------------------------------------|
| product           | Linked record   | Link to Products table (by SKU)             |
| quantity          | Number          | Number of units sold                        |
| customer_email    | Email           | Customer's email                            |
| customer_phone    | Phone number    | Customer's phone number                     |
| customer_name     | Single line text| Customer's name                             |
| sale_date         | Date            | When the sale was completed                 |
| price_per_unit    | Currency        | Price per unit at time of sale              |
| total_price       | Currency        | Total price (quantity * price_per_unit)     |
| payment_status    | Single select   | Paid, Pending, Refunded, etc.               |
| notes             | Long text       | Any additional notes                        |

---

- Use linked records in Airtable to relate Holds and Sales to Products.
- Remove hold and sales tracking fields from Products table (now tracked in Holds/Sales).
- Add automations as needed (e.g., auto-expire holds, update inventory on sale).

## 🏗️ Project Structure

```
mma-gear-site/
├── .cursorrules                # Cursor AI rules
├── .env.example               # Environment template
├── .env.local                 # Your local environment (not in git)
├── DEVELOPMENT.md             # This file
├── README.md                  # Project overview
├── package.json               # Dependencies
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS config
├── tsconfig.json             # TypeScript config
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Homepage
│   │   ├── admin/            # Admin dashboard
│   │   └── api/              # API routes
│   ├── components/           # Reusable components
│   │   ├── ui/               # Basic UI components
│   │   ├── forms/            # Form components
│   │   ├── layout/           # Layout components
│   │   └── products/         # Product-specific components
│   ├── lib/                  # Utility functions
│   │   ├── airtable.ts       # Airtable integration
│   │   ├── imagekit.ts       # ImageKit integration
│   │   ├── auth.ts           # Authentication
│   │   └── utils.ts          # General utilities
│   ├── hooks/                # Custom React hooks
│   ├── types/                # TypeScript definitions
│   ├── services/             # API services
│   └── constants/            # Application constants
├── public/                   # Static assets
└── docs/                     # Additional documentation
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Code Quality & Validation
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking (run before commits!)

# Testing - Full Suite
npm run test             # Run Jest unit tests
npm run test:watch       # Run Jest tests in watch mode
npm run test:e2e         # Run Playwright end-to-end tests

# Specific Test Categories
npm test -- --coverage                    # Run unit tests with coverage
npx playwright test --headed              # Run e2e tests with browser GUI
npx playwright test --project=chromium    # Run e2e tests on specific browser
npx playwright test tests/e2e/accessibility.spec.ts  # Run accessibility tests only

# Development Workflow Commands
npm run type-check && npm run test && npm run build  # Pre-commit validation
```

## 🧪 Testing Strategy & Implementation

### Test Categories

#### 1. Unit Tests (`src/**/__tests__/`)
- **Location**: Co-located with source files
- **Framework**: Jest + React Testing Library
- **Coverage**: Utility functions, components, date handling
- **Run**: `npm run test`

```bash
# Examples
src/lib/__tests__/utils.test.ts         # Utility function tests
src/lib/__tests__/dateUtils.test.ts     # Date formatting tests
src/components/__tests__/Toast.test.tsx # Component tests
```

#### 2. Integration Tests (`src/app/api/**/__tests__/`)
- **Location**: Next to API routes
- **Framework**: Jest with mocking
- **Coverage**: API endpoints, database integration, email services
- **Run**: `npm test -- src/app/api`

```bash
# Examples
src/app/api/__tests__/purchase-email.test.ts           # Purchase flow API
src/app/api/admin/__tests__/complete-hold-sale.test.ts # Admin API
src/app/api/admin/__tests__/update-hold.test.ts       # Hold management API
```

#### 3. End-to-End Tests (`tests/e2e/`)
- **Location**: Dedicated e2e directory
- **Framework**: Playwright
- **Coverage**: Full user workflows, accessibility, mobile responsiveness
- **Run**: `npm run test:e2e`

```bash
# Examples
tests/e2e/purchase-flow.spec.ts      # Complete purchase workflow
tests/e2e/admin-dashboard.spec.ts    # Admin management workflows
tests/e2e/accessibility.spec.ts      # WCAG compliance testing
tests/e2e/mobile-responsive.spec.ts  # Mobile/tablet responsiveness
```

### Testing Best Practices

1. **Test-Driven Development**
   ```bash
   # Write test first
   npm run test:watch    # Keep tests running
   # Implement feature
   # Ensure tests pass
   ```

2. **Pre-Commit Testing**
   ```bash
   npm run type-check    # TypeScript validation
   npm run test          # Unit & integration tests
   npm run build         # Production build test
   ```

3. **CI/CD Testing Pipeline**
   ```bash
   npm run lint          # Code style
   npm run type-check    # Type safety
   npm run test          # All Jest tests
   npm run test:e2e      # Playwright tests
   npm run build         # Production build
   ```

## ♿ Accessibility Development Guidelines

### WCAG 2.1 AA Compliance

This application follows WCAG 2.1 AA standards. All new features must maintain accessibility compliance.

#### Key Requirements

1. **Semantic HTML Structure**
   ```tsx
   // Good
   <main id="main-content">
     <h1>Page Title</h1>
     <section aria-labelledby="products-heading">
       <h2 id="products-heading">Products</h2>
     </section>
   </main>
   
   // Bad
   <div>
     <div class="title">Page Title</div>
     <div class="section">
       <div class="heading">Products</div>
     </div>
   </div>
   ```

2. **ARIA Labels and Roles**
   ```tsx
   // Forms
   <input 
     name="email" 
     aria-label="Email address" 
     required 
     aria-describedby="email-error"
   />
   <div id="email-error" role="alert">Please enter a valid email</div>
   
   // Interactive elements
   <button aria-label="Close dialog" onClick={handleClose}>×</button>
   
   // Dynamic content
   <div aria-live="polite" id="status-message">
     {successMessage}
   </div>
   ```

3. **Keyboard Navigation**
   ```tsx
   const handleKeyDown = (e: React.KeyboardEvent) => {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault();
       handleClick();
     }
   };
   
   <div 
     role="button" 
     tabIndex={0} 
     onKeyDown={handleKeyDown}
     onClick={handleClick}
   >
     Custom Button
   </div>
   ```

4. **Focus Management**
   ```tsx
   // Modal/dialog focus management
   const dialogRef = useRef<HTMLDivElement>(null);
   
   useEffect(() => {
     if (isOpen) {
       dialogRef.current?.focus();
     }
   }, [isOpen]);
   
   <dialog ref={dialogRef} tabIndex={-1}>
     <h2>Dialog Title</h2>
     {/* Content */}
   </dialog>
   ```

#### Accessibility Testing

```bash
# Run accessibility tests
npx playwright test tests/e2e/accessibility.spec.ts

# Test specific accessibility features
npx playwright test tests/e2e/accessibility.spec.ts --grep "keyboard navigation"
npx playwright test tests/e2e/accessibility.spec.ts --grep "screen reader"
```

## 📱 Mobile-First Development

### Responsive Design Principles

1. **Mobile-First CSS**
   ```css
   /* Base styles for mobile */
   .product-card {
     width: 100%;
     padding: 1rem;
   }
   
   /* Tablet and up */
   @media (min-width: 768px) {
     .product-card {
       width: 50%;
     }
   }
   
   /* Desktop and up */
   @media (min-width: 1024px) {
     .product-card {
       width: 33.333%;
     }
   }
   ```

2. **Touch-Friendly Interfaces**
   ```tsx
   // Minimum 44px touch targets
   const ButtonStyles = {
     minHeight: '44px',
     minWidth: '44px',
     padding: '12px 16px'
   };
   
   // Touch gesture support
   const handleTouchStart = (e: React.TouchEvent) => {
     setTouchStart(e.touches[0].clientX);
   };
   
   const handleTouchEnd = (e: React.TouchEvent) => {
     const touchEnd = e.changedTouches[0].clientX;
     const diff = touchStart - touchEnd;
     
     if (Math.abs(diff) > 50) {
       diff > 0 ? nextImage() : prevImage();
     }
   };
   ```

3. **Responsive Images**
   ```tsx
   // ImageKit responsive images
   <img 
     src={`${imageUrl}?tr=w-300,h-300,c-fit`} // Mobile
     srcSet={`
       ${imageUrl}?tr=w-300,h-300,c-fit 300w,
       ${imageUrl}?tr=w-600,h-600,c-fit 600w,
       ${imageUrl}?tr=w-900,h-900,c-fit 900w
     `}
     sizes="(max-width: 768px) 300px, (max-width: 1024px) 600px, 900px"
     alt={product.name}
   />
   ```

#### Mobile Testing

```bash
# Run mobile responsiveness tests
npx playwright test tests/e2e/mobile-responsive.spec.ts

# Test specific device sizes
npx playwright test --project="Mobile Chrome"
npx playwright test --project="Mobile Safari"
```

## 📱 Development Workflow

### 1. Feature Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Development with Testing**
   ```bash
   npm run dev                    # Start development server
   npm run test:watch            # Keep tests running
   # Develop feature with TDD approach
   npm run type-check            # Validate TypeScript
   ```

3. **Quality Assurance**
   ```bash
   npm run lint                  # Code style validation
   npm run format               # Auto-format code
   npm run test                 # Run all unit tests
   npm run test:e2e             # Run e2e tests
   npm run build               # Test production build
   ```

4. **Accessibility & Mobile Testing**
   ```bash
   # Test accessibility compliance
   npx playwright test tests/e2e/accessibility.spec.ts
   
   # Test mobile responsiveness
   npx playwright test tests/e2e/mobile-responsive.spec.ts
   
   # Test across browsers
   npx playwright test --project=chromium
   npx playwright test --project=firefox
   npx playwright test --project=webkit
   ```

### 2. Code Review Checklist

Before submitting a PR, ensure:

- [ ] All tests pass (`npm run test` and `npm run test:e2e`)
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Accessibility requirements met (ARIA labels, keyboard navigation)
- [ ] Mobile responsiveness tested
- [ ] Loading states implemented for async operations
- [ ] Error handling with user-friendly messages
- [ ] Toast notifications for user feedback

### 3. Component Development Standards

#### Loading States
```tsx
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// Always show loading state for async operations
if (isLoading) {
  return <LoadingSpinner size="medium" />;
}

// Always handle error states
if (error) {
  return (
    <div role="alert" className="error-message">
      {error}
    </div>
  );
}
```

#### Form Validation
```tsx
// Client-side validation with accessibility
const [errors, setErrors] = useState<Record<string, string>>({});

<input
  name="email"
  aria-label="Email address"
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? "email-error" : undefined}
  required
/>
{errors.email && (
  <div id="email-error" role="alert" className="error-text">
    {errors.email}
  </div>
)}
```

#### Success Feedback
```tsx
// Use toast notifications for success states
const { showToast } = useToast();

const handleSuccess = () => {
  showToast('Purchase request submitted successfully!', 'success');
  setFormVisible(false);
};
```

## **Key Benefits of Option 2**

### **1. Simple Structure**
- 4 dedicated URL fields: `image_url`, `image_url_2`, `image_url_3`, `image_url_4`
- No JSON parsing needed
- Easy to query and filter in Airtable

### **2. Clear Image Hierarchy**
- `image_url` = Primary/featured image
- `image_url_2` through `image_url_4` = Additional product images
- Easy to determine which images to display

### **3. Implementation Simplicity**
```typescript
interface Product {
  sku: string;
  name: string;
  image_url: string;      // Primary image
  image_url_2?: string;   // Second image
  image_url_3?: string;   // Third image
  image_url_4?: string;   // Fourth image
  // ... other fields
}

// Helper function to get all images
function getProductImages(product: Product): string[] {
  return [
    product.image_url,
    product.image_url_2,
    product.image_url_3,
    product.image_url_4
  ].filter(Boolean); // Remove empty URLs
}
```

## Airtable API Authentication (Updated for Personal Access Tokens)

Airtable now requires the use of Personal Access Tokens (PAT) instead of legacy API keys.

### How to Generate a Personal Access Token (PAT)
1. Go to your Airtable account settings: https://airtable.com/create/tokens
2. Click "Create token"
3. Give your token a name (e.g., "Gearz Dev Token")
4. Set the scopes to "data.records:read" (and others as needed for your app)
5. Add access to your base (e.g., "Gearz")
6. Copy the generated token (starts with "pat...")

### Update Your Environment Variables
In your `.env.local` file, replace the old API key with your new PAT:

```
AIRTABLE_PAT=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=app7Frl7frpaDRoI0
AIRTABLE_TABLE_NAME=Products
```

- Use `AIRTABLE_PAT` in your server-side code for authentication.
- Never commit your PAT to version control.

### References
- [Airtable Personal Access Tokens Documentation](https://airtable.com/developers/web/api/personal-access-tokens)
- [Airtable API Docs](https://airtable.com/developers/web/api/introduction)

## Airtable Utility: Multi-Table Support

The Airtable integration now supports fetching records from any table by passing the table name as a parameter. Default table names are exported as constants for convenience.

### Usage

```typescript
import {
  fetchAirtableRecords,
  AIRTABLE_PRODUCTS_TABLE,
  AIRTABLE_HOLDS_TABLE,
  AIRTABLE_SALES_TABLE,
} from '../lib/airtable';

// Fetch products
const products = await fetchAirtableRecords(AIRTABLE_PRODUCTS_TABLE);

// Fetch holds
const holds = await fetchAirtableRecords(AIRTABLE_HOLDS_TABLE);

// Fetch sales
const sales = await fetchAirtableRecords(AIRTABLE_SALES_TABLE);
```

### Environment Variables
Add these to your `.env` or `.env.local`:
```
AIRTABLE_PAT=patXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=app7Frl7frpaDRoI0
AIRTABLE_PRODUCTS_TABLE=Products
AIRTABLE_HOLDS_TABLE=Holds
AIRTABLE_SALES_TABLE=Sales
```

- You can override the default table names by changing the environment variables.
- The utility is generic and can be used for any table in your Airtable base.

## Code Consistency Rule: Update All Usages When Making Changes

Whenever you make a change to a function, variable, or component name (such as renaming or refactoring):

- **You must search for and update all occurrences throughout the codebase.**
- Do not only update the definition—update every usage, import, and reference in all files.
- This includes:
  - Function calls
  - Imports/exports
  - Type references
  - Documentation/examples
- Failing to do this can cause runtime errors, broken features, or confusing bugs.

**Best Practice:**
- Use your editor’s “Find All References” or global search to locate every instance of the old name.
- Update all relevant files before committing or testing your change.
- If you are unsure, do a full-text search for the old name and review each result.

**Example:**
- If you rename `fetchProducts` to `fetchAirtableRecords`, update every file that uses `fetchProducts` to use the new name.

This rule helps keep the codebase stable and prevents accidental breakage during refactoring or feature development.

---

## **Checklist to Fix:**

1. **Check your `.env` file** (or `.env.local`):
   ```env
   RESEND_API_KEY=your_resend_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ADMIN_EMAIL=your_admin_email@yourdomain.com
   ```

2. **Restart your dev server** after making any changes to `.env`.

3. **Check for typos** in variable names (they must match exactly: all caps, underscores, no extra spaces).

4. **If using Vercel or another host:**  
   - Make sure these variables are set in your deployment environment as well.

---

## **How to Debug Further**

- Add a debug log to your API route to print the values (mask the API key in logs!):
   ```js
   console.log('[Resend Debug]', {
     RESEND_API_KEY: !!process.env.RESEND_API_KEY,
     RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
     ADMIN_EMAIL: process.env.ADMIN_EMAIL,
   });
   ```

- If any value is missing or empty, that's the culprit.

---

**Once you confirm the variables are set and restart your server, the error should go away!**  
Let me know if you want help double-checking your `.env` or want to add the debug log.