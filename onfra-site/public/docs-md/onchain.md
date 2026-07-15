import Link from "next/link";
import {
  DocsBreadcrumb,
  DocsCode,
  DocsH2,
  DocsH3,
  DocsTable
} from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { LINKS } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "deployed-contracts", title: "Deployed contracts" },
  { id: "erc-8004-agent", title: "ERC-8004 Agent" },
  { id: "attribution-tags", title: "Attribution tags" }
];

export default function OnchainDocsPage() {
  return (
    
      
      # Onchain &amp; Attribution
      
        OnFRA operates as a verified ERC-8004 reputation agent on Celo mainnet. Learn how to verify
        records onchain and attribute transactions back to your platform.
      

      
        ## Deployed contracts (Celo mainnet)
        
          The core OnFRA attestation contracts are deployed on Celo mainnet (chain ID `42220`).
          Lenders and developers can call these contracts directly to verify reputations.
        

        
          
            
              Contract
              Address
              Explorer
            
          
          
            
              
                **OnchainReporter** (Proxy)
              
              
                `0xE7621aF5dE3806ba26115bdC89190c65ed835C21`
              
              
                
                  Celoscan
                
              
            
            
              
                **ERC-8004 Identity Registry**
              
              
                `0x8004A169FB4a3325136EB29fA0ceB6D2e539a432`
              
              
                
                  Celoscan
                
              
            
            
              
                **ERC-8004 Reputation Registry**
              
              
                `0x8004BAa17C55a88189AE136b182e5fdA19dE9b63`
              
              
                
                  Celoscan
                
              
            
          
        

        ## ERC-8004 Agent ID
        
          OnFRA is registered on the Celo ERC-8004 Identity Registry under Agent ID **9219**.
          You can inspect the onchain identity, services, and reputation summaries at:
        

        
          
            8004scan.io/agents/celo/9219
          
        

        ## Transaction attribution tags
        
          Attribution tags allow ecosystem aggregators and off-chain indexers to credit transactions
          back to your dApp or platform. On Celo, this is standardized via trailing transaction
          calldata suffixes.
        

        
          Smart contracts on EVM ignore trailing calldata past the function arguments boundary, so
          adding this tag incurs only a minimal gas cost (~16 gas per byte) and never affects execution.
        

        ### How to derive and append suffixes
        
          Use Celo&apos;s official `@celo/attribution-tags` helper along with `viem`
          to encode and append suffixes to the data payload:
        

        ```
{`import { toDataSuffix } from "@celo/attribution-tags";
import { concat } from "viem";

// 1. Get the configured attribution tag (e.g. "onfra")
const attributionTag = process.env.NEXT_PUBLIC_ATTRIBUTION_TAG || "onfra";

// 2. Derive the hex suffix
const tagSuffix = toDataSuffix(attributionTag);

// 3. Append suffix to contract call data
const taggedData = concat([originalCalldata, tagSuffix]);

// 4. Send transaction with the tagged data
const hash = await walletClient.sendTransaction({
  to: TARGET_CONTRACT_ADDRESS,
  data: taggedData,
  type: "legacy"
});`}
```

        
          
            Previous
            x402 payments →
          
          
            Next
            MCP &amp; ERC-8004 →
          
        
      
    
  );
}