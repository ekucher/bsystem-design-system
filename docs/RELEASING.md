# Releasing the design system

## Why versions matter here

`CLAUDE.md` states it plainly: do not consume an unversioned `main` branch as a
production dependency.

A consumer pinned to `main` gets every change the moment it lands, including
the ones that were not finished, and has no way to say "not that one yet". A
broken commit here becomes a broken build in the HUB with no step in between
where anyone could have looked. Versions exist so that a change is *offered*
rather than *applied*.

## Changesets

Every change that affects a consumer carries a changeset — a short file saying
what changed and how much it matters — written by the author, who is the only
person who knows whether a rename is a tidy-up or a breaking change.

```bash
npx changeset
```

Pick the bump that describes the effect on a consumer:

| Bump | When |
| --- | --- |
| `patch` | a fix that changes no API and no markup a consumer styles |
| `minor` | a new component or prop, or a change to rendered markup or class names |
| `major` | a removed or renamed export, a changed prop contract, a removed token |

A changed class name or a changed element is a **minor** bump at least, not a
patch: consumers style this markup, and a "purely visual" change is a change to
their application's appearance.

While the major version is `0`, a minor bump may still break a consumer. That
is normal for a pre-1.0 package and is exactly why consumers pin a version.

## Cutting a release

```bash
npx changeset version   # applies bumps, writes CHANGELOG.md
npm run check
npm test
npm run build
```

Commit the result — the version bump and the changelog belong in the same
commit as the removal of the consumed changesets — and open a pull request.
Publishing happens from `main` after review.

## Publishing

The package targets GitHub Packages, configured in `publishConfig`:

```json
"publishConfig": { "registry": "https://npm.pkg.github.com", "access": "restricted" }
```

A consumer authenticates with a token that has `read:packages` and scopes
`@bsystem` to the registry:

```ini
# .npmrc — the token belongs in the environment, never in the file
@bsystem:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

Then depends on a version rather than a branch:

```json
"dependencies": { "@bsystem/design-system": "^0.2.0" }
```

## What is not yet possible

Publishing itself is **blocked on owner action** and is tracked in `TASKS.md`:

- the package is `private: true`, which must be lifted deliberately rather
  than as a side effect of a tooling change;
- a registry token with `write:packages` has to exist as a repository secret,
  and creating one is an owner decision about who may publish;
- whether `@bsystem` is published to GitHub Packages or to a private registry
  is an owner decision this repository should not make for them.

Everything up to that point — versioning, changelog, build output, package
metadata and consumer instructions — is in place, so publishing is one
deliberate configuration step rather than a project.
