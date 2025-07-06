# 🏥 MedAssist - AI-Powered Medical Assistance Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13+-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4-orange)](https://openai.com/)

A comprehensive, AI-powered medical assistance platform that provides symptom checking, personalized health roadmaps, diet planning, and healthcare provider location services.

## ✨ Features

### 🔍 AI Symptom Checker
- **Intelligent Analysis**: GPT-4 powered symptom assessment
- **Severity Indicators**: Color-coded urgency levels (Low, Medium, High, Emergency)
- **Comprehensive Reports**: Detailed analysis with possible conditions and recommendations
- **Medical Disclaimers**: Professional-grade safety warnings and advice

### 🗺️ Personalized Health Roadmap
- **Goal Setting**: Short-term and long-term health objectives
- **Progress Tracking**: Visual progress indicators and completion statistics
- **Weekly Planning**: Structured weekly tasks and milestones
- **PDF Export**: Downloadable health plans and reports

### 🍽️ AI Diet Planner
- **Personalized Meals**: Custom meal plans based on health conditions
- **Nutritional Analysis**: Detailed calorie, protein, carb, and fat tracking
- **Dietary Restrictions**: Support for allergies and dietary preferences
- **Shopping Lists**: Organized grocery lists by category
- **7-Day Planning**: Complete weekly meal schedules

### 🏥 Healthcare Provider Locator
- **Location-Based Search**: Find nearby hospitals, clinics, and specialists
- **Advanced Filtering**: Filter by specialty, insurance, and distance
- **Provider Details**: Ratings, contact information, and accepted insurance
- **Appointment Booking**: Direct scheduling capabilities

### 👤 Comprehensive Profile Management
- **Medical History**: Complete health record management
- **Emergency Contacts**: Critical contact information storage
- **Health Metrics**: BMI calculation and health indicators
- **Medication Tracking**: Current medications and allergy management

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Google Maps API key (optional, for enhanced provider location)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/anurag121124/medassist
   cd medassist
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key
   
   # Authentication
   JWT_SECRET=your_jwt_secret_key
   
   # Google Maps (Optional)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   ```

4. **Set up the database**
   - Go to your Supabase SQL editor
   - Run the migration file: `supabase/migrations/20250706152719_dry_wildflower.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 13+ with App Router, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **AI**: OpenAI GPT-4 API
- **Authentication**: JWT with HTTP-only cookies
- **UI Components**: Shadcn/ui, Radix UI
- **Icons**: Lucide React

### Project Structure

```
medassist/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── diet-plan/            # Diet planning APIs
│   │   ├── health-roadmap/       # Health roadmap APIs
│   │   ├── profile/              # User profile APIs
│   │   ├── providers/            # Healthcare provider APIs
│   │   └── symptoms/             # Symptom analysis APIs
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # Main dashboard
│   ├── diet-planner/             # Diet planning interface
│   ├── health-roadmap/           # Health roadmap interface
│   ├── profile/                  # User profile management
│   ├── providers/                # Provider locator
│   ├── symptom-checker/          # Symptom checking interface
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # Reusable components
│   ├── layout/                   # Layout components
│   └── ui/                       # UI components (Shadcn/ui)
├── lib/                          # Utility libraries
│   ├── auth-utils.ts             # Authentication utilities
│   ├── openai.ts                 # OpenAI integration
│   ├── supabase.ts               # Supabase client
│   └── utils.ts                  # General utilities
├── supabase/                     # Database migrations
└── public/                       # Static assets
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | ✅ |
| `OPENAI_API_KEY` | OpenAI API key for AI features | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key | ❌ |

## 🔧 Supabase Configuration

### Environment Variables Setup

Your `.env.local` file is already configured with the following Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://ttsclzqgafrjhesdpykj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0c2NsenFnYWZyamhlc2RweWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MTcwNTEsImV4cCI6MjA2NzM5MzA1MX0.Tx2G1XPYuljeDdAOluIbBCjsZluNVWwB_m7q5dHRfBE
```

### Database Setup

1. **Automated Setup** (Recommended):
   ```bash
   npm run setup:supabase
   ```

2. **Manual Setup**:
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Link to your project
   supabase link --project-ref ttsclzqgafrjhesdpykj
   
   # Apply migrations
   supabase db push
   
   # Generate TypeScript types
   npm run db:types
   ```

### Enhanced Database Schema

The updated schema includes:
- **Enhanced user profiles** with comprehensive medical information
- **Improved symptom assessments** with AI confidence scoring
- **Advanced health roadmaps** with progress tracking
- **Rich diet plans** with nutritional analysis
- **Comprehensive provider directory** with location search
- **Secure appointment booking** system
- **Medical records management**
- **User session tracking**

### Available Database Commands

```bash
npm run db:push      # Push local migrations to Supabase
npm run db:reset     # Reset database to initial state
npm run db:types     # Generate TypeScript types from database
npm run db:status    # Check Supabase project status
```

### Database Functions

The enhanced schema includes custom PostgreSQL functions:
- `search_providers_by_location()`: Geographic provider search within radius
- `get_user_health_summary()`: Comprehensive health data aggregation
- `update_updated_at_column()`: Automatic timestamp management

## 🔒 Security & Compliance

### HIPAA Compliance
- **Data Encryption**: All data encrypted in transit and at rest
- **Access Controls**: Row-level security policies
- **Audit Logging**: Comprehensive activity tracking
- **Data Minimization**: Only necessary health data collected

### Security Features
- JWT authentication with HTTP-only cookies
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e

# Run all tests with coverage
npm run test:coverage
```

## 📦 Deployment

### Vercel (Recommended)

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Docker

```bash
# Build the Docker image
docker build -t medassist .

# Run the container
docker run -p 3000:3000 medassist
```

### Manual Deployment

```bash
# Build the application
npm run build

# Start the production server
npm start
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for all new code
- Follow the existing code style
- Run `npm run lint` before committing
- Write tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourusername/medassist/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/medassist/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/medassist/discussions)
- **Email**: support@medassist.com

## 🙏 Acknowledgments

- [OpenAI](https://openai.com/) for GPT-4 API
- [Supabase](https://supabase.com/) for backend infrastructure
- [Vercel](https://vercel.com/) for hosting platform
- [Shadcn/ui](https://ui.shadcn.com/) for UI components
- All our [contributors](https://github.com/yourusername/medassist/contributors)

## ⚠️ Medical Disclaimer

**IMPORTANT**: This platform is for informational purposes only and is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read on this platform.

In case of a medical emergency, call your doctor or 911 immediately.

---

<div align="center">
  <strong>Built with ❤️ for better healthcare accessibility</strong>
</div>