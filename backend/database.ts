import 'dotenv/config';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as pgliteDrizzle } from 'drizzle-orm/pglite';
import { migrate as pgliteMigrate } from 'drizzle-orm/pglite/migrator';
import { drizzle as postgresDrizzle } from 'drizzle-orm/postgres-js';
import { migrate as postgresMigrate } from 'drizzle-orm/postgres-js/migrator';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import postgres from 'postgres';
import { mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as schema from './schema';

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;
export async function connectDatabase() {
  const migrationsFolder = fileURLToPath(new URL('./migrations', import.meta.url));
  if (process.env.DB_DRIVER === 'pglite') {
    const path = process.env.PGLITE_PATH || './.data/postgres';
    if (path !== 'memory://')
      await mkdir(dirname(resolve(path)), { recursive: true });
    const client = new PGlite(path);
    const db = pgliteDrizzle(client, { schema });
    return {
      db: db as Database,
      migrate: () => pgliteMigrate(db, { migrationsFolder }),
      close: () => client.close(),
      driver: 'pglite',
    };
  }
  const client = postgres(
    process.env.DATABASE_URL ||
      'postgres://cinema:cinema_dev@127.0.0.1:5433/cinema',
    { max: 5 },
  );
  const db = postgresDrizzle(client, { schema });
  return {
    db: db as Database,
    migrate: () => postgresMigrate(db, { migrationsFolder }),
    close: () => client.end(),
    driver: 'postgres',
  };
}
