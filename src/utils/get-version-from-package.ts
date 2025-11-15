import { readFileSync } from "fs";
import { join } from "path";

// Read version from package.json in current working directory
export function getVersionFromPackage(): string {
  try {
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));

    return packageJson.version || "0.0.1";
  } catch {
    return "0.0.1";
  }
}
