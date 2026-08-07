/**
 * Step 2 - Listen for incoming USDC payments on Arc Testnet.
 *
 * Polls Circle every 5 seconds for the wallet's USDC balance.
 * Prints a confirmation when the balance increases - that's a payment.
 *
 * Run: npm run watch
 *
 * Open in another window, send USDC to the wallet address. Watch the
 * "Payment received" line print live.
 */

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';

const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const POLL_INTERVAL_MS = 5000;
const USDC_DECIMALS = 6;

const apiKey = process.env.CIRCLE_API_KEY;
const entitySecret = process.env.CIRCLE_ENTITY_SECRET;
const walletId = process.env.WALLET_ID;
const walletAddress = process.env.WALLET_ADDRESS;

if (!apiKey || !entitySecret) {
  console.error('CIRCLE_API_KEY or CIRCLE_ENTITY_SECRET not set in .env');
  process.exit(1);
}

if (!walletId || !walletAddress) {
  console.error('WALLET_ID or WALLET_ADDRESS not set in .env');
  console.error('Run `npm run wallet` first, then copy the printed values into .env');
  process.exit(1);
}

const client = initiateDeveloperControlledWalletsClient({ apiKey, entitySecret });

function parseUSDCAmount(amount: string): bigint {
  const [whole = '0', fraction = ''] = amount.split('.');
  const atomicFraction = fraction.padEnd(USDC_DECIMALS, '0').slice(0, USDC_DECIMALS);
  return BigInt(whole) * 10n ** BigInt(USDC_DECIMALS) + BigInt(atomicFraction);
}

function format(balance: bigint): string {
  const roundedCents = (balance + 5_000n) / 10_000n;
  return `${roundedCents / 100n}.${(roundedCents % 100n).toString().padStart(2, '0')}`;
}

console.log('\n=== WATCHING FOR USDC PAYMENTS ===\n');
console.log('Wallet  :', walletAddress);
console.log('Chain   : Arc Testnet');
console.log('Polling : every 5 seconds\n');

const initialBalances = await client.getWalletTokenBalance({
  id: walletId,
  tokenAddresses: [USDC_ADDRESS],
});
const initialUSDC = initialBalances.data?.tokenBalances?.find(
  ({ token }) => token.tokenAddress?.toLowerCase() === USDC_ADDRESS.toLowerCase(),
);
let lastBalance = parseUSDCAmount(initialUSDC?.amount ?? '0');
console.log(`Starting balance: ${format(lastBalance)} USDC\n`);
console.log('Send USDC to the wallet above. Watching for changes...\n');

while (true) {
  await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  try {
    const balances = await client.getWalletTokenBalance({
      id: walletId,
      tokenAddresses: [USDC_ADDRESS],
    });
    const usdc = balances.data?.tokenBalances?.find(
      ({ token }) => token.tokenAddress?.toLowerCase() === USDC_ADDRESS.toLowerCase(),
    );
    const current = parseUSDCAmount(usdc?.amount ?? '0');
    if (current > lastBalance) {
      const received = current - lastBalance;
      const now = new Date().toLocaleTimeString();
      console.log(`[${now}] Payment received: ${format(received)} USDC`);
      console.log(`[${now}] New balance     : ${format(current)} USDC\n`);
      lastBalance = current;
    }
  } catch (err) {
    console.error('Poll error:', (err as Error).message);
  }
}
