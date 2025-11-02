#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

const exts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp']);

async function* walk(dir) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        yield* walk(full);
      } else if (exts.has(path.extname(e.name).toLowerCase())) {
        yield full;
      }
    }
  } catch {
    // ignore
  }
}

async function ensureDir(p) {
  try { await fs.mkdir(p, { recursive: true }); } catch {}
}

async function main() {
  const root = process.cwd();
  const srcDir = path.join(root, 'Images');
  const dstDir = path.join(root, 'public', 'samples', 'ocean');

  await ensureDir(dstDir);

  // If Images/ does not exist, nothing to do
  try { await fs.access(srcDir); } catch { return; }

  for await (const file of walk(srcDir)) {
    const base = path.basename(file);
    const dest = path.join(dstDir, base);
    try {
      // If already exists, skip
      await fs.access(dest);
    } catch {
      try {
        await fs.copyFile(file, dest);
        console.log(`Copied ${file} -> ${dest}`);
      } catch (e) {
        console.warn('Failed to copy', file, e?.message || e);
      }
    }
  }
}

main().catch(err => { console.error(err); process.exit(1); });

