# InvoiceAI

**Get paid faster with AI.**

> AI-powered invoicing and accounts receivable automation for freelancers and solo businesses. Stop chasing payments. Start getting paid.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ (LTS)
- npm or yarn
- Supabase account
- OpenAI API key
- Stripe account (for payments)
- SendGrid account (for emails)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   ```

   Fill in the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `SENDGRID_API_KEY`

3. **Set up Supabase:**

   Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

   Link to your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```

   Run migrations:
   ```bash
   supabase db push
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
invoiceai/
├── app/                      # Next.js 14 App Router
│   ├── (auth)/              # Authentication routes
│   ├── (dashboard)/         # Dashboard (authenticated)
│   ├── (portal)/            # Public client portal
│   └── api/                 # API routes
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── invoices/            # Invoice components
│   ├── clients/             # Client components
│   └── dashboard/           # Dashboard components
├── lib/                     # Utilities and integrations
│   ├── supabase/           # Supabase client
│   ├── openai/             # OpenAI integration
│   └── utils.ts            # Helper functions
├── types/                   # TypeScript types
├── supabase/migrations/     # Database migrations
└── public/                 # Static assets
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth) |
| **AI/ML** | OpenAI API (GPT-4o) |
| **Payments** | Stripe Connect |
| **Email** | SendGrid |
| **Hosting** | Vercel |

---

## 🎯 MVP Features (Phase 1)

- ✅ Project setup
- 🔄 AI Invoice Generator
- 🔄 Client Management
- 🔄 One-Click Invoice Sending
- 🔄 Online Payment Processing (Stripe)
- 🔄 Automated Payment Reminders
- 🔄 Invoice Templates
- 🔄 Basic Reporting

---

## 🔐 Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# SendGrid
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@invoiceai.com

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 📚 Documentation

Full documentation available in `/saas-ideas/web-first/b2c/24-invoiceai/`:
- Product Overview
- Tech Stack Details
- Feature Roadmap
- Database Schema
- API Guide
- Revenue Model

---

## 🚢 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

---

## 🎯 Roadmap

### Phase 1: MVP (Months 1-6)
- AI invoice generation
- Client management
- Payment processing
- Email reminders

### Phase 2: Post-MVP (Months 7-12)
- AI payment prediction
- Cash flow forecasting
- Recurring invoices

### Phase 3: Year 2+
- Invoice financing
- Accounting integrations
- Team features

---

*Built for freelancers who deserve to get paid on time.*
