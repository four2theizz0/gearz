# MMA Gear E-commerce Site

A modern, accessible e-commerce platform for MMA gear, built with Next.js 14, TypeScript, Tailwind CSS, and Airtable. Features comprehensive testing, full accessibility compliance, and mobile-first responsive design.

## ✨ Features

- 🛒 **Complete E-commerce Flow** - Product browsing, purchase requests, hold management
- 👨‍💼 **Admin Dashboard** - Hold management, sales completion, inventory tracking
- ♿ **WCAG 2.1 Accessible** - Screen reader support, keyboard navigation, semantic HTML
- 📱 **Mobile-First Responsive** - Optimized for all devices and screen sizes
- 🧪 **Comprehensive Testing** - Unit, integration, and end-to-end tests
- 🔒 **Secure Authentication** - JWT-based admin authentication
- 📧 **Email Notifications** - Automated purchase confirmations via Resend
- 🖼️ **Image Management** - ImageKit integration for optimized images
- 🗄️ **Airtable Backend** - Products, holds, and sales data management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Airtable account with Personal Access Token (PAT)
- ImageKit account for image management
- Resend account for email notifications

### Installation

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd mma-gear-site
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure these required environment variables:
   ```env
   # Airtable Configuration
   AIRTABLE_PAT=patXXXXXXXXXXXXXX
   AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
   AIRTABLE_PRODUCTS_TABLE=Products
   AIRTABLE_HOLDS_TABLE=Holds
   AIRTABLE_SALES_TABLE=Sales
   
   # ImageKit Configuration
   NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=public_XXXXXXXX
   IMAGEKIT_PRIVATE_KEY=private_XXXXXXXX
   IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
   
   # Email Configuration (Resend)
   RESEND_API_KEY=re_XXXXXXXX
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   
   # Admin Authentication
   JWT_SECRET=your_32_character_secret_key_here
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=your_secure_password
   ```

3. **Database Setup**
   
   Create these Airtable tables with the following fields:
   
   **Products Table:**
   - `sku` (Single line text, Primary field)
   - `name` (Single line text)
   - `description` (Long text)
   - `price` (Number)
   - `inventory` (Number)
   - `category` (Single select: Gloves, Shorts, Shirts, etc.)
   - `quality` (Single select: New, Like New, Good, Fair)
   - `brand` (Single line text)
   - `size` (Single line text)
   - `weight` (Single line text)
   - `color` (Single line text)
   - `image_url` (URL)
   - `image_url_2` (URL)
   - `image_url_3` (URL)
   - `image_url_4` (URL)
   
   **Holds Table:**
   - `customer_name` (Single line text)
   - `customer_email` (Email)
   - `customer_phone` (Phone number)
   - `hold_status` (Single select: Active, Expired, Completed)
   - `hold_expires_at` (Date)
   - `pickup_day` (Date)
   - `pickup_custom` (Single line text)
   - `notes` (Long text)
   - `Products` (Link to Products table)
   
   **Sales Table:**
   - `customer_name` (Single line text)
   - `customer_email` (Email)
   - `payment_method` (Single select: cash, card, venmo, etc.)
   - `transaction_id` (Single line text)
   - `final_price` (Number)
   - `sale_date` (Date)
   - `admin_notes` (Long text)
   - `Products` (Link to Products table)

