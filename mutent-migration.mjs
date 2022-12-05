import { MutentError } from 'mutent'

export function mutentMigration (options) {
  return {
    hooks: {
      onEntity: onEntityHook.bind(null, parseOptions(options))
    }
  }
}

function parseOptions (options) {
  const {
    forceUpdate,
    key = 'v',
    strategies,
    version
  } = Object(options)
  if (typeof key !== 'string' && typeof key !== 'symbol') {
    throw new TypeError()
  }
  if (!isVersion(version)) {
    throw new TypeError('Target version must be a positive integer or zero')
  }
  return {
    forceUpdate: !!forceUpdate,
    key,
    strategies: Object(strategies),
    version
  }
}

function isVersion (value) {
  return Number.isInteger(value) && value >= 0
}

/**
 * TODO: use Mutent's exported function (future versions)
 */
function getAdapterName (adapter) {
  return typeof adapter === 'object' && adapter !== null
    ? adapter[Symbol.for('adapter-name')] || adapter.constructor.name
    : 'Unknown Adapter'
}

async function onEntityHook (
  { forceUpdate, key, strategies, version },
  entity,
  ctx
) {
  // Current Entity data
  let data = entity.valueOf()

  // Current Entity version
  let v = Object(data)[key] || 0

  if (!isVersion(v)) {
    throw new MutentError(
      'EMUT_INVALID_ENTITY_VERSION',
      'Current entity has an invalid version',
      {
        adapter: getAdapterName(ctx.adapter),
        data
      }
    )
  }

  if (v > version) {
    throw new MutentError(
      'EMUT_FUTURE_ENTITY',
      'Current entity has a future version',
      {
        adapter: getAdapterName(ctx.adapter),
        data
      }
    )
  }

  while (v < version) {
    const fn = strategies[++v]

    if (typeof fn !== 'function') {
      throw new MutentError(
        'EMUT_STRATEGY_EXPECTED',
        `Expected migration strategy #${version}`,
        {
          adapter: getAdapterName(ctx.adapter),
          data,
          version: v
        }
      )
    }

    data = await fn(data, ctx)

    if (Object(data)[key] !== v) {
      throw new MutentError(
        'EMUT_INVALID_UPGRADE',
        `Migration strategy #${version} upgrade version mismatch`,
        {
          adapter: getAdapterName(ctx.adapter),
          data
        }
      )
    }

    if (forceUpdate) {
      entity.update(data)
    } else {
      entity.set(data)
    }
  }
}
