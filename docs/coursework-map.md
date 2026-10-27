# One cinema project, several coursework deliverables

Updated 27 October 2026 after importing the supplied database design. Based on the user's assignment texts and lesson notes. Exact teacher names and Jira board were not provided.

## Databases: initial design

Evidence: unchanged `database/source/project.sql` and ER diagrams. These came from the supplied ZIP. Current ORM mapping is in `database/schema-mapping.md`, and the generated current SQL is in `database/project.sql`. The archive is a design, not proof that Docker, seeding or backend were previously implemented.

## Databases: backend, Docker, ORM and seeder (8 October)

| Criterion | Implementation | Verification / limitation |
| --- | --- | --- |
| Language and ORM choice | TypeScript, Drizzle, PostgreSQL; explained in README | Real ORM selects/inserts/transactions in backend/service.ts |
| Compose database + named volume | docker-compose.yml, postgres:17-alpine, cinema_postgres volume | Configuration supplied; Docker is absent on this computer, container execution/persistence still needs checking |
| Models/migrations matching project.sql | All 13 source tables in backend/schema.ts, generated migration | Table/column comparison test; deliberate guest changes documented |
| Faker demo data, >=100 large-table rows | backend/seed.ts: 126 screenings, 120 bookings/tickets/payments/notifications | Isolated test and persistent PGlite preview verified; relational checks in pg:verify |
| Launch documentation | README: Docker → migrate → seed → verify → API + frontend | PGlite fallback run here; Docker path remains an explicit verification item |

## Databases: indexes and cache plan (22 October)

All indexes are declared through Drizzle. README lists columns, current/planned queries and redundancies. A named index does not prove the planner uses it or a page is faster. Existing future-use indexes are labelled as such. README includes cache keys, TTL and invalidation conditions. Redis/cache implementation is optional in the supplied assignment and is not enabled.

## Code review: frontend structure and backend rights

`app/page.tsx` now composes sections. `components/cinema/` contains smaller UI files and `lib/use-cinema.ts` contains state/requests. This is React, so copying a Vue Router/App.vue pattern literally would be inappropriate; the same separation principle is applied to React components.

The public API only permits validated guest bookings and read-only catalogue/seat requests. Administrative movie changes require a private server-side token; hidden buttons and a client-supplied role cannot grant access. Tests show rejection without valid authorization. There is no complete user-role login system.

GitHub issues in bigbossmcnugget/cinema-booking were checked on 27 October: none exist. No review issues were closed or declared fixed on another repository. Issues from the original class repository must be examined separately if supplied.

## Project work / client presentation

Show a visitor selecting a film/date, choosing seats, completing the white guest form, receiving a reference, and then seeing the same seats unavailable after reload. Explain customer value before code. Each teammate prepares a real next-month improvement with effort estimate and questions for the client. Keep the meeting within 15 minutes. The study guide describes the updated implementation and known limits.

## How Jira could connect these subjects

Jira is a plan/task tracker, GitHub stores code, Teams receives each student's submission link. The two supplied database assignments do not explicitly require Jira. Actual Jira project/board linkage is unverified, and no tasks were created remotely.

`docs/jira-backlog.csv` is a local import draft. Tasks are proposed, not claims of historical work or teammate assignments. Use real issue keys only after tasks exist. With a configured GitHub/Jira integration, add the real key to the branch, commit or PR title; do not invent a board prefix. Current implementation commits keep their actual timestamps and authors.

Official references: [GitHub connection](https://support.atlassian.com/jira-cloud-administration/docs/integrate-with-github/), [linking development activity](https://support.atlassian.com/jira-cloud-administration/docs/use-the-github-for-jira-app/).

## Remaining checks before submission

1. Run the documented Docker path on a machine with Docker and verify records survive `docker compose down` followed by `up` (without `-v`).
2. Run schema/data checks against that PostgreSQL instance: `npm run pg:verify`.
3. Add the source design contributor's real name/repository to provenance and agree team responsibilities.
4. Check the teacher's actual review issues if they live in another repository; link real Jira tasks if required by that subject.
5. Each student submits their own link in Teams and can explain their actual contribution.

The code can serve all these deliverables, but one repository alone does not establish that every teacher's organizational requirements are satisfied.
