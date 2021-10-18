# mutent-migration

```javascript
import { Store } from 'mutent'
import { mutentMigration } from 'mutent-migration'

const store = new Store({
  adapter: new MyAdapter(),
  // Add the migration plugin to the store declaration
  plugins: [
    mutentMigration({
      // Required version
      version: 1,
      // Version field name
      key: 'v',
      // Migration strategies
      strategies: {
        // Migration strategy from version 0 to version 1
        1: data => {
          return {
            v: 1,
            newFieldname: data.oldFieldName
          }
        }
      }
    })
  ]
})

// Use the migrated store
```
