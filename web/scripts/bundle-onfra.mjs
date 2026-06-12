import esbuild from "esbuild";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.join(__dirname, "..");
const agentDist = path.join(webRoot, "..", "OnFRA agent", "dist");
const outDir = path.join(webRoot, "src", "lib", "agent", "onfra-dist");

const entries = {
  dashboard_bundle: path.join(agentDist, "chains", "dashboard_bundle.js"),
  chat_agent: path.join(agentDist, "chains", "chat_agent.js")
};

for (const [name, entry] of Object.entries(entries)) {
  if (!fs.existsSync(entry)) {
    console.error(`[bundle-onfra] Missing ${name} at ${entry}. Run npm run build:agent first.`);
    process.exit(1);
  }
}

fs.mkdirSync(outDir, { recursive: true });

await esbuild.build({
  entryPoints: entries,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "node18",
  outdir: outDir,
  logLevel: "info",
  // viem is already in web/node_modules and resolves from the Next.js server bundle.
  external: ["viem", "viem/*"]
});

console.log(`[bundle-onfra] Wrote bundled agent to ${outDir}`);
