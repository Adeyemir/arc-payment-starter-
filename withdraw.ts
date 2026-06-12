/**
 * Step 3 (optional) - Withdraw the received USDC to your own address.
 *
 * Uses Circle's createTransaction to send all USDC from the wallet to
 * MERCHANT_ADDRESS on Arc Testnet. Gas sponsored by Circle Gas Station.
 *
 * Run: npm run withdraw
 *
 * Stretch goal for the workshop. Skip if your slot runs short.
 */

import { randomUUID } from 'crypto';
import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
const walletId = process.env.WALLET_ID;
const walletAddress = process.env.WALLET_ADDRESS;
const merchantAddress = process.env.MERCHANT_ADDRESS;

if (!apiKey || !entitySecret) {
  console.error('Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env');
  process.exit(1);
}
if (!walletId || !walletAddress) {
  console.error('Missing WALLET_ID or WALLET_ADDRESS. Run `npm run wallet` first.');
  process.exit(1);
}
if (!merchantAddress) {
  console.error('Missing MERCHANT_ADDRESS in .env. This is where the USDC will be sent.');
  process.exit(1);
}

const RPC_URL = 'https://rpc.testnet.arc.network';
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';

function encodeBalanceOf(address: string): string {
  return '0x70a08231' + address.slice(2).toLowerCase().padStart(64, '0');
}

async function getUSDCBalance(address: string): Promise<bigint> {
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: USDC_ADDRESS, data: encodeBalanceOf(address) }, 'latest'],
    }),
  });
  const json = await res.json();
  return BigInt(json.result || '0x0');
}

const balance = await getUSDCBalance(walletAddress);
const balanceUSDC = Number(balance) / 1_000_000;

if (balanceUSDC <= 0) {
  console.error('Wallet has no USDC to withdraw.');
  process.exit(1);
}

// Leave a tiny buffer for gas accounting.
const sendAmount = (balanceUSDC - 0.01).toFixed(2);
console.log(`\nWithdrawing ${sendAmount} USDC to ${merchantAddress}...\n`);

const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

const response = await client.createTransaction({
  idempotencyKey: randomUUID(),
  walletId,
  destinationAddress: merchantAddress,
  amount: [sendAmount],
  tokenAddress: USDC_ADDRESS,
  blockchain: 'ARC-TESTNET',
  fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
});

console.log('=== WITHDRAW SUBMITTED ===\n');
console.log('Transaction ID :', response.data?.id);
console.log('State          :', response.data?.state);
console.log('\nCheck Arc Scan in ~30 sec:');
console.log(`https://testnet.arcscan.app/address/${merchantAddress}\n`);
