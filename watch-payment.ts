/**
 * Step 2 - Listen for incoming USDC payments on Arc Testnet.
 *
 * Polls the USDC contract every 5 seconds for the wallet's balance.
 * Prints a confirmation when the balance increases - that's a payment.
 *
 * Run: npm run watch
 *
 * Open in another window, send USDC to the wallet address. Watch the
 * "Payment received" line print live.
 */

const RPC_URL = 'https://rpc.testnet.arc.network';
const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
const POLL_INTERVAL_MS = 5000;

const walletAddress = process.env.WALLET_ADDRESS;
if (!walletAddress) {
  console.error('WALLET_ADDRESS not set in .env');
  console.error('Run `npm run wallet` first, then copy the printed address into .env');
  process.exit(1);
}

// ERC-20 balanceOf(address) - selector + 32-byte padded address.
function encodeBalanceOf(address: string): string {
  const padded = address.slice(2).toLowerCase().padStart(64, '0');
  return '0x70a08231' + padded;
}

async function getUSDCBalance(address: string): Promise<bigint> {
  const data = encodeBalanceOf(address);
  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [{ to: USDC_ADDRESS, data }, 'latest'],
    }),
  });
  const json = await res.json();
  return BigInt(json.result || '0x0');
}

// USDC has 6 decimals on Arc Testnet.
function format(balance: bigint): string {
  return (Number(balance) / 1_000_000).toFixed(2);
}

console.log('\n=== WATCHING FOR USDC PAYMENTS ===\n');
console.log('Wallet  :', walletAddress);
console.log('Chain   : Arc Testnet');
console.log('Polling : every 5 seconds\n');

let lastBalance = await getUSDCBalance(walletAddress);
console.log(`Starting balance: ${format(lastBalance)} USDC\n`);
console.log('Send USDC to the wallet above. Watching for changes...\n');

while (true) {
  await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  try {
    const current = await getUSDCBalance(walletAddress);
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
