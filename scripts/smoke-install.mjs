import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const temporary = await mkdtemp(path.join(os.tmpdir(), 'stackline-types-pg-smoke-'))

function run(executable, arguments_, cwd = root) {
  const result = spawnSync(executable, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' }
  })
  if (result.error) throw result.error
  if (result.status !== 0) {
    throw new Error(`${executable} ${arguments_.join(' ')} failed\n${result.stdout}\n${result.stderr}`)
  }
  return { stdout: result.stdout, stderr: result.stderr }
}

async function resolveArchive(details) {
  let archive = path.join(temporary, details.filename)
  try {
    await access(archive)
  } catch {
    archive = path.join(temporary, details.filename.replace(/^@([^/]+)\//, '$1-'))
    await access(archive)
  }
  return archive
}

async function verifyConsumer(name, dependencyName, importedName, archive) {
  const consumer = path.join(temporary, name)
  await mkdir(consumer)
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name,
    private: true,
    version: '1.0.0',
    type: 'module',
    dependencies: { [dependencyName]: `file:${archive}` }
  }, null, 2) + '\n')

  const install = run(npm, [
    'install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', '--loglevel=notice'
  ], consumer)
  const installLog = `${install.stdout}\n${install.stderr}`
  assert.doesNotMatch(installLog, /npm\s+(?:warn|error)/i)
  assert.doesNotMatch(installLog, /deprecated/i)

  await writeFile(path.join(consumer, 'fixture.ts'), `
import type { PoolConfig, QueryResult, QueryResultRow } from ${JSON.stringify(importedName)}
interface Row extends QueryResultRow { id: number; name: string }
const config: PoolConfig = { connectionString: 'postgres://localhost/test', max: 5 }
declare const result: QueryResult<Row>
void config
void result.rows[0]?.name
`)
  await writeFile(path.join(consumer, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      noEmit: true,
      strict: true,
      target: 'ES2022'
    },
    include: ['fixture.ts']
  }, null, 2) + '\n')
  run(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', 'tsconfig.json'], consumer)

  const tree = JSON.parse(run(npm, ['ls', '--omit=dev', '--all', '--json'], consumer).stdout)
  assert.equal(tree.problems, undefined)
  assert.ok(tree.dependencies[dependencyName])
  const serializedTree = JSON.stringify(tree)
  for (const forbidden of ['postgres-array', 'postgres-bytea', 'postgres-date', 'postgres-interval', 'xtend']) {
    assert.doesNotMatch(serializedTree, new RegExp(`"${forbidden}"`), `${forbidden} entered the type closure`)
  }

  const audit = JSON.parse(run(npm, ['audit', '--omit=dev', '--json'], consumer).stdout)
  assert.equal(audit.metadata.vulnerabilities.total, 0)

  const installed = JSON.parse(await readFile(
    path.join(consumer, 'node_modules', ...dependencyName.split('/'), 'package.json'),
    'utf8'
  ))
  assert.equal(installed.name, '@stackline/types-pg')
}

try {
  const packed = JSON.parse(run(npm, [
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', temporary
  ]).stdout)
  assert.equal(packed.length, 1)
  const archive = await resolveArchive(packed[0])
  await verifyConsumer('scoped-types-consumer', '@stackline/types-pg', '@stackline/types-pg', archive)
  await verifyConsumer('legacy-types-consumer', '@types/pg', 'pg', archive)
  console.log('Scoped and @types/pg alias consumers passed TypeScript and clean-closure gates.')
} finally {
  await rm(temporary, { recursive: true, force: true })
}
