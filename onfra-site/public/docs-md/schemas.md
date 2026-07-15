import Link from "next/link";
import { DocsBreadcrumb, DocsH2 } from "@/components/docs/DocsContent";
import { DocsShell } from "@/components/docs/DocsShell";
import { API_URL } from "@/lib/links";
import type { TocItem } from "@/lib/docsNav";

const TOC: TocItem[] = [
  { id: "request-schemas", title: "Request schemas" },
  { id: "response-schemas", title: "Response schemas" }
];

const SCHEMAS = [
  { file: "lenderScreenRequest.schema.json", kind: "Request" },
  { file: "lenderScreenResult.schema.json", kind: "Response" },
  { file: "walletAnalysisRequest.schema.json", kind: "Request" },
  { file: "walletAnalysisResult.schema.json", kind: "Response" },
  { file: "walletSignalResult.schema.json", kind: "Response" },
  { file: "chatRequest.schema.json", kind: "Request" },
  { file: "reportRequest.schema.json", kind: "Request" },
  { file: "reportResult.schema.json", kind: "Response" }
] as const;

export default function SchemasDocsPage() {
  return (
    
      
      # JSON schemas
      
        Request and response shapes are defined in machine-readable JSON Schema at{" "}
        `/schemas/`. Use these for validation, codegen, and agent tool definitions.
      

      
        ## Request schemas
        
          {SCHEMAS.filter((s) => s.kind === "Request").map((schema) => (
            - 
              
                {schema.file}
              
            

          ))}
        

        ## Response schemas
        
          {SCHEMAS.filter((s) => s.kind === "Response").map((schema) => (
            - 
              
                {schema.file}
              
            

          ))}
        

        
          
            API
            REST API →
          
          
            Overview
            Getting started →
          
        
      
    
  );
}