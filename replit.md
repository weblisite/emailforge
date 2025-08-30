# EmailForge - Cold Email Automation Software

## Overview

EmailForge is a custom cold email automation platform designed for B2B sales teams, marketers, and lead generation agencies. The application enables scalable outbound email campaigns with high deliverability through unlimited SMTP/IMAP account connections, automated email rotation, and built-in deliverability testing. The platform features a unified inbox for reply monitoring, sequence building with personalization, CSV lead import, real-time analytics, and compliance-ready unsubscribe handling.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with modern hooks and TypeScript for type safety
- **ShadCN UI** component library with Radix UI primitives for accessible components
- **Tailwind CSS** for utility-first styling with Bootstrap 5 and DaisyUI integration
- **React Router (Wouter)** for client-side navigation
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for form handling

### Backend Architecture
- **Express.js** with TypeScript serving as the API layer
- **Session-based authentication** with express-session middleware
- **RESTful API design** with protected routes and error handling middleware
- **Service layer pattern** with separate services for authentication, email operations, and deliverability testing
- **Modular route registration** with centralized error handling

### Data Storage Solutions
- **Neon PostgreSQL** as the primary database
- **Drizzle ORM** for type-safe database operations and schema management
- **Database migrations** managed through Drizzle Kit
- **Comprehensive schema** covering users, email accounts, leads, sequences, campaigns, and inbox messages

### Authentication and Authorization
- **Bcrypt** for password hashing and verification
- **Session-based authentication** with secure cookie management
- **Route protection middleware** for securing API endpoints
- **User registration and login** with proper error handling

### External Dependencies
- **Mailtrap API** for deliverability testing and spam score analysis
- **SMTP/IMAP connections** for email sending and inbox monitoring
- **Encryption utilities** for securely storing email credentials
- **Redis** (configured for Celery task queue, though not yet implemented)
- **Vite** for development server and build tooling with HMR support

### Key Design Decisions
- **Monorepo structure** with shared schema between client and server
- **Type-safe API** using shared TypeScript types across frontend and backend
- **Component-driven UI** with reusable ShadCN components
- **Real-time query invalidation** for immediate UI updates after mutations
- **Encrypted credential storage** for secure email account management
- **Modular service architecture** for easy testing and maintenance