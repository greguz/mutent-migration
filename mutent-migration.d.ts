/// <reference types="mutent" />

import { Context, Generics, PluginOptions } from "mutent";

export interface MigrationOptions<G extends Generics> {
  /**
   * Required version.
   */
  version: number;
  /**
   * Version property name.
   *
   * @default "v"
   */
  key?: string | symbol;
  /**
   * Migration strategies.
   *
   * @default {}
   */
  strategies?: Record<number | string, MigrationStrategy<G>>;
  /**
   * Force Entity's update any time is handled.
   * By the default the migration is performed in-memory until the first write (commit) is performed.
   *
   * @default false
   */
  forceUpdate?: boolean;
}

export declare type MigrationStrategy<G extends Generics> = (
  data: any,
  ctx: Context<G>
) => any;

export declare function mutentMigration<G extends Generics>(
  options: MigrationOptions<G>
): PluginOptions<G>;
