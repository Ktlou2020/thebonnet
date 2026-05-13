import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDefaultScrapeManifest, writeJsonFile } from "./lib/workshop-pipeline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, "..", "data", "workshop-scrape-manifest.json");

async function main() {
  const jobs = getDefaultScrapeManifest();
  await writeJsonFile(outputPath, {
    generatedAt: new Date().toISOString(),
    description: "Repeatable workshop scrape targets for South African city coverage growth.",
    jobs
  });

  console.log(`[scrape-manifest] Wrote ${jobs.length} scrape job(s) to ${path.relative(process.cwd(), outputPath)}.`);
}

main().catch((error) => {
  console.error("[scrape-manifest] Failed to build workshop scrape manifest.");
  console.error(error);
  process.exit(1);
});
