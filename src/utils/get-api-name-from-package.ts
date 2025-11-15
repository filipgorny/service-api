import { readFileSync } from "fs";
import { join } from "path";

// Read name from package.json in current working directory
export function getApiNameFromPackage(): string {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    return packageJson.name || "unknown";
  } catch {
    return "unknown";
  }
}
