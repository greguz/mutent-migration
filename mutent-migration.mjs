import { MutentError } from 'mutent'

function isVersion (value) {
  return Number.isInteger(value) && value >= 0
}

async function migrate (migration, data, context) {
  let version = Object(data)[migration.key] || 0
  if (!isVersion(version)) {
    throw new MutentError(
      'EMUT_INVALID_ENTITY_VERSION',
      'Current entity has an invalid version',
      {
        store: context.store,
        intent: context.intent,
        argument: context.argument,
        migration,
        data
      }
    )
  }

  if (version > migration.version) {
    throw new MutentError(
      'EMUT_FUTURE_ENTITY',
      'Current entity has a future version',
      {
        store: context.store,
        intent: context.intent,
        argument: context.argument,
        migration,
        data
      }
    )
  }

  while (version < migration.version) {
    version++

    const strategy = migration.strategies[version]
    if (!strategy) {
      throw new MutentError(
        'EMUT_EXPECTED_STRATEGY',
        `Expected migration strategy #${version}`,
        {
          store: context.store,
          intent: context.intent,
          argument: context.argument,
          migration,
          data
        }
      )
    }

    data = await strategy(data)
    if (Object(data)[migration.key] !== version) {
      throw new MutentError(
        'EMUT_INVALID_UPGRADE',
        `Migration strategy #${version} upgrade version mismatch`,
        {
          store: context.store,
          intent: context.intent,
          argument: context.argument,
          migration,
          data
        }
      )
    }
  }

  return data
}

export function mutentMigration ({ key = 'v', strategies = {}, version = 0 }) {
  if (!isVersion(version)) {
    throw new TypeError('Target version must be a positive integer or zero')
  }
  if (typeof key !== 'string') {
    throw new TypeError('Version key must be a string')
  }
  const migration = {
    key,
    strategies: Object(strategies),
    version
  }
  return {
    hooks: {
      async onEntity (entity, context) {
        entity.set(await migrate(migration, entity.valueOf(), context))
      }
    }
  }
}
