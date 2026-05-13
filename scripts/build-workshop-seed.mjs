import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildSeedListings, readJsonlFile, writeJsonFile } from "./lib/workshop-pipeline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sourcePath = path.join(__dirname, "..", "data", "workshops-curated-source.jsonl");
const outputPath = path.join(__dirname, "..", "data", "real-workshops.json");

async function main() {
  const sourceItems = await readJsonlFile(sourcePath);
  const listings = buildSeedListings(sourceItems);

  await writeJsonFile(outputPath, listings);
  console.log(`[build-workshops] Wrote ${listings.length} workshop listings to ${path.relative(process.cwd(), outputPath)}.`);
}

main().catch((error) => {
  console.error("[build-workshops] Failed to build workshop seed.");
  console.error(error);
  process.exit(1);
});
