# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Development server
npm run dev          # Start Next.js development server on localhost:3000

# Build and deployment  
npm run build        # Build for production
npm run start        # Start production server

# Code quality
npm run lint         # Run ESLint
npm run format       # Format code with Prettier  
npm run type-check   # TypeScript type checking (use before commits)

# Testing
npm run test         # Run Jest unit tests
npm run test:watch   # Run Jest tests in watch mode
npm run test:e2e     # Run Playwright end-to-end tests
```

## Architecture Overview

This is a **Next.js 14 e-commerce site** for MMA gear with **App Router**, using **TypeScript**, **Tailwind CSS**, and **Airtable** as the database.

### Core Stack
- **Frontend**: Next.js 14 App Router, React 18, TypeScript, Tailwind CSS
- **Database**: Airtable (Products, Holds, Sales tables)  
- **Media**: ImageKit for image optimization and storage
- **Email**: Resend for purchase notifications
- **Authentication**: Custom JWT-based admin auth

### Data Flow Architecture
- **Products**: Stored in Airtable with up to 4 ImageKit URLs per product (`image_url`, `image_url_2`, etc.)
- **Purchase Flow**: Customer fills form → API route sends email → Admin manually processes
- **Admin Panel**: Protected routes for creating products and managing inventory
- **Image Handling**: Direct upload to ImageKit API, URLs stored in Airtable

### Key Directories
- `src/app/`: Next.js App Router pages and API routes
- `src/components/`: Reusable UI components (ui/, forms/, layout/, products/)
- `src/lib/`: Core integrations (airtable.ts, imagekit.ts, auth.ts, utils.ts)
- `src/hooks/`: Custom React hooks
- `src/services/`: API service functions

### Environment Configuration
This app requires several external services. Check `.env.example` and `DEVELOPMENT.md` for complete setup:

```bash
# Core services
AIRTABLE_PAT=patXXXXXXXXXXXXXX          # Personal Access Token (not legacy API key)
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=xxx
IMAGEKIT_PRIVATE_KEY=xxx
RESEND_API_KEY=xxx
JWT_SECRET=your_32_character_secret
ADMIN_EMAIL=admin@domain.com
ADMIN_PASSWORD=secure_password
```

### Important Implementation Details

**Airtable Integration** (`src/lib/airtable.ts`):
- Uses Personal Access Token (PAT), not legacy API keys
- Multi-table support with constants: `AIRTABLE_PRODUCTS_TABLE`, `AIRTABLE_HOLDS_TABLE`, `AIRTABLE_SALES_TABLE`
- Generic `fetchAirtableRecords(tableName)` function

**Product Schema**:
- Primary key: `sku` (string)
- Multiple images: `image_url`, `image_url_2`, `image_url_3`, `image_url_4`
- All ImageKit URLs stored directly in Airtable URL fields
- Standard e-commerce fields: name, description, price, inventory, category, quality, brand, size, weight, color

**Code Consistency Rule**: When refactoring function/variable names, search and update ALL usages across the entire codebase - imports, exports, function calls, type references.

## Common Development Tasks

**Adding New Products**: Use admin panel at `/admin/create` or directly via Airtable
**Image Upload Flow**: Admin uploads → ImageKit API → URLs stored in Airtable  
**Testing Changes**: Always run `npm run type-check` before committing
**Purchase Flow**: Customer form → `/api/purchase-email` → Email to admin

## Architecture Patterns

- **Server Components**: Default for data fetching from Airtable
- **Client Components**: Forms and interactive UI (marked with `"use client"`)
- **API Routes**: Thin wrappers around service functions in `src/lib/`
- **Error Handling**: Try-catch with user-friendly messages
- **Styling**: Tailwind utility classes with custom CSS classes in `globals.css`