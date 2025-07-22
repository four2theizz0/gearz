# MMA Gear E-commerce Site - Development Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Airtable account with API access
- ImageKit account with API keys
- Email service account (EmailJS or Resend)

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
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking

# Testing
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run test:e2e     # Run end-to-end tests

# Code Quality
npm run format       # Format code with Prettier
npm run lint:fix     # Fix linting issues
```

## 📱 Development Workflow

### 1. Feature Development Process

1. **Create Feature Branch**
```bash
git checkout -b feature/product-catalog
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