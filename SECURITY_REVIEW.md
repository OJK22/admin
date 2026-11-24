# Security review notes

## Findings requiring follow-up
- The API base URL in `src/lib/api.ts` uses plain HTTP. Production authentication tokens and API data should only travel over HTTPS. Confirm the API host supports a valid TLS certificate, then move the base URL to a deployment environment variable configured with an HTTPS endpoint.
- The frontend treats a local profile named `admin` as having every permission. This is not a security boundary. Enforce roles and permissions on the ASP.NET API for every endpoint.
- The bearer token is stored in local storage and is readable by same-origin JavaScript. Consider an HttpOnly, Secure, SameSite cookie session if supported by the backend.

## Changes in this branch
- Ignore local `.env*` files while allowing a committed `.env.example` template.
- No tracked files were deleted.
