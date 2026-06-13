11:31:27.895 Running build in Washington, D.C., USA (East) – iad1
11:31:27.896 Build machine configuration: 2 cores, 8 GB
11:31:28.030 Cloning github.com/jeffIshmael/wallet-profile (Branch: main, Commit: 7b0a6f7)
11:31:28.956 Cloning completed: 926.000ms
11:31:31.602 Restored build cache from previous deployment (85ghLdQnzifZJC2dRK4uN7XdcuqU)
11:31:31.832 Running "vercel build"
11:31:31.850 Vercel CLI 54.12.2
11:31:32.224 Installing dependencies...
11:31:34.995 npm error code ERESOLVE
11:31:34.996 npm error ERESOLVE could not resolve
11:31:34.996 npm error
11:31:34.999 npm error While resolving: @chainalyse/web@0.1.0
11:31:34.999 npm error Found: ox@0.14.29
11:31:34.999 npm error web/node_modules/ox
11:31:34.999 npm error   ox@"0.14.29" from viem@2.52.2
11:31:34.999 npm error   web/node_modules/viem
11:31:35.000 npm error     viem@"^2.31.7" from @base-org/account@1.1.1
11:31:35.000 npm error     web/node_modules/@base-org/account
11:31:35.000 npm error       @base-org/account@"^1.1.0" from @privy-io/react-auth@3.29.2
11:31:35.000 npm error       web/node_modules/@privy-io/react-auth
11:31:35.007 npm error         @privy-io/react-auth@"^3.29.2" from @chainalyse/web@0.1.0
11:31:35.008 npm error         web
11:31:35.008 npm error     viem@">=2.37.9" from @reown/appkit@1.8.9
11:31:35.008 npm error     web/node_modules/@reown/appkit
11:31:35.008 npm error       @reown/appkit@"1.8.9" from @walletconnect/ethereum-provider@2.22.4
11:31:35.008 npm error       web/node_modules/@walletconnect/ethereum-provider
11:31:35.008 npm error         @walletconnect/ethereum-provider@"2.22.4" from @privy-io/react-auth@3.29.2
11:31:35.008 npm error         web/node_modules/@privy-io/react-auth
11:31:35.008 npm error     5 more (@reown/appkit-common, @reown/appkit-controllers, ...)
11:31:35.008 npm error
11:31:35.008 npm error Could not resolve dependency:
11:31:35.008 npm error permissionless@"^0.2.57" from @chainalyse/web@0.1.0
11:31:35.008 npm error web
11:31:35.008 npm error   @chainalyse/web@0.1.0
11:31:35.009 npm error   node_modules/@chainalyse/web
11:31:35.009 npm error     workspace web from the root project
11:31:35.009 npm error
11:31:35.009 npm error Conflicting peer dependency: ox@0.8.9
11:31:35.009 npm error node_modules/ox
11:31:35.009 npm error   peerOptional ox@"^0.8.0" from permissionless@0.2.57
11:31:35.009 npm error   node_modules/permissionless
11:31:35.009 npm error     permissionless@"^0.2.57" from @chainalyse/web@0.1.0
11:31:35.009 npm error     web
11:31:35.009 npm error       @chainalyse/web@0.1.0
11:31:35.009 npm error       node_modules/@chainalyse/web
11:31:35.009 npm error         workspace web from the root project
11:31:35.009 npm error
11:31:35.009 npm error Fix the upstream dependency conflict, or retry this command with --force or --legacy-peer-deps to accept an incorrect (and potentially broken) dependency resolution.
11:31:35.010 npm error
11:31:35.010 npm error
11:31:35.010 npm error For a full report see:
11:31:35.010 npm error /vercel/.npm/_logs/2026-06-13T08_31_32_350Z-eresolve-report.txt
11:31:35.010 npm error A complete log of this run can be found in: /vercel/.npm/_logs/2026-06-13T08_31_32_350Z-debug-0.log
11:31:35.086 Error: Command "npm install" exited with 1