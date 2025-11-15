import { MethodDocumentation } from "@/documentation/method-documentation";
import { DocumentationView } from "@/documentation/views/documentation-view";
import { OpenApiView } from "@/documentation/views/openapi";
import { TypesRegistry } from "@/method/types-registry";

// Documentation class
export class Documentation {
  constructor(
    public types: TypesRegistry,
    public methods: MethodDocumentation[],
    public apiName: string,
    public version: string,
  ) {}

  getView(): DocumentationView {
    return new OpenApiView(
      this.apiName,
      this.methods,
      this.version,
      this.types,
    );
  }
}
