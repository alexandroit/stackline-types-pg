# Migration

Replace only the type dependency:

```sh
npm install @types/pg@npm:@stackline/types-pg
```

No TypeScript source change is required. Imports continue to use `pg`.

For the complete clean runtime and type graph:

```sh
npm install pg@npm:@stackline/pg @types/pg@npm:@stackline/types-pg
```
