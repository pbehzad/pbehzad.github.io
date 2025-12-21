/**
 * Content Validation Script
 *
 * Run this to validate all content files before committing:
 * npx ts-node scripts/validate-content.ts
 */

import fs from 'fs';
import path from 'path';
import {
  compositionsArraySchema,
  textsArraySchema,
  toolsArraySchema,
  profileSchema,
  contactSchema,
  homeContentSchema
} from '../src/data/schemas';

const contentDir = path.join(__dirname, '../src/data/content');

interface ValidationResult {
  file: string;
  valid: boolean;
  errors?: string[];
}

function validateFile(filename: string, schema: any): ValidationResult {
  try {
    const filePath = path.join(contentDir, filename);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    const result = schema.safeParse(data);

    if (result.success) {
      return { file: filename, valid: true };
    } else {
      return {
        file: filename,
        valid: false,
        errors: result.error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`)
      };
    }
  } catch (error) {
    return {
      file: filename,
      valid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error']
    };
  }
}

console.log('🔍 Validating content files...\n');

const validations: ValidationResult[] = [
  validateFile('compositions.json', compositionsArraySchema),
  validateFile('texts.json', textsArraySchema),
  validateFile('tools.json', toolsArraySchema),
  validateFile('profile.json', profileSchema),
  validateFile('contact.json', contactSchema),
  validateFile('home.json', homeContentSchema),
];

let hasErrors = false;

validations.forEach(result => {
  if (result.valid) {
    console.log(`✅ ${result.file} - Valid`);
  } else {
    console.log(`❌ ${result.file} - Invalid`);
    result.errors?.forEach(error => {
      console.log(`   ${error}`);
    });
    hasErrors = true;
  }
});

console.log('\n' + '='.repeat(50));

if (hasErrors) {
  console.log('❌ Validation failed! Please fix errors above.');
  process.exit(1);
} else {
  console.log('✅ All content files are valid!');
  process.exit(0);
}
