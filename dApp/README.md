# TRAX app Set-up and installation
💡 To note: Although we have outlined how to install and deploy below, until we open source the backend you will not be able to run the app. The entire app will be open sourced in the near future so stay tuned. 

## 1. 

1. Clone this GitHub repository:

```jsx
git clone https://github.com/onlyontrax/dApp.git
```

2. Check Node.js version 

```jsx
node -v
```

> Must have at least version 12.22.7
> 

3. Check that Homebrew is installed.  

```jsx
brew -v
```

> This is not essential but will make the rest of the installation easier.
> 

4. Install Redis 

```jsx
brew install redis
```

<aside>
💡 To restart Redis after an upgrade:
`brew services restart redis`

Or, if you don't want/need a background service you can just run:
`/opt/homebrew/opt/redis/bin/redis-server /opt/homebrew/etc/redis.conf`

To check running services on system

`brew services`

To start redis:

`brew services start redis`

To run server:

`redis-server`

To stop redis:

`brew services stop redis`

</aside>

<aside>
💡 https://formulae.brew.sh/formula/redis#default

</aside>

1. Install FFMPEG 

```jsx
brew install ffmpeg
```

<aside>
💡 https://formulae.brew.sh/formula/ffmpeg#default




## 2. Configure and deploy frontend

Once all packages are installed, open codebase in root directory. Navigate to the dApp folder.

```jsx
cd dApp
```

Run yarn to install node dependencies

```jsx
yarn
```

Start the Redis server

```jsx
brew services start redis
```

```jsx
redis-server
```

Run yarn migrate

```jsx
yarn migrate
```

Run yarn build

```jsx
yarn build
```

If error: error TS2688: Cannot find type definition file for 'ioredis’

```jsx
npm install --save-dev @types/ioredis@4.28.10
```

View here for more information: https://stackoverflow.com/questions/74246552/error-ts2688-cannot-find-type-definition-file-for-ioredis

```jsx
yarn start:dev
```

Visit [localhost:8080](http://localhost:8080) and you should receive a ‘Hello world!’ message if everything is working.

Navigate to the dApp folder and create a .env file at the root

```jsx
cd dApp
```

Paste contents below into the .env file you have created:

```
NODE_ENV=localhost
PORT=8081
API_ENDPOINT=http://localhost:8080
NEXT_PUBLIC_API_ENDPOINT=http://localhost:8080
NEXT_PUBLIC_SOCKET_ENDPOINT=http://localhost:8080

NEXT_PUBLIC_MAX_SIZE_IMAGE=100
NEXT_PUBLIC_MAX_SIZE_FILE=1000
NEXT_PUBLIC_MAX_SIZE_TEASER=1000
NEXT_PUBLIC_MAX_SIZE_VIDEO=5000
```

Run yarn to install node dependencies 

```jsx
yarn
```

Run yarn dev

```jsx
yarn dev
```

Visit [localhost:8081](http://localhost:8081) and you should be greeted with the **Sign in screen!**

If greeted with error:

```jsx
Module not found: Can't resolve 'react/jsx-runtime'
```

Install the following:

```jsx
yarn add @types/react@latest @types/react-dom@latest --dev
```

<br/>
<br/>
<br/>
<br/>

## Deploy payment smart contracts

1. Navigate into payments folder
```
cd contracts/payments
```

2. Make sure dfx is installed. And version must be 14.3
```
dfx --version
```

3. Run the local replica
```
dfx start --background --clean
```

4. In a new terminal cd into contracts/payments again
```
cd contracts/payments
``` 

5. In dfx.json make sure the ledger declaration is using the private did 
```
"ledger": {
      "type": "custom",
      "wasm": "ledger.wasm",
      "candid": "ledger.private.did"
    },
```

6. Then export minter address
```
dfx identity use minter
export MINTER_ACCOUNT_ID=$(dfx ledger account-id)
```

7. Then export default address account id
```
dfx identity use default
export DEFAULT_ACCOUNT_ID=$(dfx ledger account-id)
```

8. Then deploy ledger canister 
```
dfx deploy ledger --argument '(record {minting_account = "'${MINTER_ACCOUNT_ID}'"; initial_values = vec { record { "'${DEFAULT_ACCOUNT_ID}'"; record { e8s=100_000_000_000_000 } }; }; send_whitelist = vec {}})'
```

9. Make sure your usinf default identity and then deploy ckbtc canister
```
dfx identity use default
export PRINCIPAL=$(dfx identity get-principal)

dfx deploy ckbtc_ledger --argument '(variant {Init = record {minting_account = record { owner = principal "'${PRINCIPAL}'" };transfer_fee = 10;token_symbol = "ckBTC";token_name ="Token ckBTC";metadata = vec {};initial_balances = vec {record { record {owner = principal "'${PRINCIPAL}'"}; 100_000_000_000 } };archive_options = record {num_blocks_to_archive = 10_000;trigger_threshold = 20_000;cycles_for_archive_creation = opt 4_000_000_000_000;controller_id = principal "'${PRINCIPAL}'";};}})'
```

9(a). To transfer ckbtc to another principal run:
```
dfx canister call ckbtc_ledger icrc1_transfer '(record {to = record {owner = principal "'${DESTINATION_PRINCIPAL}'"};amount=100_000_000_000},)';
```

10. Prior to deploying tipping.mo, ensure that the canister IDs for both the ledger and ckbtc ledger, which were obtained after the deployment mentioned earlier, are accurately embedded in the corresponding sections of the smart contract. Then save tipping.mo if any changes were made before deployment.
```
dfx deploy tipping 
```

11. Deploy xrc canister
```
dfx deploy xrc
```

12. Make the same check as step 10 for ckbtc ledger, ledger, and xrc in ppv.mo before deployment. Then to deploy run:
```
dfx deploy ppv
```

<br/>
<br/>
<br/>
<br/>

## Deploy backend smart contracts

1. Navigate into backend folder
```
cd contracts/backend
```

2. Make sure dfx is installed. And version must be 14.3
```
dfx --version
```

3. Run the local replica
```
dfx start --background --clean
```

4. In a new terminal cd into contracts/backend again
```
cd contracts/backend
``` 

10. deploy manager smart contract
```
dfx deploy manager 
```

11. To generate did files for account-bucket.mo and content-bucket.mo paste this declaration into dfx.json
```
"account_bucket_artist": {
      "main": "src/backend/artist/account-bucket.mo",
      "type": "motoko"
    },

"content_bucket_artist": {
      "main": "src/backend/artist/content-bucket.mo",
      "type": "motoko"
    },
```

12. Then run this command. 
```
dfx deploy account_bucket_artist
dfx deploy content_bucket_artist
```

14. It will return the error ("Error: Invalid data: Expected arguments but found none."). That can be ignored. Then run this command to copy the generated files to the src/declarations folder
```
rsync -av .dfx/local/canisters/account_bucket_artist ./src/declarations --exclude=account_bucket_artist.wasm
rsync -av .dfx/local/canisters/content_bucket_artist ./src/declarations --exclude=content_bucket_artist.wasm
```

15. Redo steps 11-14 every time you change make changes to account-bucket.mo and/or content-bucket.mo
