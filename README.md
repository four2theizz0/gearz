# MMA Gear E-commerce Site

A modern e-commerce platform for MMA gear, built with Next.js, TypeScript, Tailwind CSS, and Airtable.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm (or yarn)
- Airtable, ImageKit, and Email service accounts

### Setup
1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd mma-gear-site
   ```
2. Install dependencies:
   ```bash
   2npm install
   ```
3. Copy environment variables:
   ```bash
   cp env.example env.local
   # Edit env.local with your actual values
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000) to view the site.

## 🗄️ Project Structure

- `src/app/` - Next.js App Router, pages, admin, API routes
- `src/components/` - UI, forms, layout, product components
- `src/lib/` - Airtable, ImageKit, auth, and utility functions
- `src/hooks/` - Custom React hooks
- `src/types/` - TypeScript types
- `src/services/` - API services
- `src/constants/` - Application constants
- `public/` - Static assets
- `docs/` - Additional documentation

## 🛠️ Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run type-check` - TypeScript check
- `npm run test` - Run tests
- `npm run test:e2e` - Run end-to-end tests

## 📱 Development Workflow

- Use feature branches for new features
- Write modular, testable, and well-documented code
- Follow the structure and patterns in DEVELOPMENT.md
- Test and lint before committing

---

For more details, see `.cursor/rules/DEVELOPMENT.md`. 