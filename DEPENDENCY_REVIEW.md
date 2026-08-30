# Production Dependency Review

Reviewed: 2026-08-30

| Installed edge | Version | Result |
| --- | ---: | --- |
| `@types/node` | `22.20.1` | Maintained Node.js declarations |
| `pg-protocol` | `1.16.0` | Maintained, no production children |
| `pg-types` | `npm:@stackline/pg-types@1.0.0` | Dependency-free compatibility fork |
| `undici-types` | resolved by `@types/node` | Maintained declaration dependency |

The upstream type package depended on `pg-types@^2.2.0`, which selected
`pg-types@2.2.0` and reached archived `xtend@4.0.2` through
`postgres-interval@1.2.0`. The exact alias removes that branch while preserving
the import key used by the declarations.

The packed package is installed directly and under the historical
`@types/pg` key. Both trees must pass normal install without warnings,
`npm ls --all --omit=dev`, and `npm audit --omit=dev` with zero findings.
