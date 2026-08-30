# Contributing

Declaration changes must originate from a reviewed upstream release or include
focused compatibility tests. Dependency changes require recursive closure,
license, clean-install, full-tree, and zero-audit evidence.

Run:

```sh
npm ci --ignore-scripts
npm ls --all
npm audit
npm run verify
```
