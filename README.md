# HealthLuma

HealthLuma is a digital clinic platform built for a private medical practice. It enables patients to book consultations, manage medical records, and access a subscription-based care plan, while providing the doctor with a centralized dashboard to manage appointments, patients, prescriptions, and clinic operations.

The project demonstrates a modern SaaS architecture using Next.js, Supabase, and Stripe, with a clear separation between marketing pages and the authenticated application.

---

## Overview

HealthLuma models the workflow of a real outpatient clinic in a modern web application.

Patients can schedule consultations, upload reports, review prescriptions, and manage their health history. A yearly subscription plan unlocks additional benefits such as family coverage, priority booking, and extended AI assistance.

The doctor manages the clinic through an administrative dashboard that includes appointment scheduling, patient records, prescription management, and revenue tracking.

The application is designed to demonstrate production-level patterns including authentication, role-based dashboards, payments, subscriptions, and structured data models.

---

## Core Features

### Patient Portal

Registered patients can:

- Book appointments through a calendar-based interface  
- View upcoming and past consultations  
- Upload medical reports and documents  
- Access digital prescriptions  
- Review billing history and invoices  
- Interact with a health assistant for basic guidance  

---

### Pro Membership

HealthLuma includes a subscription plan designed for families and long-term care.

Pro members receive:

- Discounted consultation pricing  
- Priority booking slots  
- Family member linking (up to four members)  
- Extended AI assistant usage  
- Prescription archive access  
- Downloadable health summaries  
- Appointment reminders via email or SMS  
- Same-day urgent booking access  

Pricing model:

- Standard consultation: **$100**  
- Pro membership: **$150 per year**

---

### Appointment System

Appointments are managed through a structured booking system.

Key characteristics:

- Calendar-based availability  
- Configurable slot duration (15 or 30 minutes)  
- Real-time availability checks  
- Slot locking during checkout  
- Payment confirmation via Stripe  
- Automated confirmation notifications  

Booking flow:
Select date
Select available time slot
Complete checkout
Receive confirmation


---

### Doctor Dashboard

The doctor dashboard centralizes all clinic management tasks.

Capabilities include:

- Managing daily schedule and availability  
- Reviewing and updating appointments  
- Recording consultation outcomes  
- Issuing prescriptions  
- Reviewing patient medical history  
- Managing pricing and subscriptions  
- Sending announcements to patients  
- Viewing clinic analytics and revenue reports  

---

### Digital Health Records

HealthLuma provides a persistent record system for patients.

Patients can:

- Upload reports (PDF or image)  
- Access prescription history  
- View consultation summaries  
- Maintain a structured medical timeline  

This allows the platform to act as a long-term digital health record system.

---

### AI Health Assistant

An integrated assistant provides basic medical guidance.

Free users receive limited usage per month.

Pro members receive extended access and additional features including:

- Symptom explanation  
- Medication guidance  
- Pre-visit advice  
- Post-consultation clarification  

---

## Application Architecture

The project separates marketing pages from the authenticated application to maintain a clean architecture.
/
landing pages
pricing
doctor profile
services

/login
/register

/app
dashboard
appointments
records
ai
billing
family

/doctor
dashboard
appointments
patients
prescriptions
records
billing
analytics

This structure keeps the marketing layer independent from the application layer and simplifies long-term maintenance.

---

## Technology Stack

### Frontend

- Next.js (App Router)  
- React  
- Tailwind CSS  
- shadcn/ui component system  
- Lucide icon set  

### Backend

- Supabase  
- PostgreSQL  
- Supabase Authentication  
- Supabase Storage  

### Payments

- Stripe payment processing  
- Subscription billing  
- Webhook-based payment events  

### Deployment

- Vercel

---

## UI System

The interface uses a component-driven design built with Tailwind CSS and shadcn/ui.

The application prioritizes clarity and accessibility due to the healthcare context.

Desktop layout uses a sidebar-based navigation model, while mobile devices use simplified navigation patterns for ease of access.

---

## Running the Project Locally

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/healthluma.git
cd healthluma
2. Install dependencies
npm install

or

pnpm install
3. Configure environment variables

Create a .env.local file in the project root.

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

Supabase credentials can be found in the Supabase dashboard under:

Project Settings → API

4. Start the development server
npm run dev

The application will be available at:

http://localhost:3000
Development Goals

HealthLuma is designed to represent a realistic SaaS architecture. The project demonstrates:

authentication flows

role-based dashboards

appointment scheduling systems

subscription billing

digital record management

structured application architecture

The project can serve as a reference implementation for building vertical SaaS applications.

Roadmap

Future improvements may include:

automated SMS reminders

expanded patient health tracking

improved analytics for clinic performance

AI-driven triage assistance

multi-doctor support

License

This project is intended for educational and demonstration purposes.

Author

Faraz Ali
Full-Stack Developer
