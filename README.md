# Bun + Hono + Prisma Boilerplate

A modern, high-performance API boilerplate built with Bun runtime, Hono web framework, and Prisma ORM.

## Features

- 🚀 **Bun Runtime** - Ultra-fast JavaScript runtime
- ⚡ **Hono Framework** - Lightweight and fast web framework
- 🗄️ **Prisma ORM** - Type-safe database access
- 🔐 **JWT Authentication** - Secure authentication system
- 📝 **Zod Validation** - Runtime type checking and validation
- 🛡️ **Role-based Access Control** - Admin and user roles
- 🔄 **Password Management** - Reset and change password functionality
- ✉️ **Email Verification** - User email verification system
- 📊 **Structured Error Handling** - Comprehensive error management
- 🎯 **TypeScript** - Full type safety

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) installed
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bun-hono-prisma-boilerplate
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database URL and JWT secret
```

4. Set up the database:
```bash
# Generate Prisma client
bun run prisma:generate

# Run database migrations
bun run prisma:migrate:dev

# Seed the database (optional)
bun run db:seed
```

5. Start the development server:
```bash
bun run dev
```

The API will be available at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /v1/users/auth/register` - Register a new user
- `POST /v1/users/auth/login` - Login user
- `POST /v1/users/auth/logout` - Logout user
- `POST /v1/users/auth/refresh-tokens` - Refresh JWT tokens
- `POST /v1/users/auth/forgot-password` - Request password reset
- `POST /v1/users/auth/reset-password` - Reset password
- `GET /v1/users/auth/verify-email` - Verify email address
- `POST /v1/users/auth/change-password` - Change password (authenticated)

### User Management (Admin only)
- `GET /v1/users` - Get all users
- `POST /v1/users` - Create new user
- `GET /v1/users/:id` - Get user by ID
- `PATCH /v1/users/:id` - Update user
- `DELETE /v1/users/:id` - Delete user
- `PATCH /v1/users/:id/deactivate` - Deactivate user
- `PATCH /v1/users/:id/activate` - Activate user

## Project Structure

```
src/
├── commons/           # Base interfaces and types
├── controllers/       # Request handlers
├── exceptions/        # Custom error classes
├── middlewares/       # Authentication and error handling
├── prisma/           # Database schema and migrations
├── services/         # Business logic
├── utils/            # Utility functions
├── validations/      # Zod schemas
└── v1/              # API routes
```

## Scripts

- `bun run dev` - Start development server with hot reload
- `bun run start` - Start production server
- `bun run build` - Build for production
- `bun run prisma:generate` - Generate Prisma client
- `bun run prisma:migrate:dev` - Run database migrations
- `bun run prisma:studio` - Open Prisma Studio
- `bun run db:seed` - Seed database with sample data

## Environment Variables

```env
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
NODE_ENV=development
```

## Default Users (after seeding)

- **Admin**: admin@example.com / admin123
- **User**: user@example.com / user123

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.