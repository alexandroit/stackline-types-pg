import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

assert.equal(manifest.name, '@stackline/types-pg')
assert.equal(manifest.version, '1.0.1')
assert.equal(manifest.types, 'index.d.ts')
assert.equal(manifest.main, './index.js')
assert.equal(manifest.type, 'commonjs')
assert.deepEqual(manifest.engines, { node: '>=16' })
assert.equal(manifest.typeScriptVersion, '5.6')
assert.deepEqual(manifest.dependencies, {
  '@types/node': '22.20.1',
  'pg-protocol': '1.16.0',
  'pg-types': 'npm:@stackline/pg-types@1.0.0'
})
assert.equal(manifest.peerDependencies, undefined)
assert.equal(manifest.scripts.preinstall, undefined)
assert.equal(manifest.scripts.install, undefined)
assert.equal(manifest.scripts.postinstall, undefined)

const expectedHashes = {
  'index.d.ts': '67f3d03f61a43f045851624e52ec438803ecf5d2247660f208bd9bcadb6ff298',
  'index.d.mts': '5aea76ab98173f2c230b1f78dc010da403da622c105c468ace9fe24e3b77883c',
  'lib/connection-parameters.d.ts': 'f347b7cc533c54be78d730df75fd6bbaf7af3d837d41b1659fe7d3e46524c08e',
  'lib/type-overrides.d.ts': '798367363a3274220cbed839b883fe2f52ba7197b25e8cb2ac59c1e1fd8af6b7'
}

for (const [file, expected] of Object.entries(expectedHashes)) {
  const bytes = await readFile(path.join(root, file))
  assert.equal(createHash('sha256').update(bytes).digest('hex'), expected, `${file} differs from @types/pg@8.23.1`)
}

console.log('Manifest, exact dependency aliases, exports, and upstream declaration hashes passed.')
