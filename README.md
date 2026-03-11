# ConnectyCube API (NestJS)

A lightweight NestJS GraphQL API that provides user registration and authentication backed by MongoDB and ConnectyCube.

## ✅ What this project does

- Register users into MongoDB via Mongoose
- Create a corresponding ConnectyCube user account
- Authenticate users using email/password
- Issue JWT access tokens (via `@nestjs/jwt`)
- Create ConnectyCube sessions (standard and system-token-based)

## 🧩 Key Modules

- `src/modules/auth/` - Authentication logic
  - `auth.service.ts` - user CRUD, JWT generation, ConnectyCube integration
  - `auth.resolver.ts` - GraphQL mutations (`register`, `login`)
  - `connectyCube.service.ts` - wrapper around ConnectyCube SDK calls
  - `dtos/` - GraphQL input/output types
  - `model/` - Mongoose schema for users

## 🔧 Requirements / Setup

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (e.g., `.env`):

```env
MONGO_URI=mongodb://localhost:27017/connecty_cube_api
JWT_SECRET=your_jwt_secret
APP_ID=<connectycube_app_id>
AUTH_KEY=<connectycube_auth_key>
```

3. Start the server:

```bash
npm run start:dev
```

Visit the GraphQL Playground: `http://localhost:3000/api`

## 🚀 Example GraphQL Usage

### Register a user

```graphql
mutation Register($body: UserRegisterInput!) {
  register(body: $body) {
    message
    user {
      id
      email
      firstName
      lastName
    }
  }
}
```

### Login

```graphql
mutation Login($body: LoginUserDto!) {
  login(body: $body) {
    message
    token
    connectySession
  }
}
```

## 🧪 Tests

```bash
npm run test
npm run test:e2e
```

## 📦 Production Build

```bash
npm run build
npm run start:prod
```

---

If you'd like to extend the project (refresh tokens, role-based auth, REST endpoints, etc.), the auth module is a good starting point.
