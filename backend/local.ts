const command = process.argv[2];

// Keep the npm scripts portable: `DB_DRIVER=pglite ...` only works in Unix
// shells, while setting the environment here works on Windows too.
process.env.DB_DRIVER = 'pglite';

export {};

if (command === 'server') await import('./server');
else if (command === 'prepare') await import('./prepare');
else {
  console.error('Usage: tsx backend/local.ts <server|prepare>');
  process.exitCode = 1;
}
