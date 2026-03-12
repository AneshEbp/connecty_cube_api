# ConnectyCube API (NestJS)

A lightweight **NestJS GraphQL backend for ConnectyCube apps**. This GraphQL API provides **secure user registration, authentication and real-time chat** backed by **MongoDB** and **ConnectyCube**, making it easy to build **chat apps, messaging apps, and RTC applications** with a ConnectyCube server-side auth flow.

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

## � How it works (high level)

### 1) User registration

- When a user registers, the backend:
  1. Stores the user in MongoDB (hashed password)
  2. Creates a corresponding user in ConnectyCube using the same email + password
  3. Saves the ConnectyCube user ID on the user record

> ✅ This gives the user a ConnectyCube identity without requiring manual sync.

### 2) Standard login (password-based)

- The user provides email + password.
- Backend validates the password and issues a JWT.
- Backend also creates a ConnectyCube session using the same credentials.

> ⚠️ This flow requires the ConnectyCube user password to match your system password.

### 3) Token-based ConnectyCube session (system token)

This flow lets your backend be the single source of truth for credentials and avoids the need to keep ConnectyCube passwords in sync:

1. User logs in with email + password.
2. Backend validates credentials and issues its own JWT (`token`).
3. Backend requests a ConnectyCube session by providing the JWT as the `login` value and a fixed system password (e.g. `cidp-temporary-password`).
4. ConnectyCube calls your `/auth/verify-connectycube` endpoint with the JWT to verify it.
5. If the JWT is valid, your endpoint returns the user payload (including `external_id`) and ConnectyCube issues a session.

> ✅ This avoids needing to update ConnectyCube passwords when users change theirs in your system.

## �🚀 Example GraphQL Usage

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

### Login (standard)

```graphql
mutation Login($body: LoginUserDto!) {
  login(body: $body) {
    message
    token
    connectySession
  }
}
```

### Login (token-based ConnectyCube session)

This flow avoids storing/updating passwords in ConnectyCube by using a system JWT as the ConnectyCube "password" when creating a session. It is useful when you want your backend to be the single source of truth for user credentials.

```graphql
mutation LoginByToken($body: LoginUserDto!) {
  login_By_token(body: $body) {
    message
    token
    connectySession
    ccUserId
  }
}
```

## ✅ ConnectyCube token verification endpoint

ConnectyCube can be configured to call your API for system-token verification.

- **Endpoint:** `GET /auth/verify-connectycube?token=<system_jwt>`
- Validates the JWT issued by this API and returns the user payload that ConnectyCube uses as `external_id`.

Example response:

```json
{
  "user": {
    "id": "<your-internal-user-id>",
    "email": "user@example.com"
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
