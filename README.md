# @stackline/types-pg

> Dependency-reviewed TypeScript definitions compatible with @types/pg 8.23.1.

[![npm version](https://img.shields.io/npm/v/@stackline/types-pg.svg?style=flat-square)](https://www.npmjs.com/package/@stackline/types-pg)
[![license](https://img.shields.io/npm/l/@stackline/types-pg.svg?style=flat-square)](https://github.com/alexandroit/stackline-types-pg)
[![GitHub repository](https://img.shields.io/badge/GitHub-alexandroit%2Fstackline-types-pg-181717?style=flat-square&logo=github)](https://github.com/alexandroit/stackline-types-pg)
[![Docs](https://img.shields.io/badge/docs-alexandro.net-0f766e?style=flat-square)](https://alexandro.net/docs/vanilla/types-pg/)
[![Reddit community](https://img.shields.io/badge/community-r%2FStackline-ff4500?style=flat-square&logo=reddit&logoColor=white)](https://www.reddit.com/r/Stackline/)

**[Documentation](https://alexandro.net/docs/vanilla/types-pg/)** | **[npm](https://www.npmjs.com/package/@stackline/types-pg)** | **[Issues](https://github.com/alexandroit/stackline-types-pg/issues)** | **[Repository](https://github.com/alexandroit/stackline-types-pg)**

**Current package version:** `1.0.2`

---

## Why this package?

Dependency-reviewed TypeScript definitions compatible with
`@types/pg@8.23.1`.

The declaration files are unchanged from DefinitelyTyped. This fork replaces
the historical `pg-types@2.2.0 -> postgres-interval -> xtend` dependency branch
with `@stackline/pg-types`, pins the remaining type dependencies, and verifies
the packed package in clean TypeScript consumers.

## Compatibility

| Item | Value |
| --- | --- |
| Package | `@stackline/types-pg@1.0.2` |
| Node.js runtime | `>=16` |
| CommonJS / primary entry | `./index.js` |
| Type declarations | `index.d.ts` |

- Declaration baseline: `@types/pg@8.23.1`.
- Runtime baseline: `pg@8.23.0` and `@stackline/pg@1.x`.
- TypeScript: 5.6 and newer, matching the source package metadata.
- CJS and ESM declaration entry points are preserved.
- Deep `pg/lib/*` type imports are preserved through the alias installation.

See [DEPENDENCY_REVIEW.md](https://github.com/alexandroit/stackline-types-pg/blob/main/DEPENDENCY_REVIEW.md),
[COMPATIBILITY.md](https://github.com/alexandroit/stackline-types-pg/blob/main/COMPATIBILITY.md), and [SECURITY.md](https://github.com/alexandroit/stackline-types-pg/blob/main/SECURITY.md).

## Installation

<a id="install"></a>

### Install

Use the historical `@types/pg` location so TypeScript discovery and existing
imports remain unchanged:

```sh
npm install pg@npm:@stackline/pg @types/pg@npm:@stackline/types-pg
```

## Usage

Existing source continues to work:

```ts
import { Pool, type PoolConfig, type QueryResultRow } from "pg";

const config: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  max: 10,
};

interface UserRow extends QueryResultRow {
  id: number;
  name: string;
}

const pool = new Pool(config);
const result = await pool.query<UserRow>("select id, name from users");
```

The scoped package can also be imported explicitly for types:

```sh
npm install @stackline/types-pg
```

```ts
import type { PoolConfig } from "@stackline/types-pg";
```

## Security

Review inputs and the package-specific compatibility limits before processing untrusted data. Report suspected vulnerabilities as described in the [security policy](https://github.com/alexandroit/stackline-types-pg/blob/main/SECURITY.md).

## Local Development

```sh
git clone https://github.com/alexandroit/stackline-types-pg.git
cd stackline-types-pg
npm ci
npm run verify
```

Release tooling uses Node.js 24.20.0 and npm 11.19.0. The consumer runtime contract remains the one documented above.

## Consumer Smoke Test

Run the repository's existing consumer/package check after installing development dependencies:

```sh
npm run test:smoke
```

## Release Checklist

Run `npm run verify` and inspect the package contents before release. Publish a new version through the [GitHub Actions publishing workflow](https://github.com/alexandroit/stackline-types-pg/actions/workflows/publish.yml), using the SHA-512 digest of the reviewed tarball. Verify the exact published version, tarball integrity, and npm provenance after the run.

## License

MIT. The DefinitelyTyped license and author credit are preserved in
[LICENSE](https://github.com/alexandroit/stackline-types-pg/blob/main/LICENSE), [NOTICE](https://github.com/alexandroit/stackline-types-pg/blob/main/NOTICE), and [UPSTREAM_README.md](https://github.com/alexandroit/stackline-types-pg/blob/main/UPSTREAM_README.md).

## Credits and original authors

- Phips Peter.
- Stackline maintenance: [Alexandro Paixao Marques](https://www.linkedin.com/in/aleinfo/) and [Stackline contributors](https://github.com/alexandroit).

Original copyright, license notices and contributor acknowledgements remain part of this distribution. Stackline maintenance does not replace authorship of the original work.

## Community and Links

- [Stackline website](https://alexandro.net/)
- [GitHub projects](https://github.com/alexandroit)
- [npm packages](https://www.npmjs.com/~alex360qc)
- [Reddit community — r/Stackline](https://www.reddit.com/r/Stackline/)
- [Maintainer LinkedIn](https://www.linkedin.com/in/aleinfo/)

Use this repository's issue tracker for reproducible bugs and feature requests. Join r/Stackline for examples, usage questions and release discussions.
