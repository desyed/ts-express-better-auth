# TS Express Better Auth

A robust authentication service built with TypeScript and Express.js, featuring Better Auth integration and PostgreSQL database support.

## Features

- 🔐 Secure authentication using Better Auth
- 🚀 TypeScript + Express.js
- 📦 PostgreSQL with Drizzle ORM
- 🛡️ Environment validation with Zod
- 🧪 Testing with Vitest
- 🎯 ESLint + Prettier configuration
- 🐳 Docker support for local development

## Prerequisites

- Node.js (LTS version recommended)
- Docker and Docker Compose
- PostgreSQL
- Better Auth credentials

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/desyed/ts-express-better-auth.git
cd ts-express-better-auth
```

1. Install dependencies:

```bash
npm install
```

1. Create a `.env` file in the root directory with the following variables:

```env
NODE_ENV=local
PORT=3000
DOMAIN=localhost
BASE_URL=http://localhost:3000
LOGGER=debug,info,warn,error
DB_URL=postgresql://postgres:password@localhost:7433/ts-express-better-auth
BETTER_AUTH_SECRET=your-secret-key
```

1. Start the development environment:

```bash
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the project
- `npm run start` - Start production server
- `npm run test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Database Commands

- `npm run compose:up` - Start PostgreSQL container
- `npm run compose:down` - Stop PostgreSQL container
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database
- `npm run db:studio` - Open Drizzle Studio

## Project Structure

