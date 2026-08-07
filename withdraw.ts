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
const USDC_DECIMALS = 6;

const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

// Helper to safely parse SDK string amounts into BigInt to prevent precision loss
function parseUSDCAmount(amount: string): bigint {
  const [whole = '0', fraction = ''] = amount.split('.');
  const atomicFraction = fraction.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(atomicFraction);
}

// Helper to format BigInt back to a 2-decimal string for the SDK payload
function format(balance: bigint): string {
  const roundedCents = (balance + 5_000n) / 10_000n;
  return `${roundedCents / 100n}.${(roundedCents % 100n).toString().padStart(2, '0')}`;
}

const balances = await client.getWalletTokenBalance({
  id: walletId,
  tokenAddresses: [USDC_ADDRESS],
});

const usdcBalance = balances.data?.tokenBalances?.find(
  ({ token }) => token.tokenAddress?.toLowerCase() === USDC_ADDRESS.toLowerCase(),
);

const balanceAtomic = parseUSDCAmount(usdcBalance?.amount ?? '0');

if (balanceAtomic <= 0n) {
  console.error('Wallet has no USDC to withdraw.');
  process.exit(1);
}

// Leave a 0.01 USDC buffer for gas accounting (10,000 atomic units)
const sendAmountAtomic = balanceAtomic - 10_000n;
const sendAmount = format(sendAmountAtomic);

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