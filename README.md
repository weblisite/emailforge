# EmailForge - Cold Email Automation Platform

## Overview

EmailForge is a sophisticated cold email automation platform designed for B2B sales teams, marketers, and lead generation agencies. It enables scalable outbound email campaigns with high deliverability through unlimited SMTP/IMAP account connections, automated email rotation, and built-in deliverability testing.

## Features

- **Multi-Account Email Management**: Connect unlimited SMTP/IMAP accounts
- **Lead Management**: Import and manage leads with custom fields
- **Email Sequences**: Create multi-step email sequences with delays
- **Campaign Management**: Launch and monitor email campaigns
- **Inbox Monitoring**: Unified inbox for reply tracking
- **Deliverability Testing**: Built-in spam score and domain reputation checking
- **Analytics Dashboard**: Real-time campaign performance metrics
- **Secure Authentication**: Session-based security with encrypted credentials

## Tech Stack

### Frontend
- React 18 + TypeScript
- ShadCN UI + Radix UI components
- Tailwind CSS + Bootstrap 5
- TanStack Query for state management
- React Hook Form + Zod validation

### Backend
- Express.js + TypeScript
- Neon PostgreSQL (serverless)
- Drizzle ORM
- Session-based authentication
- Nodemailer + IMAP for email handling

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Neon account)
- SMTP/IMAP email accounts for testing

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EmailForge
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your actual values:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for sessions
   - `ENCRYPTION_KEY`: A secure random string for encryption
   - `MAILTRAP_API_TOKEN`: (Optional) For deliverability testing

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `SESSION_SECRET` | Secret for session encryption | Yes | - |
| `ENCRYPTION_KEY` | Secret for email credential encryption | Yes | - |
| `MAILTRAP_API_TOKEN` | API token for deliverability testing | No | - |
| `PORT` | Server port | No | 5000 |

## Database Schema

The application uses a comprehensive schema with the following main entities:

- **Users**: Authentication and user management
- **Email Accounts**: Connected SMTP/IMAP accounts
- **Leads**: Target contacts for campaigns
- **Sequences**: Multi-step email sequences
- **Campaigns**: Campaign instances and tracking
- **Campaign Emails**: Individual email tracking
- **Inbox Messages**: Reply monitoring

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Core Features
- `GET /api/dashboard/metrics` - Dashboard statistics
- `GET /api/email-accounts` - List email accounts
- `GET /api/leads` - List leads
- `GET /api/sequences` - List email sequences
- `GET /api/campaigns` - List campaigns
- `GET /api/inbox` - List inbox messages

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

### Project Structure

```
EmailForge/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   ├── lib/           # Utilities and API
│   │   └── hooks/         # Custom React hooks
├── server/                 # Express.js backend
│   ├── services/          # Business logic services
│   ├── routes.ts          # API route definitions
│   └── storage.ts         # Database operations
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema
└── migrations/             # Database migrations
```

## Security Features

- **Password Encryption**: Bcrypt with salt rounds
- **Credential Storage**: AES-256-CBC encryption for email passwords
- **Session Management**: Secure session handling
- **Input Validation**: Zod schema validation
- **Route Protection**: Authentication middleware

## Deployment

The application is configured for deployment on Render. The build process creates a production bundle with:

- Frontend: Static files served by Express
- Backend: Compiled TypeScript with ESBuild
- Database: Neon PostgreSQL (serverless)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please check the existing issues or create a new one in the repository.
