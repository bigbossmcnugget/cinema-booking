# Cinema booking / Lumen

TypeScript cinema coursework: React frontend, Node.js HTTP backend, Drizzle ORM and PostgreSQL. A visitor chooses a date, film and screening, selects seats and creates a guest booking. EN / RU / ET interface; no registration, real payments or outgoing emails.

## Backend choice

TypeScript keeps browser and server code in one language. Drizzle describes PostgreSQL tables, foreign keys, constraints and indexes in TypeScript and generates versioned migrations. The HTTP service uses Drizzle queries and a transaction for a booking plus its tickets; Zod validates incoming JSON at runtime.

The supplied database design is preserved unchanged in `database/source/`. All 13 tables were implemented. Guest bookings required an explicit amendment: nullable `bookings.user_id` and added guest contact/reference fields. See [schema mapping](database/schema-mapping.md). Imported design authorship is not reassigned to this repository's committer.

## Run with Docker PostgreSQL (assignment path)

Requirements: Node.js >=22.13, npm, Docker Engine/Desktop with Compose. Run all commands from the folder containing this README and package.json.

```sh
npm ci
cp .env.example .env
docker compose up -d --wait db
npm run pg:migrate
npm run pg:seed
npm run pg:verify
```

Use two terminals:

```sh
# Terminal 1: API on 127.0.0.1:3001
npm run api:dev
```

```sh
# Terminal 2: frontend on 127.0.0.1:3000
npm run dev
```

Open http://127.0.0.1:3000/. Vite forwards `/api` to the Node service. The frontend catalogue and seat availability come from that service and the selected database. Production deployment is not configured; the current development proxy is not a production API gateway.

`docker-compose.yml` starts PostgreSQL 17, binds only to localhost:5433 and keeps data in the named volume `cinema_postgres` (Compose normally prefixes the volume name with the project name). `docker compose down` preserves it; `docker compose down -v` deletes it. Do not delete the volume to restart a demo. The default password is for local coursework, not deployment.

`pg:seed` requires an empty application database and refuses to overwrite existing data. It runs one transaction. Faker generates demo names, dates, ratings, references and messages. The three real film titles/posters are deliberate fixtures. Each larger table has >=100 rows: 126 screenings; 120 bookings, tickets, payments and notifications. There are also 100 users, 120 seats and 100 favorites. Seed accounts are disabled placeholders, and payments are marked `DEMO_ONLY`. No payment provider is called.

## Local fallback when Docker is unavailable

PGlite runs embedded PostgreSQL with the same Drizzle schema and migration, but does not prove Docker itself works.

```sh
npm ci
npm run demo:prepare
npm run api:local
```

In another terminal run `npm run dev`. The local PostgreSQL files live in ignored `.data/postgres`. `demo:prepare` migrates and seeds an empty database; on later runs it preserves data and verifies it. Stop `api:local` before running a separate CLI process against the same PGlite directory: it is a single-process embedded database.

Seed screenings cover 21 days from the first seed. For a demonstration much later, create a separate new demo database or add future screenings through ORM; do not silently erase existing bookings. Faker's random seed is fixed, while screening dates intentionally depend on the day of the initial seed.

## Structure

- `app/page.tsx`: short composition of page sections.
- `components/cinema/`: header, date selector, catalogue, search, film details, booking dialog, footer and mobile menu.
- `lib/use-cinema.ts`: React state, HTTP requests, seat selection and form submission.
- `lib/catalog.ts`, `lib/ui-copy.ts`: three-film presentation fixtures and translations; actual daily showtimes and English catalogue fields are loaded from PostgreSQL.
- `backend/schema.ts`: all 13 PostgreSQL tables, checks, foreign keys and ORM relations.
- `backend/migrations/`: migrations generated with `npm run pg:generate`; apply with `pg:migrate`.
- `backend/service.ts`: database queries, screening lookup and atomic guest booking.
- `backend/server.ts`: HTTP routes, body limit, validation handling and server-side admin guard.
- `backend/seed.ts`, `backend/verify.ts`: demo data and consistency checks.
- `database/source/`: unchanged supplied SQL and diagrams; `database/project.sql`: generated current schema reference.
- `database/legacy-d1/`: archived old two-table SQLite implementation, excluded from compilation and not used by the site.

## API and access control

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Database connectivity and active driver |
| GET | `/api/catalog?date=YYYY-MM-DD` | Active movies with that day's actual screening times; optional `q` title prefix and `genre` |
| GET | `/api/bookings?showtimeKey=...` | Current occupied seats, hall and price; `Cache-Control: no-store` |
| POST | `/api/bookings` | Public guest booking, validated on server |
| PATCH | `/api/admin/movies/:id` | Change description/active state, requires private admin Bearer token |

POST accepts only `showtimeKey`, `customerName`, `customerEmail`, `seats`. The server finds the real screening/hall and price, validates 1–10 distinct seats, and writes the booking and tickets in one transaction. `UNIQUE(screening_id, seat_id)` rejects competing seat reservations. The frontend's claimed price, role and status are not trusted or accepted.

