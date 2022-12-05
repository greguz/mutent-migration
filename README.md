# mutent-migration

[![npm](https://img.shields.io/npm/v/mutent-migration)](https://www.npmjs.com/package/mutent-migration)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

This plugin for [Mutent](https://github.com/greguz/mutent) provides an easy way to declare migration strategies for data versioning.

## API

### `mutentMigration(options)`

Returns a new Mutent's Plugin that will monitor all fetched Entites and applies the correct migration strategy when needed.

- `options` `<Object>` 
- `[options.forceUpdate]` `<boolean>` Force Entity's update any time is handled.
- `[options.key]` `<string>` Name of the key that holds the Entity's version number.
- `[options.strategies]` `<Object>` Collection of migration functions.
- `options.version` `<number>` The wanted Entity's version.
- Returns: `<Plugin>`

## Error codes

Those are the error codes (`MutentError` instances) that can be throwed by this plugin.

### `EMUT_INVALID_ENTITY_VERSION`

The current Entity have an invalid version value.

### `EMUT_FUTURE_ENTITY`

Found an Entity that has a future version.

### `EMUT_STRATEGY_EXPECTED`

An upgrade is required, but the required strategy function is missing.

### `EMUT_INVALID_UPGRADE`

A strategy was applied to an Entity, but the Entity does not contain the expected version.

## Example

```javascript
import { Store } from 'mutent'
import { ArrayAdapter } from 'mutent-array'
import { mutentMigration } from './mutent-migration.mjs'

const items = [
  { id: 1, oldFieldName: 'Calvin' } // implicit "v: 0"
]

const store = new Store({
  adapter: new ArrayAdapter({ items }),
  plugins: [
    mutentMigration({
      // Required version
      version: 1,
      // Version field name
      key: 'v',
      // Migration strategies
      strategies: {
        // Migration strategy from version 0 (or no version) to version 1
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

async function foo () {
  const calvin = await store.find(item => item.id === 1).unwrap()
  console.log(calvin) // { id: 1, v: 1, newFieldname: 'Calvin' }

  const hobbes = await store.create({ id: 2, oldFieldName: 'Hobbes' }).unwrap()
  console.log(hobbes) // { id: 2, v: 1, newFieldname: 'Hobbes' }
}

foo()
```
