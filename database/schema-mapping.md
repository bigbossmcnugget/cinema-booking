# Mapping the supplied PostgreSQL design to Drizzle

All 13 original tables are defined in `backend/schema.ts`. Source types are preserved: BIGINT GENERATED ALWAYS AS IDENTITY, VARCHAR lengths, SMALLINT, NUMERIC precision/scale, DATE and TIMESTAMPTZ. Check constraints, primary keys, unique constraints, foreign keys and ON DELETE actions are described in ORM definitions. `relations()` describes ORM navigation in addition to the actual FKs. Migrations are generated with drizzle-kit, not handwritten table-creation SQL.

| Original SQL table | ORM export | Role |
| --- | --- | --- |
| users | users | Demo customer records; no sign-in UI |
| movies | movies | Film metadata |
| genres | genres | Genre dictionary |
| movie_genres | movieGenres | Film/genre many-to-many |
| cinemas | cinemas | Cinema location |
| halls | halls | Halls per cinema |
| seats | seats | Seat positions per hall |
| screenings | screenings | Film, hall, start time, format and price |
| bookings | bookings | Reservation and customer/guest contact |
| tickets | tickets | Seats reserved for a screening |
| payments | payments | Simulated payment records |
| favorites | favorites | Demo many-to-many customer/film links |
| notifications | notifications | Demo customer booking messages |

## Deliberate amendments

- `bookings.user_id` is nullable so a reservation does not require an account. Its FK and ON DELETE RESTRICT action remain intact.
- `bookings.guest_name VARCHAR(80)` and `guest_email VARCHAR(255)` were added. A CHECK requires either a user_id or both guest fields.
- `bookings.reference VARCHAR(40) NOT NULL UNIQUE` was added for the confirmation screen.
- Additional indexes cover release_date and referencing columns that lacked a leading index: movie_genres.genre_id, bookings.screening_id, tickets.booking_id, tickets.seat_id, favorites.movie_id and notifications.booking_id. Existing indexes are kept, including the redundant hall/start index inherited from the supplied design; README identifies its redundancy.

These changes are also present in the generated `database/project.sql`. The unchanged original remains in `database/source/project.sql`. No registration or payment provider was added to the frontend.

The original single-column FKs do not prove that a ticket's seat belongs to its screening hall or that its screening matches its booking. The backend checks these relationships when creating bookings; `pg:verify` detects inconsistent demo data. A future stricter schema can add composite FKs or equivalent constraints. Cancellation release rules also need a future design because the original UNIQUE(screening_id, seat_id) reserves a seat even when a ticket is marked CANCELLED.
