import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const failures = [];
const required = [
  'apps/web/app/(site)/page.tsx',
  'apps/web/app/(site)/work/page.tsx',
  'apps/web/app/(site)/work/[slug]/page.tsx',
  'apps/web/app/(site)/journey/page.tsx',
  'apps/web/app/(site)/playground/page.tsx',
  'apps/web/app/(site)/about/page.tsx',
  'apps/web/app/(site)/contact/page.tsx',
  'apps/web/app/admin/(protected)/projects/page.tsx',
  'apps/web/components/admin/ProjectEditor.tsx',
  'apps/web/components/admin/MediaManager.tsx',
  'apps/web/app/desk/page.tsx',
  'apps/api/src/auth/auth.guard.ts',
  'apps/api/src/projects/projects.service.ts',
  'apps/api/src/media/media.service.ts',
  'prisma/schema.prisma',
  'prisma/migrations/20260810000000_init/migration.sql',
];
for (const rel of required) if (!fs.existsSync(path.join(root, rel))) failures.push(`missing ${rel}`);

function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? files(full) : [full];
  });
}
const webFiles = files(path.join(root, 'apps/web')).filter((file) => /\.(ts|tsx)$/.test(file));
for (const file of webFiles) {
  const text = fs.readFileSync(file, 'utf8');
  if (/from ['"].*prisma|@prisma\//i.test(text)) failures.push(`web imports database layer: ${path.relative(root, file)}`);
}
const trackedEnv = files(root).filter((file) => /(^|\/)\.env(\.local)?$/.test(file.replaceAll('\\','/')));
for (const file of trackedEnv) failures.push(`real env file present: ${path.relative(root, file)}`);

if (failures.length) {
  console.error('Architecture audit failed:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log(`Architecture audit passed (${required.length} required artifacts, ${webFiles.length} web TS/TSX files checked).`);
