import { ClassType } from "@filipgorny/types";
import { MethodType } from "@/method/method-type";

// Class defining the structure of an API method with runtime type information
export class Method {
  inputClass!: ClassType;
  outputClass?: ClassType;
  handler!: (input: any) => Promise<any>;
  type!: MethodType;
  name!: string;
  description?: string;

  constructor(
    type: MethodType,
    name: string,
    handler: (input: any) => Promise<any>,
    description?: string,
    inputClass?: ClassType,
    outputClass?: ClassType,
  ) {
    this.type = type;
    this.name = name;
    this.handler = handler;
    this.description = description;
    this.inputClass = inputClass;
    this.outputClass = outputClass;
  }
}
