import { connectDatabase } from './database';
const connection = await connectDatabase();
try {
  await connection.migrate();
  console.log(`Migrations applied (${connection.driver}).`);
} finally {
  await connection.close();
}
