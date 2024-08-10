# mutent-migration

[![npm](https://img.shields.io/npm/v/mutent-migration)](https://www.npmjs.com/package/mutent-migration)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This plugin for [Mutent](https://github.com/greguz/mutent) provides an easy way to declare migration strategies for data versioning.

## API

### `migration(options)`

Returns a new Mutent's Plugin that will monitor all fetched Entites and applies the correct migration strategy when needed.

- `options` `<Object>`
- `[options.explicitVersion]` `<boolean>` Do not set the latest version automatically during Entities' creation.
- `[options.forceUpdate]` `<boolean>` Force Entity's update any time is handled.
- `[options.key]` `<string>` Name of the key that holds the Entity's version number.
- `[options.strategies]` `<Object>` Collection of migration functions.
- `options.version` `<number>` The wanted Entity's version.
- Returns: `<Plugin>`

### Error codes

Those are the error codes (`MutentError` instances) that can be throwed by this plugin.

#### `EMUT_INVALID_ENTITY_VERSION`

The current Entity have an invalid version value.

#### `EMUT_FUTURE_ENTITY`

Found an Entity that has a future version.

#### `EMUT_STRATEGY_EXPECTED`

An upgrade is required, but the required strategy function is missing.

#### `EMUT_INVALID_UPGRADE`

A strategy was applied to an Entity, but the Entity does not contain the expected version.

## Example

```javascript
import { Store } from 'mutent'
import ArrayAdapter from 'mutent-array'
import migration from 'mutent-migration'

const items = [
  { id: 1, oldFieldName: 'Calvin' } // implicit "v: 0"
]

const store = new Store({
  adapter: new ArrayAdapter({
    items
  }),
  plugins: [
    migration({
      // Required version
      version: 1,
      // Version field name
      key: 'v',
      // Migration strategies
      strategies: {
        // Migrate from v0 (no version) to v1
        1: ({ oldFieldName, ...data }) => {
          return {
            ...data,
            v: 1,
            newFieldname: oldFieldName
          }
        }
      }
    })
  ]
})

// Read and upgrade (in memory)
const calvin = await store
  .find(item => item.id === 1)
  .unwrap()

// { id: 1, v: 1, newFieldname: 'Calvin' }
console.log(calvin)

// Create (set latest version if not defined during creation only)
const hobbes = await store
  .create({ id: 2, newFieldname: 'Hobbes' })
  .unwrap()

// { id: 2, v: 1, newFieldname: 'Hobbes' }
console.log(hobbes)

// Create from an explicit version
const prof = await store
  .create({ id: 3, v: 0, oldFieldName: 'Miss Wormwood' })
  .unwrap()

// { id: 3, v: 1, newFieldname: 'Miss Wormwood' }
console.log(prof)
```