4. **Start Development**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

   Admin dashboard: [http://localhost:3000/admin](http://localhost:3000/admin)

## 🗄️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── admin/             # Admin dashboard and management
│   ├── api/               # API endpoints
│   │   ├── admin/         # Admin-only API routes
│   │   └── purchase-email/ # Purchase request handling
│   ├── globals.css        # Global styles and utilities
│   ├── layout.tsx         # Root layout component
│   └── page.tsx           # Homepage
├── components/            # Reusable UI components
│   ├── forms/             # Form components (PurchaseForm)
│   ├── layout/            # Layout components (Header, Footer)
│   ├── products/          # Product-related components
│   └── ui/                # Base UI components (Toast, LoadingSpinner)
├── lib/                   # Core integrations and utilities
│   ├── __tests__/         # Unit tests for utilities
│   ├── airtable.ts        # Airtable database integration
│   ├── auth.ts            # JWT authentication
│   ├── dateUtils.ts       # Date formatting utilities
│   ├── imagekit.ts        # ImageKit integration
│   └── utils.ts           # General utility functions
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
└── services/              # External service integrations

tests/e2e/                 # Playwright end-to-end tests
├── accessibility.spec.ts  # Accessibility compliance tests
├── admin-dashboard.spec.ts # Admin workflow tests
├── basic-navigation.spec.ts # Core navigation tests
├── mobile-responsive.spec.ts # Mobile responsiveness tests
└── purchase-flow.spec.ts   # Purchase workflow tests

public/                    # Static assets
├── icons/                 # Application icons
└── images/                # Static images
```

## 🛠️ Development Commands

```bash
# Development
npm run dev              # Start development server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run Jest unit tests
npm run test:watch       # Run Jest tests in watch mode
npm run test:e2e         # Run Playwright end-to-end tests
```

## 🧪 Testing

The project includes comprehensive testing coverage:

### Unit Tests (Jest + React Testing Library)
- Utility function testing
- Component testing
- Date/time handling
- Image processing logic

```bash
npm run test                    # Run all unit tests
npm run test:watch             # Run tests in watch mode
npm test -- --coverage        # Run with coverage report
```

### Integration Tests (Jest)
- API route testing
- Database integration testing
- Email service testing
- Error handling validation

### End-to-End Tests (Playwright)
- Complete user workflows
- Admin dashboard functionality
- Accessibility compliance
- Mobile responsiveness
- Cross-browser compatibility

```bash
npm run test:e2e                      # Run all e2e tests
npx playwright test --headed          # Run with browser GUI
npx playwright test --project=chromium # Run specific browser
npx playwright show-report            # View test results
```

## ♿ Accessibility

This application is built with accessibility as a priority:

- **WCAG 2.1 AA Compliance** - Meets web accessibility standards
- **Keyboard Navigation** - Full functionality without mouse
- **Screen Reader Support** - Proper ARIA labels and semantic HTML
- **Focus Management** - Clear focus indicators and logical tab order
- **Color Contrast** - Sufficient contrast ratios for readability
- **Responsive Text** - Scalable text up to 200% zoom

Test accessibility locally:
```bash
npx playwright test tests/e2e/accessibility.spec.ts
```

## 📱 Mobile Support

- **Mobile-First Design** - Optimized for small screens first
- **Touch-Friendly Interface** - Minimum 44px touch targets
- **Responsive Images** - Optimized loading for different screen sizes
- **Swipe Gestures** - Image carousel supports touch gestures
- **Cross-Device Testing** - Tested on phones, tablets, and desktops

## 🔧 Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   npm run dev                    # Start development
   npm run type-check            # Check TypeScript
   npm run test                  # Run unit tests
   npm run test:e2e              # Run e2e tests
   ```

2. **Code Quality Checks**
   ```bash
   npm run lint                  # ESLint checks
   npm run format               # Prettier formatting
   npm run type-check           # TypeScript validation
   ```

3. **Before Committing**
   ```bash
   npm run test                 # All tests pass
   npm run build               # Production build works
   git add . && git commit     # Commit changes
   ```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main

### Manual Deployment
```bash
npm run build                # Build production version
npm run start               # Start production server
```

### Environment Variables for Production
Ensure all required environment variables are set in your deployment platform:
- Airtable credentials (PAT, Base ID, Table names)
- ImageKit credentials (Public/Private keys, URL endpoint)
- Resend API key and from email
- JWT secret and admin credentials

## 📖 Additional Documentation

- **[CLAUDE.md](./CLAUDE.md)** - Claude Code development guidelines
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed development workflows
- **[.env.example](./.env.example)** - Environment variable template

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

[Add your license information here]

---

Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and modern web standards. 