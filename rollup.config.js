export default {
  input: './mutent-migration.mjs',
  output: {
    file: './mutent-migration.cjs',
    format: 'cjs'
  },
  external: ['mutent']
}
