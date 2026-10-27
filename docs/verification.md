# Verification — 27 October 2026

- `npm run test:backend`: 10/10 passed on isolated in-memory PGlite. Includes all 13 original tables/columns/types and FK targets, migration re-application, demo counts, booking persistence/conflicts, input validation, orphan rejection and admin authorization.
- `npm run build`: passed.
- `tsc --noEmit --incremental false`: passed.
- Scoped `oxlint backend components/cinema lib/use-cinema.ts app/page.tsx`: passed.
- Persistent PGlite demo: migrations + seed + consistency verifier passed; initial counts: 126 screenings, 120 seats, 120 bookings/tickets/payments/notifications, 100 users/favorites.
- Browser: catalogue loaded through `/api` proxy from the new database; guest Timo Triisa / timo@example.test booked Batman 17:00, seat A3; actual confirmation reference returned. This adds a booking and ticket to the persistent demo.
- Word study guide: all 9 rendered pages visually inspected.

Docker is not installed on this machine. The Compose file and PostgreSQL driver are provided, but container startup and named-volume persistence have not been executed here. PGlite checks do not replace that final check. No Redis/cache is enabled; README contains the required cache plan. No performance improvement is claimed without query-plan measurements. The current GitHub repository had no review issues; other repositories and the actual Jira board were not inspected.
