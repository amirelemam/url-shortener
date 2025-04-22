# URL Shortener

A simple URL‑shortening service with:

- Custom & auto‑generated slugs
- Per‑user URL management
- Visit analytics (counts, recent visits, browser breakdown)
- Next.js frontend for redirection

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Requirements](#requirements)
5. [Getting Started](#getting-started)
   - [Clone the repo](#clone-the-repo)
   - [Environment Variables](#environment-variables)
   - [Run with Docker](#run-with-docker)
   - [Run Locally](#run-locally)
6. [Running Tests](#running-tests)
7. [API Documentation](#api-documentation)
8. [Usage Examples](#usage-examples)
9. [Future Improvements](#future-improvements)
10. [License](#license)

---

## Project Overview

A simple URL‑shortening service with:

- Custom & auto‑generated slugs
- Per‑user URL management
- Visit analytics (counts, recent visits, browser breakdown)
- Next.js frontend for redirection

---

## Features

- **Create Short URL** `POST /api/shorten`
- **Redirect** `GET /:slug`
- **CRUD** on your URLs (protected by JWT)
- **Analytics** `GET /api/analytics/:slug`
- **Swagger UI** `GET /api/docs`

---

## Tech Stack

- **Backend**: NestJS 11, Prisma ORM, PostgreSQL 15
- **Frontend**: Next.js 15, React 19
- **Auth**: JWT, Passport-local
- **Docker Compose** with multi‑container setup

---

## Requirements

- Docker & Docker Compose
- ≥ 6 GB free disk space
- (if running locally) Node.js 22, Yarn

---

## Getting Started

### Clone the repo

```bash
git clone https://github.com/your‑org/url-shortener.git
cd url-shortener
```

### Environment Variables

Create a .env in /backend:

```
DATABASE_URL=postgresql://postgres:mypass@db:5432/postgres?schema=public
JWT_SECRET=your_jwt_secret
BASE_URL=http://localhost:3001
```

And in /frontend:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run with Docker

`docker compose up --build`

- Backend on http://localhost:3001
- Frontend on http://localhost:3000
- Swagger on http://localhost:3001/docs

### Run Locally (Optional)

```
# Backend
cd backend
yarn install
yarn prisma migrate dev
yarn start:dev

# Frontend
cd frontend
yarn install
yarn dev
```

## Running Tests

```
# From /backend
npx jest
```

## API Documentation

Once the app is up, visit:

`http://localhost:3001/api/docs`

## Usage Examples

```
# Shorten
curl -X POST http://localhost:3001/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"longUrl":"https://example.com","customSlug":"my-link"}'

# Redirect
# In browser: http://localhost:3000/my-link
```

## Future Improvements

- Create end‑to‑end & unit tests for the frontend
- Reduce Docker image size
- Add rate‑limit customization per‑user

## License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) for details.
