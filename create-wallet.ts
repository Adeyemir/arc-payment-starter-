/**
 * Step 1 - Provision a receive address on Arc Testnet.
 *
 * Creates a Circle Developer-Controlled Wallet (SCA) on Arc Testnet.
 * The wallet address you get back is where customers will send USDC.
 *
 * Run: npm run wallet
 * Then copy the printed WALLET_ID and WALLET_ADDRESS into .env.
 */

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;

if (!apiKey || !entitySecret) {
  console.error('Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env');
  console.error('Get them from https://console.circle.com');
  process.exit(1);
}

const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

const walletSet = await client.createWalletSet({
  name: `arc-payment-starter-${Date.now()}`,
});

const walletSetId = walletSet.data?.walletSet?.id;
if (!walletSetId) {
  console.error('Wallet set creation returned no id');
  process.exit(1);
}

const wallets = await client.createWallets({
  blockchains: ['ARC-TESTNET'],
  count: 1,
  walletSetId,
  accountType: 'SCA',
});

const wallet = wallets.data?.wallets?.[0];
if (!wallet) {
  console.error('No wallet returned');
  process.exit(1);
}

console.log('\n=== RECEIVE ADDRESS PROVISIONED ===\n');
console.log('walletSetId :', walletSetId);
console.log('WALLET_ID   :', wallet.id);
console.log('WALLET_ADDRESS :', wallet.address);
console.log('\nCopy WALLET_ID and WALLET_ADDRESS into .env.');
console.log('Then send some USDC to WALLET_ADDRESS on Arc Testnet.');
console.log('Faucet: https://faucet.circle.com\n');
console.log('Once funded, run: npm run watch\n');
