/// <reference types="mutent" />

import { MutentOptions } from "mutent";

export interface MigrationOptions {
  /**
   * Required version.
   * @default 0
   */
  version?: number;
  /**
   * Version property name.
   * @default "v"
   */
  key?: string;
  /**
   * Migration strategies.
   */
  strategies?: Record<number | string, MigrationStrategy>;
}

/**
 * Can be async.
 */
export declare type MigrationStrategy = (data: any) => any;

export declare function mutentMigration(
  options?: MigrationOptions
): MutentOptions<any, any, any>;
