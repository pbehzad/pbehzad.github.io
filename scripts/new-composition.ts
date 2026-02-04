/**
 * Helper script to add a new composition
 *
 * Usage: npx ts-node scripts/new-composition.ts
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

async function main() {
  console.log('📝 Create New Composition\n');

  const title = await question('Title: ');
  const year = await question('Year: ');
  const instruments = await question('Instruments: ');
  const duration = await question('Duration (optional): ');
  const description = await question('Description (optional): ');

  const slug = slugify(title);

  const newComposition = {
    id: slug,
    slug: slug,
    title: title.toUpperCase(),
    year: parseInt(year),
    instruments: instruments.toUpperCase(),
    duration: duration || null,
    description: description || null,
    program_notes: null,
    score_url: null,
    audio_urls: [],
    video_url: null,
    tags: [],
    featured: false,
    status: 'draft',
    premiere: null,
    related_texts: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Read existing compositions
  const compositionsPath = path.join(__dirname, '../src/data/content/compositions.json');
  const compositions = JSON.parse(fs.readFileSync(compositionsPath, 'utf8'));

  // Add new composition
  compositions.push(newComposition);

  // Write back
  fs.writeFileSync(compositionsPath, JSON.stringify(compositions, null, 2));

  console.log('\n✅ Composition added successfully!');
  console.log(`   Slug: ${slug}`);
  console.log(`   Status: draft`);
  console.log(`\n📝 Edit ${compositionsPath} to add more details.`);
  console.log(`   Set status to "published" when ready.`);

  rl.close();
}

main().catch(console.error);
