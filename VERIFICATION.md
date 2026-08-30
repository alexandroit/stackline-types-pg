# Verification

Required release gates:

- fresh source install without warnings;
- valid complete source tree and zero full audit findings;
- upstream declaration hash equality;
- TypeScript 6 compilation against the public API;
- release gates on Node 16, 18, 22, and 26;
- clean packed installs under `@stackline/types-pg` and `@types/pg`;
- zero packed production audit findings;
- absence of the old PostgreSQL parser subtree;
- package inventory, strict lint, license review, SBOM, provenance, and
  cryptographic checksums.
