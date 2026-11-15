# Sahaaya — Elderly Care & Medication Management Platform

> **Care that connects generations.**

Sahaaya is an accessible, connected elderly healthcare management platform bringing elderly individuals, family members, and caregivers together into a unified care network.

## Core Features

- **Elderly Interface**: Clear, high-contrast dashboard with minimum 56px touch targets, today's schedule, one-tap dose marking, and emergency contact actions.
- **Family Dashboard**: Medication adherence tracking, overdue dose notifications, care circle management, and doctor visit monitoring.
- **Caregiver Tools**: Assigned care recipient records, dose administration checklists, and clinical notes.
- **Database Security**: PostgreSQL Row Level Security (RLS) on all tables, cryptographically secure invitation tokens, and automated dose history audit triggers.
- **Strict Budget Constraint**: Operates entirely within the free tiers of Supabase and Vercel (zero cost).

## Tech Stack

- Frontend: React + Vite + Tailwind CSS
- Backend / Database: Supabase (PostgreSQL 15, Supabase Auth, Row Level Security)
- Icons: Lucide React
- Hosting: Vercel Free Tier

## Local Development Setup

1. Install project dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables in `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-public-anon-key
   ```
   *(If unconfigured, the application runs in local interactive demo mode).*

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## Database Setup (Supabase Free Tier)

1. Open your Supabase project dashboard.
2. Navigate to the SQL Editor.
3. Execute `supabase/schema_complete.sql` to initialize tables, constraints, security definer procedures, and RLS policies.
4. Copy your project URL and public anon key into `.env`.

## Judge Demo Personas

The application includes built-in one-click demo personas:
- **Kamla Sharma (Elderly)**: `kamla.elderly@sahaaya.demo`
- **Rohan Sharma (Family)**: `rohan.family@sahaaya.demo`
- **Nurse Priya Rao (Caregiver)**: `priya.nurse@sahaaya.demo`

Password for demo accounts: `Sahaaya@2026`

## Hackathon Compliance

- Repository Size: Strictly under 10 MB (< 100 KB total size).
- Branch: Single `main` branch.
- Cost: ₹0 to develop and deploy.
