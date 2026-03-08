# Booking API

Backend service for a property booking platform built with NestJS, Prisma, and PostgreSQL.

This API covers:

- authentication and user management
- listings and listing units
- unit calendar blocking
- bookings and booking-day occupancy tracking
- reviews
- file uploads (Cloudinary) and entity attachments

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Domain Model](#domain-model)
- [API Conventions](#api-conventions)
- [Business Rules](#business-rules)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Database and Seed](#database-and-seed)
- [Scripts](#scripts)
- [Endpoint Map](#endpoint-map)
- [Upload Flow](#upload-flow)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)

## Tech Stack

- Node.js + TypeScript
- NestJS 11
- Prisma 7 + PostgreSQL
- JWT auth (access + refresh)
- Cloudinary (media storage)
- Swagger/OpenAPI
- Jest (unit tests)

## Architecture Overview

The codebase is organized by domain modules under `src/modules/*`.

Key runtime pieces:

- global prefix: `/api`
- URI versioning: `/v1` (for all controllers)
- global validation via `ValidationPipe`
- global response wrapper via `ResponseInterceptor`
- global error mapping via `AllExceptionsFilter`
- global rate limit via `ThrottlerGuard` (100 requests / 60 seconds)

Request flow:

1. HTTP request hits controller route (`/api/v1/...`).
2. If route uses `@Authorization()`, JWT guard validates Bearer token.
3. DTO validation and transformation runs.
4. Service executes business logic and Prisma queries.
5. DTO serialization (`class-transformer`) shapes final payload.
6. Response interceptor wraps result in unified envelope.

## Domain Model

Main entities:

- `User` - account, credentials, role, activation fields
- `Role` - `ADMIN` / `USER`
- `Token` - per-user refresh token storage
- `Profile` - user profile details + avatar file relation
- `Listing` - property listing
- `ListingUnit` - concrete bookable unit in a listing
- `UnitCalendarDay` - day-level availability/blocked state per unit
- `Booking` - booking made by a guest for a unit
- `BookingDay` - derived occupied day records for booking periods
- `Review` - one review per booking
- `Amenity` - reusable listing amenities
- `File` - uploaded media metadata
- `ListingFile`, `ReviewFile` - many-to-many file attachments

Important relationship notes:

- booking points directly to `unit` and optionally to `listing`
- listing units are managed through `/listings/:listingId/units`
- listing responses do not include `listingUnits` array
- decimal values are returned as strings (for precision safety)

## API Conventions

### Base URL and Version

- Base URL: `http://localhost:3000`
- API prefix: `/api`
- Versioned routes: `/api/v1/...`

### Swagger

- UI: `GET /api`
- OpenAPI JSON: `GET /swagger.json`
- OpenAPI YAML: `GET /swagger.yaml`

### Authentication

- Access token: JWT in `Authorization: Bearer <token>`
- Refresh token: HttpOnly cookie (`refreshToken`)
- Auth endpoints:
  - `POST /api/v1/auth/register`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/auth/logout`
  - `POST /api/v1/auth/refresh`

### Response Envelope

Non-paginated:

```json
{
  "success": true,
  "message": "Success",
  "data": {}
}
```

Paginated:

```json
{
  "success": true,
  "message": "Success",
  "data": [],
  "total": 0,
  "page": 1,
  "totalPages": 0,
  "pageSize": 10,
  "nextPage": null,
  "prevPage": null
}
```

### List Query Parameters

Supported on most `GET /resource` endpoints:

- `page` (default `1`)
- `pageSize` (default `10`, max `100`)
- `ordering` (`field` or `-field`)
- `search` (case-insensitive contains on string fields)

### Error Shape

Errors are normalized by `AllExceptionsFilter`.

Typical status mapping:

- `400` validation/business rule violation
- `401` unauthorized
- `404` Prisma not found (`P2025`)
- `409` unique constraint (`P2002`)
- `500` internal server error

## Business Rules

### Users and Auth

- registration enforces strong password pattern
- login validates email + password (bcrypt compare)
- refresh token is stored per user and rotated on refresh

### Listings and Units

- listing CRUD is owner-scoped for update/delete
- listing units are nested under listing routes
- unit CRUD checks listing ownership

### Unit Calendar

- owner can create/update/delete unit calendar days
- day state can be `AVAILABLE` or `BLOCKED`
- optional per-day overrides: `priceOverride`, `minNights`, `note`

### Bookings

- booking is guest-scoped (you only read your own bookings)
- `guestsCount` must not exceed unit `capacity`
- `checkOut` must be later than `checkIn`
- for active statuses (`PENDING`, `CONFIRMED`, `COMPLETED`):
  - date range must not overlap blocked `UnitCalendarDay`
  - `BookingDay` rows are generated for each stay date
- on booking update, old `BookingDay` rows are rebuilt

### Reviews

- one review per booking (`bookingId` unique)
- only booking guest can create/update/delete own review
- review creation allowed only for `COMPLETED` bookings

### Files and Uploads

- uploads go to Cloudinary from memory buffer
- allowed mimetypes: image/_, video/_
- max file size:
  - image: 10 MB
  - video: 100 MB
- targets:
  - `PROFILE_AVATAR` (no `targetId`)
  - `LISTING` (`targetId` required, owner check)
  - `REVIEW` (`targetId` required, author check)
- failed attachment triggers cleanup (uploaded file gets deleted)

## Environment Variables

Create `.env` from `.env.example`.

| Variable                | Required | Description                             |
| ----------------------- | -------- | --------------------------------------- |
| `NODE_ENV`              | yes      | `development` / `production`            |
| `DATABASE_URL`          | yes      | PostgreSQL connection string            |
| `PORT`                  | yes      | API port, usually `3000`                |
| `API_URL`               | yes      | Public API base URL                     |
| `FRONT_URL`             | yes      | Frontend URL for CORS and cookie domain |
| `CLOUDINARY_CLOUD_NAME` | yes      | Cloudinary cloud name                   |
| `CLOUDINARY_API_KEY`    | yes      | Cloudinary API key                      |
| `CLOUDINARY_API_SECRET` | yes      | Cloudinary API secret                   |
| `JWT_REFRESH_SECRET`    | yes      | Refresh token signing secret            |
| `JWT_ACCESS_SECRET`     | yes      | Access token signing secret             |
| `JWT_REFRESH_TOKEN_TTL` | yes      | Example: `7d`                           |
| `JWT_ACCESS_TOKEN_TTL`  | yes      | Example: `12h`                          |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm
- Docker (for local PostgreSQL)

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

Fill all required values in `.env`.

### 3) Start PostgreSQL

```bash
docker compose up -d
```

### 4) Apply schema

Choose one workflow:

Option A (migrations):

```bash
pnpm prisma:migrate
```

Option B (push schema directly):

```bash
pnpm prisma:push
```

### 5) Seed demo data

```bash
pnpm prisma:seed
```

### 6) Run the API

```bash
pnpm start
```

Or run DB + watch mode together:

```bash
pnpm dev
```

## Database and Seed

Seed entrypoint: `prisma/seed/seed.ts`

Seed process:

1. truncates all public tables except `_prisma_migrations`
2. creates roles, users, profiles, tokens
3. creates amenities, listings, listing units
4. creates unit calendar days, bookings, booking days, reviews

Seeded user credentials:

- password for all seeded users: `11111`
- sample admin: `alex@example.com`

## Scripts

### App

- `pnpm dev` - start PostgreSQL (docker compose) and run Nest in watch mode
- `pnpm start` - run Nest app
- `pnpm start:debug` - debug watch mode
- `pnpm build` - build project
- `pnpm start:prod` - run built app from `dist`

### Quality

- `pnpm typecheck`
- `pnpm lint` / `pnpm lint:check`
- `pnpm format` / `pnpm format:check`

### Tests

- `pnpm test`
- `pnpm test:watch`
- `pnpm test:cov`
- `pnpm test:e2e`

### Prisma

- `pnpm prisma:generate`
- `pnpm prisma:push`
- `pnpm prisma:push-force`
- `pnpm prisma:migrate`
- `pnpm prisma:migrate:create`
- `pnpm prisma:migrate-reset`
- `pnpm prisma:seed`
- `pnpm prisma:studio`

### Docker

- `pnpm docker` - docker compose up (with env file, build)
- `pnpm docker:down` - docker compose down

## Endpoint Map

All routes are under `/api/v1`.

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/logout`
- `POST /auth/refresh`

### Users (authenticated)

- `GET /users`
- `GET /users/:id`
- `PATCH /users/:id`
- `PATCH /users/:id/change-password`
- `DELETE /users/:id`

### Profiles (authenticated)

- `GET /profiles/me`
- `POST /profiles`
- `PATCH /profiles`

### Amenities (authenticated)

- `GET /amenities`
- `GET /amenities/:id`
- `POST /amenities`
- `PATCH /amenities/:id`
- `DELETE /amenities/:id`

### Listings (authenticated)

- `GET /listings`
- `GET /listings/:id`
- `POST /listings`
- `PATCH /listings/:id`
- `DELETE /listings/:id`

### Listing Units (authenticated)

- `GET /listings/:listingId/units`
- `GET /listings/:listingId/units/:unitId`
- `POST /listings/:listingId/units`
- `PATCH /listings/:listingId/units/:unitId`
- `DELETE /listings/:listingId/units/:unitId`

### Unit Calendar Days (authenticated)

- `GET /unit-calendar-days`
- `GET /unit-calendar-days/:id`
- `POST /unit-calendar-days`
- `PATCH /unit-calendar-days/:id`
- `DELETE /unit-calendar-days/:id`

### Bookings (authenticated)

- `GET /bookings`
- `GET /bookings/:id`
- `POST /bookings`
- `PATCH /bookings/:id`
- `DELETE /bookings/:id`

### Reviews (authenticated)

- `GET /reviews`
- `GET /reviews/:id`
- `POST /reviews`
- `PATCH /reviews/:id`
- `DELETE /reviews/:id`

### Uploads (authenticated, multipart)

- `POST /uploads`
- `POST /uploads/bulk`
- `DELETE /uploads/bulk`
- `DELETE /uploads/:id`

### Files (authenticated)

- `GET /files`
- `GET /files/:id`

## Upload Flow

### Single file

- Endpoint: `POST /api/v1/uploads`
- Content type: `multipart/form-data`
- File field name: `file`
- Optional fields: `folder`, `targetType`, `targetId`, `order`

### Bulk file upload

- Endpoint: `POST /api/v1/uploads/bulk`
- Content type: `multipart/form-data`
- File field name: `files`
- Uses same optional metadata fields

### Target attachment rules

- `targetType = PROFILE_AVATAR` -> `targetId` must be omitted
- `targetType = LISTING` -> `targetId` is required
- `targetType = REVIEW` -> `targetId` is required

## Testing

Run all unit tests:

```bash
pnpm test
```

Run coverage:

```bash
pnpm test:cov
```

## Project Structure

```text
src/
  app/
  common/
    constants/
    decorators/
    dtos/
    filters/
    interceptors/
    types/
    utils/
  modules/
    amenity/
    auth/
    booking/
    cloudinary/
    file/
    listing/
    profile/
    review/
    token/
    unit-calendar-day/
    upload/
    user/
  prisma/
    prisma.module.ts
    prisma.service.ts
prisma/
  migrations/
  models/
  seed/
```

## Troubleshooting

### `P2025` / "Resource not found"

- The requested entity does not exist or is not visible in current ownership scope.
- Verify IDs and authenticated user context.

### Login fails after reset

- Ensure seed was executed:
  - `pnpm prisma:seed`
- Seeded password is `11111`.

### Port already in use (`EADDRINUSE: 3000`)

- Stop existing process on port 3000 or change `PORT` in `.env`.

### Upload validation errors

Run coverage:

```bash
pnpm test:cov
```

## Project Structure

```text
src/
  app/
  common/
    constants/
    decorators/
    dtos/
    filters/
    interceptors/
    types/
    utils/
  modules/
    amenity/
    auth/
    booking/
    cloudinary/
    file/
    listing/
    profile/
    review/
    token/
    unit-calendar-day/
    upload/
    user/
  prisma/
    prisma.module.ts
    prisma.service.ts
prisma/
  migrations/
  models/
  seed/
```

## Troubleshooting

### `P2025` / "Resource not found"

- The requested entity does not exist or is not visible in current ownership scope.
- Verify IDs and authenticated user context.

### Login fails after reset

- Ensure seed was executed:
  - `pnpm prisma:seed`
- Seeded password is `11111`.

### Port already in use (`EADDRINUSE: 3000`)

- Stop existing process on port 3000 or change `PORT` in `.env`.

### Upload validation errors

- Ensure file is image/video
- Ensure file size is within limits
- Ensure `targetType`/`targetId` combination is valid

## License

`UNLICENSED` (see `package.json`).
