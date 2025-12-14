import "reflect-metadata";
import {
  PARAM_METADATA,
  ParamMetadata,
} from "@/controller/controller-metadata";

export function Param(paramName: string): ParameterDecorator {
  return (
    target: any,
    propertyKey: string | symbol,
    parameterIndex: number,
  ) => {
    const existingParams: ParamMetadata[] =
      Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];

    existingParams.push({
      parameterIndex,
      paramName,
    });

    Reflect.defineMetadata(PARAM_METADATA, existingParams, target, propertyKey);
  };
}

export function getParamMetadata(
  target: any,
  propertyKey: string | symbol,
): ParamMetadata[] {
  return Reflect.getMetadata(PARAM_METADATA, target, propertyKey) || [];
}
