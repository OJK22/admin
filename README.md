# Library Staff Administration UI

A React + TypeScript frontend for staff, groups, and permission-management workflows in a library-management environment.

## Features

The current interface includes staff dashboards, employee records, group membership, permission-aware UI, and administrative lookup data. The API and database are maintained separately from this frontend.

## Technology

- React 18 and TypeScript
- Vite and React Router
- Tailwind CSS and shadcn/ui
- TanStack Query
- ESLint and Playwright tooling where configured

## Requirements

Use a supported Node.js version and npm.

## Run locally

```bash
npm ci
npm run dev
```

## Quality checks

```bash
npm run lint
npm test
npm run build
```

Run these checks before submitting changes and report any failures accurately.

## Security

The frontend must never be treated as the source of truth for permissions. The backend must authenticate requests and enforce authorization independently of client-side state. Use HTTPS in production, avoid hard-coded deployment secrets, and do not commit real user data or credentials.

## Related projects

- [Main library frontend](https://github.com/OJK22/front)
- [Books management UI](https://github.com/OJK22/books)
- [Lending prototype](https://github.com/OJK22/loan)

## Contributing

Open an issue for substantial changes. Keep pull requests focused, describe the behavior changed, and include relevant tests or manual verification steps.

## License

MIT. See [LICENSE](./LICENSE).
