// FILE: lib/knownTokens.ts
// Celo tokens we always check when listing balances (the Celo explorer's list is added on top).
// Addresses were written from memory of Celo's token lists: confirm any you care about on celoscan.io.
// Safe by design: symbol, name and decimals are always read from the chain, never from this file, and only USDC, USDT
// and cUSD are valued at $1 (see STABLE_ADDRESSES in celoChain.ts). A wrong address just returns nothing or shows its true symbol.
export const KNOWN_TOKENS: Array<{ address: string; label: string }> = [
    { address: "0xceba9300f2b948710d2653dd7b07f33a8b32118c", label: "USDC" },
    { address: "0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e", label: "USDT" },
    { address: "0x765de816845861e75a25fca122bb6898b8b1282a", label: "USDm (Mento dollar)" },
    { address: "0xd8763cba276a3738e6de85b4b3bf5fded6d6ca73", label: "EURm" },
    { address: "0xe8537a3d056da446677b9e9d6c5db704eaab4787", label: "REALm" },
    { address: "0x4f604735c1cf31399c6e711d5962b2b3e0225ad3", label: "GLOm" },
    { address: "0x73f93dcc49cb8a239e2032663e9475dd5ef29a08", label: "XOFm" },
    { address: "0x456a3d042c0dbd3db53d5489e98dfb038553b0d0", label: "KESm" },
    { address: "0x105d4a9306d2e55a71d2eb95b81553ae1dc20d7b", label: "PUSOm" },
    { address: "0x8a567e2ae79ca692bd748ab832081c45de4041ea", label: "COPm" },
    { address: "0xfaea5f3404bba20d3cc2f8c4b0a888f55a3c7313", label: "GHSm" },
    { address: "0xccf663b1ff11028f0b19058d0f7b674004a40746", label: "GBPm" },
    { address: "0x4c35853a3b4e647fd266f4de678dcc8fec410bf6", label: "ZARm" },
    { address: "0xff4ab19391af240c311c54200a492233052b6325", label: "CADm" },
    { address: "0xb55a79f398e759e43c95b979163f30ec87ee131d", label: "CHFm" },
    { address: "0xe2702bd97ee33c88c8f6f92da3b733608aa76f71", label: "NGNm" },
    { address: "0xc45ecf20f3cd864b32d9794d6f76814ae8892e20", label: "JPYm" },
    { address: "0x4aad04d41fd7fd495503731c5a2579e19054c432", label: "stCELO" },
    { address: "0x00be915b9dcf56a3cbe739d9b9c202ca692409ec", label: "UBEm" },
  ];
  // A single malformed address makes viem reject a whole multicall batch, so anything invalid is dropped here and in celoChain.ts.
  export const KNOWN_TOKEN_ADDRESSES = KNOWN_TOKENS.map((t) => t.address.toLowerCase()).filter((a) => /^0x[0-9a-f]{40}$/.test(a));