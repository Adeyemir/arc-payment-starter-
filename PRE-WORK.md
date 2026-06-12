# Before the Workshop: 15 minutes of setup

Do this before you arrive. If you walk in with the steps below complete, you can ship a working Arc Testnet payment flow inside the session. If you walk in cold, you'll spend the workshop on setup.

## What you need

- Node.js v22 or later (`node -v` to check)
- A laptop with a terminal
- An EOA wallet (MetaMask, Rabby, anything that holds USDC on testnet)
- An email address you can verify
- 15 minutes

## Step 1: Clone the starter repo

```bash
git clone https://github.com/Adeyemir/arc-payment-starter-.git
cd arc-payment-starter-
npm install
cp .env.example .env
```

You should now have a folder with the project files and a `.env` waiting for credentials.

## Step 2: Get your Circle credentials

There are two paths. Pick the one that matches you.

### Path A: You are new to Circle

1. Sign up at https://console.circle.com. Choose "Developer Account." Verify your email.
2. Top-left of the dashboard: toggle the network to **Testnet**.
3. Sidebar → **Keys** → "Create a key" → Standard Key. Name it `arc-workshop`. Copy the value and save it in your `.env` as `CIRCLE_API_KEY`.
4. Sidebar → **DEV CONTROLLED → Configurator**. The page asks for an Entity Secret Ciphertext. To generate one:
   - Open a terminal in the project folder.
   - Run: `npx tsx --env-file=.env register-secret.ts`
   - The script prints your raw entity secret AND the encrypted ciphertext.
   - Save the raw secret in `.env` as `CIRCLE_ENTITY_SECRET`.
   - Paste the ciphertext into the Console field and click **Register**.
5. Download the recovery file when prompted. Store it somewhere safe. For testnet the stakes are low, but build the habit.

### Path B: You already have a Circle account

1. Log into https://console.circle.com.
2. Top-left: toggle to **Testnet** if you're not already there.
3. Sidebar → **Keys** → create a new Standard Key named `arc-workshop`. Copy the value into `.env` as `CIRCLE_API_KEY`. You can reuse an existing key, but a fresh one keeps the workshop project isolated.
4. For the Entity Secret:
   - **If you still have your existing entity secret saved** (in an old project `.env`, password manager, or the recovery file you downloaded when you first set it up): copy it into `.env` as `CIRCLE_ENTITY_SECRET`. **Do not rotate.** It is already registered to your account and will work as-is.
   - **If you lost your entity secret and have no recovery file**: you will need to rotate via Sidebar → **DEV CONTROLLED → Configurator → Rotate**. Rotating breaks any existing project still using the old secret. Only do this if you have nothing in production depending on it. After rotating, run `npx tsx --env-file=.env register-secret.ts` from the repo to generate and register a new one.

## Step 3: Confirm the setup works

```bash
npm run wallet
```

You should see output like:

```
=== RECEIVE ADDRESS PROVISIONED ===

walletSetId    : 1a2b3c4d-...
WALLET_ID      : a635d679-...
WALLET_ADDRESS : 0xAbCd...
```

Copy `WALLET_ID` and `WALLET_ADDRESS` into `.env`.

If you see "The provided entity secret is invalid" — your API key and entity secret are from different Circle accounts. Re-check both are from the same account.

## Step 4: Get some testnet USDC

Visit https://faucet.testnet.arc.network. Paste your `WALLET_ADDRESS`. Request USDC.

## What to bring on the day

- Laptop with the repo cloned, `.env` populated, `npm run wallet` confirmed working
- Some USDC already in the wallet (or be ready to use the faucet live)
- Your EOA address ready for the withdraw step
- Questions

## Help

If anything blocks you during setup, DM @_OxAde or post in the Arc Nigeria channel. Easier to debug now than at the venue.
