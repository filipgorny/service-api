import { MethodDocumentation } from "../method-documentation";
import { TypesRegistry } from "@/method/types-registry";

// Interface for documentation views
export abstract class DocumentationView {
  constructor(
    protected apiName: string,
    protected methods: MethodDocumentation[],
    protected version: string,
    protected types: TypesRegistry,
  ) {}

  abstract getHTML(): string;
}
