# 🔐 Auth Service Backend

REST API authentication service with JWT access/refresh tokens and token rotation mechanism.

## Tech Stack

| Category | Technology |
|----------|-----------|
| Runtime | Node.js + TypeScript 5.9 |
| Framework | Express 5 |
| Database | MongoDB + Mongoose 9 |
| Auth | JWT (access + refresh), bcrypt |
| Validation | Zod 4 |
| Testing | Jest 30, Supertest |

## Architecture

```
src/
├── config/          # env, db, cors configuration
├── middlewares/      # authenticate, validate, errorHandler
├── modules/
│   ├── auth/        # service, controller, router, schemas, types
│   └── user/        # model, service, types
├── utils/           # ApiError, jwt, password, cookie helpers
├── __tests__/
│   ├── unit/        # jwt.test.ts, auth.service.test.ts
│   └── integration/ # auth.routes.test.ts
├── app.ts
└── server.ts
```

**Patterns:** Service Layer, Constructor Injection (DI), Barrel Exports.

## API Endpoints

### Public

| Method | Route | Body | Description |
|--------|-------|------|-------------|
| `POST` | `/api/auth/register` | `{ email, password }` | Register a new user |
| `POST` | `/api/auth/login` | `{ email, password }` | Login and receive tokens |
| `POST` | `/api/auth/refresh` | — (cookie) | Refresh tokens (token rotation) |
| `POST` | `/api/auth/logout` | — (cookie) | Logout from current session |

### Protected (Bearer token)

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/logout-all` | Logout from all sessions |
| `GET`  | `/api/auth/me` | Get current user profile |

### Response Examples

**Register / Login:**
```json
{
  "status": "success",
  "data": {
    "accessToken": "eyJhbGci...",
    "user": { "id": "...", "email": "user@example.com" }
  }
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Invalid credentials",
  "statusCode": 401
}
```

## Token Rotation

```
Client              Server               DB
  │                   │                   │
  ├── login ─────────►│                   │
  │                   ├── save RT(1) ────►│
  │◄── AT + RT(1) ────┤                   │
  │                   │                   │
  ├── refresh RT(1) ─►│                   │
  │                   ├── delete RT(1) ──►│
  │                   ├── save RT(2) ────►│
  │◄── AT + RT(2) ────┤                   │
  │                   │                   │
  ├── refresh RT(1) ─►│  ⚠ reuse!        │
  │                   ├── delete ALL ────►│
  │◄── 401 ───────────┤                   │
```

- Each refresh issues a **new** refresh token and deletes the old one
- Reuse of an old token = **compromise detected** → all sessions are revoked
- Refresh token is stored in an `httpOnly` cookie

## Quick Start

### 1. Start MongoDB

```bash
docker compose up -d
```

### 2. Configuration

Create a `.env` file:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/auth-service

ACCESS_TOKEN_SECRET=your-access-secret-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-secret-min-32-chars
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d
BCRYPT_COST=12
```

### 3. Install & Run

```bash
yarn install
yarn dev
```

Server starts at `http://localhost:5000`.

### 4. Verify

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## Scripts

```bash
yarn dev           # Development with hot-reload (tsx watch)
yarn build         # Compile TypeScript → dist/
yarn start         # Production (node dist/server.js)
yarn test          # Run all tests
```

## Testing

```bash
# All tests
yarn test

# Unit only
yarn jest src/__tests__/unit

# With coverage
yarn jest --coverage
```

Unit tests mock dependencies via `jest.mock()` — `ts-jest` compiles tests as CommonJS regardless of the project's ESM configuration.

## Validation

Input data is validated through Zod 4 middleware:

- **Register:** email (valid format) + password (min 8 characters)
- **Login:** email + password (required)

Validation errors return `400` with details:

```json
{
  "status": "error",
  "message": "[{\"path\":\"password\",\"message\":\"Password must be at least 8 characters\"}]"
}
```

## Security

- Passwords are hashed with **bcrypt** (configurable cost factor)
- Access token — short-lived (15m), sent via `Authorization: Bearer` header
- Refresh token — stored in **httpOnly secure cookie** (SameSite: Strict)
- Token type validation — access token cannot be used as refresh and vice versa
- Helmet for HTTP security headers
