# PointMe - Business Management and Appointment Scheduling Platform

## Overview

PointMe is a comprehensive business management and appointment scheduling platform built with Next.js, TypeScript, and Supabase. It enables businesses to manage their services, appointments, staff, and customer relationships through a modern, intuitive interface.

## 🚀 Features

### For Businesses

- **Service Management**
  - Create and manage service offerings
  - Set pricing, duration, and capacity
  - Configure service categories
  - Enable/disable services
  - Set service-specific booking rules

- **Appointment Scheduling**
  - Real-time availability management
  - Automated scheduling system
  - Multi-staff support
  - Buffer time management
  - Recurring appointment support

- **Staff Management**
  - Staff profiles and schedules
  - Service assignment
  - Working hours configuration
  - Break time management
  - Vacation/time-off tracking

- **Business Profile**
  - Customizable business profile
  - Location management with Google Maps integration
  - Business hours configuration
  - Holiday and special hours settings
  - Multiple location support

- **Customer Management**
  - Customer database
  - Appointment history
  - Customer preferences
  - Communication history
  - Automated notifications

### For Administrators

- **User Management**
  - User roles and permissions
  - Account activation/deactivation
  - User analytics
  - Access control

- **Content Moderation**
  - Review management
  - Report handling
  - Content filtering
  - Automated moderation tools

- **Analytics Dashboard**
  - Business performance metrics
  - User growth analytics
  - Appointment statistics
  - Revenue tracking
  - Category distribution analysis

### For Customers

- **Booking Experience**
  - Easy service discovery
  - Real-time availability checking
  - Instant booking confirmation
  - Appointment management
  - Favorite businesses
  - Review and rating system

## 🛠 Technical Stack

### Frontend

- **Framework**: Next.js 14
- **Language**: TypeScript
- **State Management**:
  - Zustand for global state
  - swr server state
- **UI Components**:
  - Material-UI (MUI)
  - Radix UI
  - Custom components
- **Form Handling**:
  - React Hook Form
  - Zod for validation
- **Styling**:
  - Tailwind CSS
  - CSS Modules
  - Emotion

### Backend

- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **API**:
  - Next.js API Routes
  - tRPC
  - REST endpoints

### Third-party Integrations

- **Maps**: Google Maps API
- **Payments**: PayFast
- **Notifications**:
  - Email (SMTP)
  - SMS (Twilio)
  - Push Notifications
- **Analytics**: Custom analytics engine

## 📦 Project Structure

src/
├── components/          # React components
│   ├── admin/          # Admin dashboard components
│   ├── appointments/   # Appointment-related components
│   ├── business/       # Business management components
│   └── common/         # Shared components
├── hooks/              # Custom React hooks
├── layouts/            # Page layouts
├── lib/               # Utility functions and configurations
├── pages/             # Next.js pages
├── services/          # API service layers
├── styles/            # Global styles
└── types/             # TypeScript type definitions

## ⚙️ Setup Requirements

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- PostgreSQL 14.x or higher
- Supabase account
- Google Maps API key
- PayFast merchant account

### Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
PAYFAST_MERCHANT_ID=your_payfast_merchant_id
PAYFAST_MERCHANT_KEY=your_payfast_merchant_key
PAYFAST_PASSPHRASE=your_payfast_passphrase
```

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pointme.git
cd pointme
 

2. Install dependencies:

```bash
pnpm install
 

3. Set up environment variables:

```bash
cp .env.example .env.local
 

4. Run the development server:

```bash
pnpm dev
```

## 🔒 Security Features

- Role-based access control (RBAC)
- JWT authentication
- API rate limiting
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Secure password hashing
- Two-factor authentication support

## 📊 Database Schema

The application uses a sophisticated PostgreSQL database schema with the following main tables:

- Users
- Businesses
- Services
- Appointments
- Staff
- Categories
- Reviews
- Reports
- Analytics

Detailed schema documentation is available in the `/docs` directory.

## 🚀 Deployment

The application is designed to be deployed on Vercel or any other Next.js-compatible hosting platform.

### Production Deployment Steps

1. Configure production environment variables
2. Build the application: `pnpm build`
3. Deploy to hosting platform
4. Set up SSL certificates
5. Configure domain settings
6. Set up monitoring and logging

## 📈 Performance Optimization

- Server-side rendering (SSR)
- Static site generation (SSG)
- Image optimization
- Code splitting
- Bundle size optimization
- Caching strategies
- Database query optimization
- API response caching

## 🧪 Testing

- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Cypress
- API tests with Supertest
- Performance testing with Lighthouse

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📧 Support

For support, email <support@pointme.com> or join our Slack channel.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase team for the backend infrastructure
- All contributors who have helped shape this project

---

Built with ❤️ by the PointMe team
