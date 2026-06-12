/**
 * One-shot helper: generate an Entity Secret + the ciphertext to register
 * it on Circle Console.
 *
 * Run: tsx --env-file=.env register-secret.ts
 *
 * Prints:
 *   - Your raw entity secret → save into .env as CIRCLE_ENTITY_SECRET
 *   - The ciphertext → paste into the Circle Console "Entity Secret Ciphertext"
 *     field and click Register
 *
 * Run this once per Circle account. Delete the file after if you want.
 */

import crypto from 'crypto';
import { generateEntitySecretCiphertext } from '@circle-fin/developer-controlled-wallets';

const apiKey = process.env.CIRCLE_API_KEY;
if (!apiKey) {
  console.error('CIRCLE_API_KEY required in .env (from the same account you are registering on)');
  process.exit(1);
}

// Generate a fresh 32-byte hex entity secret.
const entitySecret = crypto.randomBytes(32).toString('hex');

// Encrypt with Circle's public key (the SDK does the work).
const ciphertext = await generateEntitySecretCiphertext({
  apiKey,
  entitySecret,
});

console.log('\n=== ENTITY SECRET GENERATED ===\n');
console.log('1) Save this in your .env as CIRCLE_ENTITY_SECRET:');
console.log('   ' + entitySecret);
console.log('');
console.log('2) Paste this CIPHERTEXT into the Circle Console "Entity Secret Ciphertext" field,');
console.log('   then click Register:');
console.log('');
console.log(ciphertext);
console.log('');
console.log('Once Register succeeds, you can delete this file. Then run: npm run wallet\n');
