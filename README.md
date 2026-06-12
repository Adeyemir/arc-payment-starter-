# arc-payment-starter

Build your first stablecoin payment flow on Arc Testnet in under an hour.

Three scripts, no UI, no framework. You provision a wallet, watch a USDC payment arrive, and (optionally) withdraw the funds. Gas is sponsored by Circle Gas Station — you never hold native tokens.

## What you build

By the end you will have:

- A receive address on Arc Testnet, provisioned via Circle
- A live terminal session watching for incoming USDC
- Optionally, a withdrawal flow that sends the received USDC to your own EOA

Everything runs from the CLI. No Solidity. No frontend.

## Prerequisites

- Node.js v22 or later
- A free Circle Developer account: https://console.circle.com
- Some testnet USDC on Arc Testnet (faucet: https://faucet.testnet.arc.network)
- An EOA wallet (MetaMask, Rabby, anything) for the withdraw step

## Setup

```bash
git clone https://github.com/Adeyemir/arc-payment-starter.git
cd arc-payment-starter
npm install
cp .env.example .env
```

Open `.env` and fill in two values from Circle Console:

- `CIRCLE_API_KEY` — Standard Key, generated under Keys
- `CIRCLE_ENTITY_SECRET` — generated under Configurator, then registered

(See the workshop notes for the exact Console steps. The whole flow takes ~5 min.)

## Run the flow

### Step 1 — Provision a receive address

```bash
npm run wallet
```

Prints a `WALLET_ID` and `WALLET_ADDRESS`. Copy both into `.env`.

The address is an SCA on Arc Testnet. Gas Station covers everything it does.

### Step 2 — Watch for an incoming payment

```bash
npm run watch
```

The script polls the USDC contract on Arc Testnet every 5 seconds. Open a second terminal or your wallet, send USDC to `WALLET_ADDRESS`, and watch the confirmation print live.

Example output:

```
=== WATCHING FOR USDC PAYMENTS ===

Wallet  : 0xAbCd...
Chain   : Arc Testnet
Polling : every 5 seconds

Starting balance: 0.00 USDC

Send USDC to the wallet above. Watching for changes...

[14:32:18] Payment received: 5.00 USDC
[14:32:18] New balance     : 5.00 USDC
```

### Step 3 (optional) — Withdraw to your own wallet

Add a `MERCHANT_ADDRESS` to `.env` (your MetaMask address works) and run:

```bash
npm run withdraw
```

Submits a transfer via Circle's `createTransaction`. Sends the wallet's USDC balance (minus a tiny buffer) to `MERCHANT_ADDRESS`. Gas Station sponsors the transfer — no native tokens needed.

Check the result on Arc Scan:
`https://testnet.arcscan.app/address/<your-merchant-address>`

## What you just learned

- Circle DCW provisions SCA wallets on any supported chain in one API call
- Circle Gas Station sponsors gas on testnet automatically
- Arc Testnet finality is sub-second — payments confirm fast
- Polling a balance is enough for a receive-only payment listener (no indexer needed)

## Where to go next

- Fork this and add a Next.js checkout page (the same flow, with a UI)
- Add multi-chain receive using DCW on `['BASE-SEPOLIA', 'ARC-TESTNET']`
- Route cross-chain settlements through Circle Gateway (advanced)
- See [github.com/Adeyemir/arc-contracts](https://github.com/Adeyemir/arc-contracts) to deploy your own ERC-1155 token using the same Circle stack

## Resources

- Arc Network: https://www.arc.io
- Arc Docs: https://docs.arc.io
- Circle Developer Docs: https://developers.circle.com
- Arc Scan (testnet): https://testnet.arcscan.app

## License

MIT
