# Library Staff Administration UI

A React + TypeScript frontend for managing staff accounts and access configuration in a library-management environment.

> This repository contains the frontend only; the API and database are maintained separately.

## Features represented in the current source

- Staff dashboard and overview
- Employee records and employee profiles
- Groups and group membership
- Permission listing and permission-aware UI
- Administrative lookup data and dashboard statistics

The interface calls the API through the request helpers in `src/lib/api.ts`.

## Technology

- React 18 and TypeScript
- Vite
- React Router
- Tailwind CSS and shadcn/ui
- TanStack Query
- ESLint and Playwright test tooling (where configured)

## Requirements

- Node.js and npm compatible with the versions declared in `package.json` and `package-lock.json`.

## Run locally

```bash
npm ci
npm run dev
```

The Vite development server is configured to use port `5001`.

## Quality checks

```bash
npm run lint
npm test
npm run build
```

Run these commands locally or in CI before treating a change as verified.

## API configuration and security notes

The current API base URL is hard-coded in `src/lib/api.ts` and uses HTTP. This should be moved to a deployment-specific configuration and served over HTTPS before production use. Do not change the API host without verifying the backend endpoint and deployment routing.

The frontend stores the bearer token in browser local storage. Any script executing in the same origin can access that storage. Consider a server-managed HttpOnly, Secure, SameSite cookie session if the backend supports it. The API must enforce permissions independently; a username or locally stored permission list must never grant server-side access.

## Related repositories

- [Main library frontend](https://github.com/OJK22/front)
- [Books management UI](https://github.com/OJK22/books)
- [Lending prototype](https://github.com/OJK22/loan)

## License and project rights

No open-source license is currently included. Do not assume permission to reuse or redistribute this code until the rights holder(s) have selected and added an OSI-approved license. Confirm any municipal and team ownership obligations first.
