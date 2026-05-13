import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  dedupeAndMergeListings,
  ensureDirectory,
  loadListingsFromDirectory,
  readJsonlFile,
  sortListings,
  writeJsonlFile
} from "./lib/workshop-pipeline.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const importsDir = path.join(__dirname, "..", "data", "imports", "workshops");
const curatedPath = path.join(__dirname, "..", "data", "workshops-curated-source.jsonl");
const freshMode = process.argv.includes("--fresh") || process.argv.includes("--reset");

async function readExistingCuratedSource() {
  try {
    return await readJsonlFile(curatedPath);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return [];
    }

    throw error;
  }
}

async function main() {
  await ensureDirectory(importsDir);

  const [{ files, records }, existing] = await Promise.all([
    loadListingsFromDirectory(importsDir),
    freshMode ? Promise.resolve([]) : readExistingCuratedSource()
  ]);

  const combined = dedupeAndMergeListings([...existing, ...records]);
  const normalized = sortListings(combined);

  await writeJsonlFile(curatedPath, normalized);

  const summary = {
    mode: freshMode ? "fresh" : "merge",
    filesProcessed: files.length,
    importedRecords: records.length,
    existingRecords: existing.length,
    writtenRecords: normalized.length,
    curatedPath: path.relative(process.cwd(), curatedPath)
  };

  await fs.writeFile(path.join(importsDir, ".last-import-summary.json"), `${JSON.stringify(summary, null, 2)}\n`);

  console.log(`[import-workshops] Mode: ${summary.mode}`);
  console.log(`[import-workshops] Processed ${summary.filesProcessed} raw file(s) from ${path.relative(process.cwd(), importsDir)}.`);
  console.log(`[import-workshops] Imported ${summary.importedRecords} raw record(s) and merged with ${summary.existingRecords} curated record(s).`);
  console.log(`[import-workshops] Wrote ${summary.writtenRecords} deduped listing(s) to ${summary.curatedPath}.`);
}

main().catch((error) => {
  console.error("[import-workshops] Failed to import workshop listings.");
  console.error(error);
  process.exit(1);
});
