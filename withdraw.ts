/**
 * Step 3 (optional) - Withdraw the received USDC to your own address.
 *
 * Uses Circle's createTransaction to send all USDC from the wallet to
 * MERCHANT_ADDRESS on Arc Testnet. Gas sponsored by Circle Gas Station.
 *
 * Run: npm run withdraw

 */

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
const walletId = process.env.WALLET_ID;
const merchantAddress = process.env.MERCHANT_ADDRESS;

if (!apiKey || !entitySecret) {
  console.error('Missing CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET in .env');
  process.exit(1);
}
if (!walletId) {
  console.error('Missing WALLET_ID. Run `npm run wallet` first.');
  process.exit(1);
}
if (!merchantAddress) {
  console.error('Missing MERCHANT_ADDRESS in .env. This is where the USDC will be sent.');
  process.exit(1);
}

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const TARGET_TOKEN = USDC_ADDRESS.toLowerCase();
const USDC_DECIMALS = 6;
const BUFFER_ATOMIC = 10_000n; // Exactly 0.01 USDC in atomic units

const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

// Helper to safely parse SDK string amounts into BigInt to prevent precision loss
function parseUSDCAmount(amount: string): bigint {
  const [whole = '0', fraction = ''] = amount.split('.');
  const atomicFraction = fraction.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(atomicFraction);
}

// Helper to format BigInt back to a full 6-decimal string for the SDK payload without rounding artifacts
function formatUSDC(balance: bigint): string {
  const whole = balance / 1_000_000n;
  const fraction = (balance % 1_000_000n).toString().padStart(USDC_DECIMALS, '0');
  return `${whole}.${fraction}`;
}

const balances = await client.getWalletTokenBalance({
  id: walletId,
  tokenAddresses: [USDC_ADDRESS],
});

const usdcBalance = balances.data?.tokenBalances?.find(
  ({ token }) => token.tokenAddress?.toLowerCase() === TARGET_TOKEN,
);

const balanceAtomic = parseUSDCAmount(usdcBalance?.amount ?? '0');

// Ensure wallet has enough balance to cover the buffer and avoid negative numbers
if (balanceAtomic <= BUFFER_ATOMIC) {
  console.error('Wallet balance is too small to withdraw after the 0.01 USDC safety buffer.');
  process.exit(1);
}

// Leave a 0.01 USDC safety buffer to avoid edge cases when withdrawing the full balance
const sendAmountAtomic = balanceAtomic - BUFFER_ATOMIC;
const sendAmount = formatUSDC(sendAmountAtomic);

console.log(`\nWithdrawing ${sendAmount} USDC to ${merchantAddress}...\n`);

const response = await client.createTransaction({
  walletId,
  destinationAddress: merchantAddress,
  amount: [sendAmount],
  tokenAddress: USDC_ADDRESS,
  fee: { type: 'level', config: { feeLevel: 'MEDIUM' } },
});

console.log('=== WITHDRAW SUBMITTED ===\n');
console.log('Transaction ID :', response.data?.id);
console.log('State          :', response.data?.state);
console.log('\nCheck Arc Scan in ~30 sec:');
console.log(`https://testnet.arcscan.app/address/${merchantAddress}\n`);