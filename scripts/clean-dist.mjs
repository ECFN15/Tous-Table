import { existsSync, lstatSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = process.cwd();
const distDir = resolve(root, 'dist');
const relative = distDir.slice(resolve(root).length).replace(/^[\\/]/, '');

if (relative !== 'dist') {
  console.error(`Refusing to clean unexpected build directory: ${distDir}`);
  process.exit(1);
}

function removeEntry(path) {
  if (!existsSync(path)) return;
  const stat = lstatSync(path);
  if (stat.isDirectory()) {
    for (const child of readdirSync(path)) {
      removeEntry(join(path, child));
    }
    rmdirSync(path);
    return;
  }
  unlinkSync(path);
}

if (existsSync(distDir)) {
  for (const entry of readdirSync(distDir)) {
    removeEntry(join(distDir, entry));
  }
  const remaining = readdirSync(distDir);
  if (remaining.length > 0) {
    console.error(`Refusing to build because dist/ was not fully cleaned: ${remaining.join(', ')}`);
    process.exit(1);
  }
}

console.log('Cleaned dist/');
