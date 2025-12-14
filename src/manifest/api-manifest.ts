// DEPRECATED: Use Schema from @/schema.ts instead
// This file exists only for backwards compatibility

import type { Schema } from "@/schema";

export type ApiManifest = ReturnType<Schema["toJSON"]>;
