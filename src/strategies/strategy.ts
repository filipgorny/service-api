import { MethodsCollection } from "@/method/methods-collection";
import { StrategyType } from "@/strategies/strategy-type";

// Strategy interface for different connection types
export interface Strategy {
  type: StrategyType;

  // Configure the strategy with methods and version (called in api.run())
  configure(methods: MethodsCollection, version: string): void;

  // Run the server (called when api.run() is invoked, after configure)
  onApiRun(): void;

  // Optional methods for testing purposes
  getApp?(): any;
  getServer?(): any;
}
