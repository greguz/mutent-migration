import test from 'ava'
import { Store } from 'mutent'

import { mutentMigration } from './mutent-migration.mjs'

function createStore (options) {
  const items = []

  return new Store({
    adapter: {
      find (predicate) {
        return items.find(predicate)
      },
      filter (predicate) {
        return items.filter(predicate)
      },
      create (data) {
        items.push(data)
      },
      update (oldData, newData) {
        items.splice(
          items.findIndex(item => item === oldData),
          1,
          newData
        )
      },
      delete (data) {
        items.splice(
          items.findIndex(item => item === data),
          1
        )
      }
    },
    plugins: [
      mutentMigration(options)
    ]
  })
}

test('migration:upgrade', async t => {
  const strategies = {
    1: data => ({
      v: 1,
      number: parseFloat(data.value)
    }),
    2: data => ({
      v: 2,
      number: data.number
    }),
    3: data => ({
      v: 3,
      integer: Math.round(data.number)
    })
  }

  const store = createStore({
    explicitVersion: true,
    strategies,
    version: 3
  })

  const data = await store.create({ value: '41.7' }).unwrap()

  t.deepEqual(data, {
    v: 3,
    integer: 42
  })
})

test('migration:ignore', async t => {
  const store = createStore({ version: 1 })
  const data = { v: 1, everything: 42 }
  const result = await store.create(data).unwrap()
  t.true(data === result)
})

test('migration:errors', async t => {
  const store = createStore({
    strategies: {
      1: () => null
    },
    version: 2,
    key: '_v'
  })

  await t.throwsAsync(
    store.create({ _v: 1 }).unwrap(),
    { code: 'EMUT_STRATEGY_EXPECTED' }
  )

  await t.throwsAsync(
    store.create({ _v: 3 }).unwrap(),
    { code: 'EMUT_FUTURE_ENTITY' }
  )

  await t.throwsAsync(
    store.create({ _v: true }).unwrap(),
    { code: 'EMUT_INVALID_ENTITY_VERSION' }
  )

  await t.throwsAsync(
    store.create({ _v: 0 }).unwrap(),
    { code: 'EMUT_INVALID_UPGRADE' }
  )
})

test('migration:init', async t => {
  const store = createStore({
    version: 1,
    strategies: {
      1: obj => ({ ...obj, v: 1, value: obj.value * 2 })
    }
  })

  const a = await store.create({ value: 42 }).unwrap()
  t.like(a, {
    v: 1,
    value: 42
  })

  const b = await store.from({ value: 8 }).unwrap()
  t.like(b, {
    v: 1,
    value: 16
  })
})

test('migration:skip', async t => {
  t.plan(4)

  const store = createStore({
    version: 1,
    strategies: {
      1: obj => {
        t.pass()
        return { ...obj, v: 1, value: obj.value * 2 }
      }
    }
  })

  const inserted = await store.create({ v: 0, value: 21 }).unwrap({
    mutent: {
      skipMigration: true
    }
  })
  t.like(inserted, { v: 0, value: 21 })

  const withPlugin = await store.read(() => true).unwrap()
  t.like(withPlugin, { v: 1, value: 42 })

  const withoutPlugin = await store.read(() => true).unwrap({
    mutent: {
      skipMigration: true
    }
  })
  t.like(withoutPlugin, { v: 0, value: 21 })
})

test('set default version with ensure mutator', async t => {
  t.plan(1)

  const store = createStore({
    version: 1,
    strategies: {
      1: () => {
        t.fail()
        throw new Error('Should be skipped')
      }
    }
  })

  const obj = await store
    .from(null)
    .ensure({ id: 42 })
    .unwrap()

  t.deepEqual(obj, {
    id: 42,
    v: 1
  })
})
