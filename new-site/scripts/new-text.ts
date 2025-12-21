/**
 * Helper script to add a new text/essay
 *
 * Usage: npx ts-node scripts/new-text.ts
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
  console.log('📝 Create New Text/Essay\n');

  const title = await question('Title: ');
  const year = await question('Year: ');
  const type = await question('Type (essay/article/paper/note): ');
  const description = await question('Description (optional): ');

  const slug = slugify(title);
  const filename = `${slug}.md`;

  const newText = {
    id: slug,
    slug: slug,
    title: title.toUpperCase(),
    year: parseInt(year),
    type: type.toLowerCase(),
    description: description || null,
    abstract: null,
    content_file: filename,
    pdf_url: null,
    external_url: null,
    tags: [],
    featured: false,
    status: 'draft',
    published_in: null,
    related_compositions: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Read existing texts
  const textsPath = path.join(__dirname, '../src/data/content/texts.json');
  const texts = JSON.parse(fs.readFileSync(textsPath, 'utf8'));

  // Add new text
  texts.push(newText);

  // Write back
  fs.writeFileSync(textsPath, JSON.stringify(texts, null, 2));

  // Create markdown file
  const markdownPath = path.join(__dirname, '../src/data/content/texts', filename);
  const markdownTemplate = `---
title: "${title}"
year: ${year}
type: "${type}"
tags: []
---

# ${title}

*Write your content here...*

## Introduction

[Content to be added]

## Conclusion

[Content to be added]
`;

  fs.writeFileSync(markdownPath, markdownTemplate);

  console.log('\n✅ Text added successfully!');
  console.log(`   Slug: ${slug}`);
  console.log(`   Markdown file: ${filename}`);
  console.log(`   Status: draft`);
  console.log(`\n📝 Edit the following files:`);
  console.log(`   1. ${textsPath} - Update metadata`);
  console.log(`   2. ${markdownPath} - Write content`);
  console.log(`   Set status to "published" when ready.`);

  rl.close();
}

main().catch(console.error);
