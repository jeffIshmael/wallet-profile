10:04:28.690 Running build in Washington, D.C., USA (East) – iad1
10:04:28.690 Build machine configuration: 2 cores, 8 GB
10:04:28.824 Cloning github.com/jeffIshmael/wallet-profile (Branch: main, Commit: f364fc0)
10:04:29.705 Cloning completed: 880.000ms
10:04:32.321 Restored build cache from previous deployment (Fk4pWfbchSAKJTzEqdhL6veyDYGu)
10:04:32.524 Running "vercel build"
10:04:32.546 Vercel CLI 54.12.2
10:04:33.118 Installing dependencies...
10:04:37.368 
10:04:37.369 removed 1 package in 4s
10:04:37.369 
10:04:37.369 342 packages are looking for funding
10:04:37.369   run `npm fund` for details
10:04:37.411 Detected Next.js version: 14.2.35
10:04:37.419 Running "npm run build"
10:04:37.549 
10:04:37.550 > @chainalyse/web@0.1.0 prebuild
10:04:37.550 > npm run build:agent
10:04:37.550 
10:04:37.683 
10:04:37.684 > @chainalyse/web@0.1.0 build:agent
10:04:37.684 > npm ci --prefix "../OnFRA agent" && npm run build --prefix "../OnFRA agent" && node scripts/bundle-onfra.mjs
10:04:37.684 
10:04:39.840 npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
10:04:40.430 npm warn deprecated uuid@10.0.0: uuid@10 and below is no longer supported.  For ESM codebases, update to uuid@latest.  For CommonJS codebases, use uuid@11 (but be aware this version will likely be deprecated in 2028).
10:04:44.476 
10:04:44.476 added 65 packages, and audited 66 packages in 7s
10:04:44.477 
10:04:44.477 24 packages are looking for funding
10:04:44.477   run `npm fund` for details
10:04:44.481 
10:04:44.482 3 moderate severity vulnerabilities
10:04:44.482 
10:04:44.482 To address all issues, run:
10:04:44.482   npm audit fix
10:04:44.483 
10:04:44.483 Run `npm audit` for details.
10:04:44.670 
10:04:44.670 > onchain-financial-agent@1.0.0 build
10:04:44.670 > tsc
10:04:44.670 
10:04:49.713 
10:04:49.718   src/lib/agent/onfra-dist/dashboard_bundle.js  1.8mb ⚠️
10:04:49.719   src/lib/agent/onfra-dist/chat_agent.js        1.7mb ⚠️
10:04:49.719 
10:04:49.719 ⚡ Done in 343ms
10:04:49.720 [bundle-onfra] Wrote bundled agent to /vercel/path0/web/src/lib/agent/onfra-dist
10:04:49.735 
10:04:49.736 > @chainalyse/web@0.1.0 build
10:04:49.736 > prisma generate && next build
10:04:49.736 
10:04:50.540 Loaded Prisma config from prisma.config.ts.
10:04:50.540 
10:04:50.577 Prisma schema loaded from prisma/schema.prisma.
10:04:50.812 
10:04:50.813 ✔ Generated Prisma Client (7.8.0) to ./generated/prisma in 138ms
10:04:50.813 
10:04:51.850   ▲ Next.js 14.2.35
10:04:51.851   - Experiments (use with caution):
10:04:51.851     · outputFileTracingRoot
10:04:51.852 
10:04:51.868    Creating an optimized production build ...
10:05:42.502  ⚠ Compiled with warnings
10:05:42.503 
10:05:42.503 ./node_modules/ox/_esm/tempo/internal/virtualMasterPool.js
10:05:42.503 Critical dependency: the request of a dependency is an expression
10:05:42.504 
10:05:42.504 Import trace for requested module:
10:05:42.504 ./node_modules/ox/_esm/tempo/internal/virtualMasterPool.js
10:05:42.504 ./node_modules/ox/_esm/tempo/VirtualMaster.js
10:05:42.504 ./node_modules/ox/_esm/tempo/index.js
10:05:42.504 ./node_modules/viem/_esm/tempo/chainConfig.js
10:05:42.505 ./node_modules/viem/_esm/chains/definitions/tempo.js
10:05:42.505 ./node_modules/viem/_esm/chains/index.js
10:05:42.505 ./src/providers/AuthProvider.tsx
10:05:42.505 
10:05:42.505 ./node_modules/ox/_esm/tempo/internal/virtualMasterPool.js
10:05:42.506 Critical dependency: the request of a dependency is an expression
10:05:42.506 
10:05:42.506 Import trace for requested module:
10:05:42.506 ./node_modules/ox/_esm/tempo/internal/virtualMasterPool.js
10:05:42.506 ./node_modules/ox/_esm/tempo/VirtualMaster.js
10:05:42.506 ./node_modules/ox/_esm/tempo/index.js
10:05:42.506 ./node_modules/viem/_esm/tempo/chainConfig.js
10:05:42.507 ./node_modules/viem/_esm/chains/definitions/tempo.js
10:05:42.507 ./node_modules/viem/_esm/chains/index.js
10:05:42.507 ./src/providers/AuthProvider.tsx
10:05:42.507 
10:05:42.507    Linting and checking validity of types ...
10:06:00.959 Failed to compile.
10:06:00.959 
10:06:00.960 ./src/lib/privy/sponsoredProvider.ts:57:9
10:06:00.960 Type error: Type '<rpcSchemaOverride extends RpcSchemaOverride | undefined = undefined, _parameters extends EIP1193Parameters<DerivedRpcSchema<[{ Method: "web3_clientVersion"; Parameters?: undefined; ReturnType: string; }, { Method: "web3_sha3"; Parameters: [data: `0x${string}`]; ReturnType: string; }, ... 80 more ..., { ...; }], rpc...' is not assignable to type 'EIP1193RequestFn<[{ Method: "web3_clientVersion"; Parameters?: undefined; ReturnType: string; }, { Method: "web3_sha3"; Parameters: [data: `0x${string}`]; ReturnType: string; }, { Method: "net_listening"; Parameters?: undefined; ReturnType: boolean; }, ... 79 more ..., { ...; }], false>'.
10:06:00.961   Type 'Promise<`0x${string}` | _returnType>' is not assignable to type 'Promise<_returnType>'.
10:06:00.961     Type '`0x${string}` | _returnType' is not assignable to type '_returnType'.
10:06:00.962       '_returnType' could be instantiated with an arbitrary type which could be unrelated to '`0x${string}` | _returnType'.
10:06:00.962 
10:06:00.962   55 |   walletAddress: string
10:06:00.963   56 | ): EIP1193Provider {
10:06:00.964 > 57 |   const request: EIP1193Provider["request"] = async (args) => {
10:06:00.965      |         ^
10:06:00.965   58 |     if (args.method === "eth_sendTransaction") {
10:06:00.965   59 |       const params = (args.params?.[0] ?? {}) as TxParams;
10:06:00.966   60 |       const { hash } = await sendTransaction(toUnsignedTransactionRequest(params), {
10:06:01.040 Next.js build worker exited with code: 1 and signal: null
10:06:01.099 npm error Lifecycle script `build` failed with error:
10:06:01.099 npm error code 1
10:06:01.100 npm error path /vercel/path0/web
10:06:01.100 npm error workspace @chainalyse/web@0.1.0
10:06:01.100 npm error location /vercel/path0/web
10:06:01.101 npm error command failed
10:06:01.101 npm error command sh -c prisma generate && next build
10:06:01.121 Error: Command "npm run build" exited with 1