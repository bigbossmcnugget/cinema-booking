import { count } from 'drizzle-orm';
import { connectDatabase } from './database';
import { movies } from './schema';
import { seedDatabase } from './seed';
import { verifyDatabase } from './verify';
const connection = await connectDatabase();
try {
  await connection.migrate();
  const [existing] = await connection.db
    .select({ count: count() })
    .from(movies);
  if (!existing.count) await seedDatabase(connection.db);
  else console.log('Existing demo database preserved; seeder skipped.');
  console.table(await verifyDatabase(connection.db));
} finally {
  await connection.close();
}
