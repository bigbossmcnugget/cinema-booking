import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  dialect: 'postgresql',
  schema: './backend/schema.ts',
  out: './backend/migrations',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      'postgres://cinema:cinema_dev@127.0.0.1:5433/cinema',
  },
});
