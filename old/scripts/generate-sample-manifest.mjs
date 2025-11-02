#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';

async function main() {
  const root = process.cwd();
  const samplesDir = path.join(root, 'public', 'samples', 'ocean');
  const outFile = path.join(samplesDir, 'manifest.json');
  try {
    await fs.mkdir(samplesDir, { recursive: true });
  } catch {}

  let files = [];
  try {
    const entries = await fs.readdir(samplesDir, { withFileTypes: true });
    files = entries
      .filter(e => e.isFile())
      .map(e => e.name)
      .filter(name => /\.(png|jpg|jpeg|gif|webp)$/i.test(name));
  } catch {}

  const images = files.length > 0
    ? files.map(f => `/samples/ocean/${f}`)
    : [ '/Images/ocean.webp' ];

  const json = JSON.stringify(images, null, 2);
  await fs.writeFile(outFile, json);
  console.log(`Generated ${outFile} with ${images.length} entr${images.length === 1 ? 'y' : 'ies'}`);
}

main().catch(err => { console.error('Failed to generate manifest:', err); process.exit(1); });

