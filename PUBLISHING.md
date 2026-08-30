# Publishing

Publish only from a clean green `main` commit and matching
`stackline-v<version>` tag. Generate `release-candidate` once, publish that
exact tarball to Verdaccio and official npm, verify registry bytes, and attach
the same artifact and evidence to an immutable GitHub release.

Never repack between destinations and never overwrite an accepted version.
