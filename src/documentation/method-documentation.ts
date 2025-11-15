import { MethodType } from "@/method/method-type";

// Method documentation data
export class MethodDocumentation {
  constructor(
    public name: string,
    public type: MethodType,
    public input?: any,
    public output?: any,
    public description?: string,
  ) {}

  static fromMethod(method: any): MethodDocumentation {
    return new MethodDocumentation(
      method.name,
      method.type,
      method.inputClass,
      method.outputClass,
      method.description,
    );
  }
}
