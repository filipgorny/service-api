import { ClassType } from "@filipgorny/types";
import { MethodType } from "@/method/method-type";
import { MethodConfig } from "@/method/method-config";
import { Guard } from "@/guard/guard";

// Class defining the structure of an API method with runtime type information
export class Method {
  inputClass!: ClassType;
  outputClass?: ClassType;
  handler!: (input: any) => Promise<any>;
  type!: MethodType;
  name!: string;
  description?: string;
  guard?: Guard;

  constructor(config: MethodConfig);
  constructor(
    type: MethodType,
    name: string,
    handler: (input: any) => Promise<any>,
    description?: string,
    inputClass?: ClassType,
    outputClass?: ClassType,
  );
  constructor(
    configOrType: MethodConfig | MethodType,
    name?: string,
    handler?: (input: any) => Promise<any>,
    description?: string,
    inputClass?: ClassType,
    outputClass?: ClassType,
  ) {
    // Check if first argument is MethodConfig
    if (typeof configOrType === "object" && "handler" in configOrType) {
      const config = configOrType as MethodConfig;
      this.type = config.type;
      this.name = config.name;
      this.handler = config.handler;
      this.description = config.description;
      this.inputClass = config.inputClass;
      this.outputClass = config.outputClass;
      this.guard = config.guard;
    } else {
      // Legacy constructor call
      this.type = configOrType as MethodType;
      this.name = name!;
      this.handler = handler!;
      this.description = description;
      this.inputClass = inputClass;
      this.outputClass = outputClass;
    }
  }
}
