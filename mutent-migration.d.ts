/// <reference types="mutent" />

import { Context, Generics, PluginOptions } from "mutent";

export interface MigrationOptions<G extends Generics> {
  /**
   * Current Entity version (revision). Must be zero or positive integer.
   */
  version: number;
  /**
   * The name of the property the contains the Entity's version value.
   *
   * @default "v"
   */
  key?: string | symbol;
  /**
   * Functions that perform migration from a version to another one.
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
  /**
   * Do not set the latest version automatically during Entities' creation.
   *
   * @default false
   */
  explicitVersion?: boolean;
}

export declare type MigrationStrategy<G extends Generics> = (
  data: any,
  ctx: Context<G>
) => any;

export declare function mutentMigration<G extends Generics>(
  options: MigrationOptions<G>
): PluginOptions<G>;
