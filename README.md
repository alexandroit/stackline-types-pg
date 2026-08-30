# @stackline/types-pg

Dependency-reviewed TypeScript definitions compatible with
`@types/pg@8.23.1`.

The declaration files are unchanged from DefinitelyTyped. This fork replaces
the historical `pg-types@2.2.0 -> postgres-interval -> xtend` dependency branch
with `@stackline/pg-types`, pins the remaining type dependencies, and verifies
the packed package in clean TypeScript consumers.

## Install

Use the historical `@types/pg` location so TypeScript discovery and existing
imports remain unchanged:

```sh
npm install pg@npm:@stackline/pg @types/pg@npm:@stackline/types-pg
```

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

## Compatibility

- Declaration baseline: `@types/pg@8.23.1`.
- Runtime baseline: `pg@8.23.0` and `@stackline/pg@1.x`.
- TypeScript: 5.6 and newer, matching the source package metadata.
- CJS and ESM declaration entry points are preserved.
- Deep `pg/lib/*` type imports are preserved through the alias installation.

See [DEPENDENCY_REVIEW.md](DEPENDENCY_REVIEW.md),
[COMPATIBILITY.md](COMPATIBILITY.md), and [SECURITY.md](SECURITY.md).

## License

MIT. The DefinitelyTyped license and author credit are preserved in
[LICENSE](LICENSE), [NOTICE](NOTICE), and [UPSTREAM_README.md](UPSTREAM_README.md).