Admin changes are disabled unless `ADMIN_API_TOKEN` is a private random value of at least 32 characters in the API environment. Never put it in a Vite/client environment variable or commit it. Without a valid Bearer token the endpoint returns 403 in every mode, regardless of UI buttons or `x-role` headers. This is a single administrator service credential, not a complete user login/role system. Seed user roles do not grant HTTP access.

## Indexes (declared through ORM)

Original index names are retained so the migration can be compared with the supplied design. PostgreSQL automatically indexes primary/unique constraints, but does not automatically index every referencing foreign-key column.

| Index / columns | Query or purpose |
| --- | --- |
| `idx_movies_title` / title | Catalogue sorts by title; useful for exact-title lookup. Plain B-tree does not guarantee acceleration of ILIKE prefix or substring searches. |
| `idx_movies_filters` / age_rating, critics_rating, original_language | Retained original planned filter; current UI does not query these filters. Reassess when implementing them. |
| `idx_screenings_movie_start` / movie_id, starts_at | Catalogue joins films to screenings and selects a day; booking resolves a film and exact start time. |
| `idx_screenings_hall_start` / hall_id, starts_at | Retained original index for a hall schedule, redundant with the existing unique constraint on these columns; it can be removed after comparing plans. |
| `idx_bookings_user_created` / user_id, created_at | Original planned customer history; no account/history page yet. |
| `idx_payments_booking` / booking_id | Payment-to-booking lookup and FK maintenance; demo payment table has no public payment endpoint. |
| `idx_notifications_user_created` / user_id, created_at | Original planned notification inbox; no inbox UI yet. |
| `idx_movies_release` / release_date | Planned latest-release ordering; no release-date filter UI yet. |
| `idx_movie_genres_genre` / genre_id | Genre-to-film lookup and FK maintenance. |
| `idx_bookings_screening` / screening_id | Booking-to-screening lookups and FK maintenance. |
| `idx_tickets_booking` / booking_id | Tickets for a booking; added because this FK had no leading index. |
| `idx_tickets_seat` / seat_id | Ticket-to-seat lookup and FK maintenance. |
| `idx_favorites_movie` / movie_id | Favorites for a film and FK maintenance. |
| `idx_notifications_booking` / booking_id | Notifications for a booking and FK maintenance. |
| UNIQUE tickets / screening_id, seat_id | Current occupied-seat lookup and final protection against double booking. |
| UNIQUE seats / hall_id, row_label, seat_number | Current hall seat lookup and unique seat labels. |

Use actual query plans on larger datasets before claiming speed improvements. The 120-row demo does not establish a performance benchmark, and the frontend's in-memory search is not accelerated by a database index.

## Cache plan (required; implementation optional)

No shared cache or Redis is currently enabled. All current API responses use `no-store`.

| Proposed cache key | TTL | Invalidation |
| --- | --- | --- |
| `catalog:{date}:{query}:{genre}` | 60 seconds | Film description/visibility changes; screening creation, change or cancellation; price changes. Include every filter in the key. |
| `cinema:{id}:{locale}` | 1 hour | Cinema address, translation or hall changes. |
| `latest-films:{locale}:{page}` (future) | 5 minutes | Film added, release date changed or visibility changed. |
| Occupied seats / booking confirmation | Do not share-cache | Read database when opening seats and enforce uniqueness when writing. Never put guest names/emails in a shared catalogue cache. |

Invalidate only after the database transaction succeeds. If free-seat counts are later included in the catalogue, successful booking/cancellation must also invalidate the affected screening cache. Redis is optional for this assignment and can be added after correctness is established.

## Checks and known limits

```sh
npm run test:backend
npm run build
./node_modules/.bin/tsc --noEmit --incremental false
```

Backend tests use an isolated in-memory PGlite database, apply migrations twice, compare original table/column names, verify row counts and consistency, exercise guest bookings, concurrent seat conflicts, bad JSON field types, forged price/role, orphan FKs and admin access. The persistent preview uses the same schema through PGlite. Docker PostgreSQL commands are provided but could not be executed on this machine because Docker is not installed.

Guest reservations have no expiry worker, cancellation or payment flow yet. All existing tickets continue to occupy their seats; cancellation needs a deliberate release policy because the original unique constraint also includes cancelled tickets. Semantic hall/screening consistency is enforced by the booking service and verifier; individual FKs alone cannot prevent every inconsistent direct database edit. Registration, favorites, payments and notifications exist as database entities/demo data, not as completed site features. Production authentication, TLS, rate limiting and deployment remain future work.

## Subjects, presentation and source

[Assignment mapping and Jira task plan](docs/coursework-map.md), [study guide](docs/study-guide.md), [Word guide](docs/cinema-booking-study-guide.docx), [schema mapping](database/schema-mapping.md), [verification notes](docs/verification.md), [poster sources](docs/poster-sources.md).

The supplied ZIP contained a database design, not a finished backend. See [import provenance](database/SOURCE.md). Original design and subsequent implementation changes are kept distinguishable. Commits record actual changes; each teammate should make their own contributions with their own Git identity and submit the repo link in Teams themselves. GitHub issues in this repo were checked on 27 October 2026: none were present. This does not establish that the source author's or teacher's other repository has no review issues.
