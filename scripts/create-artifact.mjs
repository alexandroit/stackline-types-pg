import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { access, copyFile, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const destination = path.join(root, 'release-candidate')
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'

function command(executable, arguments_, cwd = root) {
  return execFileSync(executable, arguments_, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, NO_UPDATE_NOTIFIER: '1' },
    stdio: ['ignore', 'pipe', 'pipe']
  }).trim()
}

function digest(algorithm, bytes, encoding = 'hex') {
  return createHash(algorithm).update(bytes).digest(encoding)
}

async function archivePath(directory, filename) {
  const reported = path.join(directory, filename)
  const npm8 = path.join(directory, filename.replace(/^@([^/]+)\//, '$1-'))
  try {
    await access(reported)
    return reported
  } catch {
    await access(npm8)
    return npm8
  }
}

try {
  await access(destination)
  throw new Error(`release candidate already exists: ${destination}`)
} catch (error) {
  if (error.code !== 'ENOENT') throw error
}

execFileSync(npm, ['run', 'verify'], { cwd: root, stdio: 'inherit', env: process.env })
assert.equal(command('git', ['status', '--porcelain', '--untracked-files=normal']), '', 'release source must be clean')

const manifest = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
const tag = `stackline-v${manifest.version}`
assert.ok(command('git', ['tag', '--points-at', 'HEAD']).split('\n').includes(tag), `${tag} must point at HEAD`)

let staging = await mkdtemp(path.join(root, '.release-candidate-staging-'))
try {
  const packed = JSON.parse(command(npm, [
    'pack', '--silent', '--json', '--ignore-scripts', '--pack-destination', staging
  ]))
  assert.equal(packed.length, 1)
  const details = packed[0]
  const archive = await archivePath(staging, details.filename)
  const filename = details.filename.replace(/^@([^/]+)\//, '$1-')
  const bytes = await readFile(archive)
  const sha1 = digest('sha1', bytes)
  const sha256 = digest('sha256', bytes)
  const sha512 = digest('sha512', bytes)
  const integrity = `sha512-${digest('sha512', bytes, 'base64')}`
  assert.equal(details.shasum, sha1)
  assert.equal(details.integrity, integrity)

  const commit = command('git', ['rev-parse', 'HEAD'])
  const artifact = {
    schema: 'stackline-release-artifact-v1',
    package: `${details.name}@${details.version}`,
    filename,
    sha1,
    sha256,
    sha512,
    integrity,
    packedSize: details.size,
    unpackedSize: details.unpackedSize,
    entryCount: details.entryCount,
    sourceCommit: commit,
    sourceTag: tag,
    files: details.files.map(({ path: file, size, mode }) => ({ file, size, mode }))
  }
  await writeFile(path.join(staging, 'artifact-manifest.json'), JSON.stringify(artifact, null, 2) + '\n')
  await writeFile(path.join(staging, 'inventory.json'), JSON.stringify({ package: artifact.package, files: artifact.files }, null, 2) + '\n')
  await writeFile(path.join(staging, 'SHA1SUMS'), `${sha1}  ${filename}\n`)
  await writeFile(path.join(staging, 'SHA256SUMS'), `${sha256}  ${filename}\n`)
  await writeFile(path.join(staging, 'SHA512SUMS'), `${sha512}  ${filename}\n`)
  await writeFile(path.join(staging, 'source-provenance.json'), JSON.stringify({
    compatibilityBaseline: {
      package: '@types/pg@8.23.1',
      registryIntegrity: 'sha512-fKVHpikPdg4GKks3JuLEhvwSyvwzF23hnabPy6DD8ljVbC7+6J5dQzdv4arV6jqq57djnMgs1HKBxX4P8aBI3A==',
      contentHash: '4c3006364fd06c962ce8e915a3dcf8d0d87bfec39f509aa95b270ad620cad104',
      repository: 'https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/pg'
    },
    releaseSource: { commit, tag }
  }, null, 2) + '\n')
  await writeFile(path.join(staging, 'licenses.json'), JSON.stringify({
    package: { name: manifest.name, license: 'MIT', file: 'LICENSE' },
    productionDependencies: Object.entries(manifest.dependencies).map(([name, version]) => ({ name, version, reviewed: true })),
    maintainedUpstreamSource: { package: '@types/pg@8.23.1', license: 'MIT', notice: 'NOTICE' }
  }, null, 2) + '\n')
  await copyFile(path.join(root, 'CHANGELOG.md'), path.join(staging, 'RELEASE_NOTES.md'))

  const consumer = await mkdtemp(path.join(staging, '.sbom-consumer-'))
  await writeFile(path.join(consumer, 'package.json'), JSON.stringify({
    name: 'stackline-types-pg-sbom-consumer',
    private: true,
    version: '1.0.0'
  }, null, 2) + '\n')
  command(npm, ['install', '--ignore-scripts', '--omit=dev', '--no-audit', '--no-fund', archive], consumer)
  await writeFile(path.join(staging, 'sbom.cdx.json'), command(npm, [
    'sbom', '--omit=dev', '--sbom-format', 'cyclonedx'
  ], consumer) + '\n')
  await rm(consumer, { recursive: true, force: true })

  await rename(staging, destination)
  staging = null
  console.log(`Prepared immutable ${filename} (${sha256}).`)
} finally {
  if (staging) await rm(staging, { recursive: true, force: true })
}
