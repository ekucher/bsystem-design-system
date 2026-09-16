# Contributing to the design system

## Setup

Node 22 and npm.

```bash
npm ci
npm run check
npm test -- --run
npm run build
```

## The one rule

**No business logic.** A component knows how something looks and how it behaves
as a control. It does not know what a client is, what a permission means, or
which API returns it.

A component that needed that knowledge would make this repository a second
place where platform decisions live, and the two would disagree.

## Every consumer-visible change needs a changeset

```bash
npx changeset
```

The bump describes the **effect on a consumer**, not the size of the diff:

| Bump | When |
| --- | --- |
| `patch` | a fix that changes no API and no markup a consumer styles |
| `minor` | a new component or prop, or a change to rendered markup or class names |
| `major` | a removed or renamed export, a changed prop contract, a removed token |

Rendered markup and class names are in that table deliberately. They are not
internal: a consumer styles them, and changing them breaks that consumer as
surely as removing an export would.

You write the changeset because you are the only one who knows whether a
rename is a tidy-up or a breaking change. A tool reading the diff cannot tell,
and a tool that guesses will guess `patch` on the change that breaks everyone.

See `docs/RELEASING.md` and `docs/adr/ADR-011`.

## Accessibility is part of the component, not a later pass

Every component is tested with axe, keyboard interaction is tested explicitly,
and state is never carried by colour alone. A component that needs a sighted
mouse user is not finished.

## Commits

Conventional Commit style, one coherent change per commit:

```text
feat: add normalized client detail endpoint
fix: normalize upstream timeout errors
test: add tenant isolation matrix
docs: document adapter retry policy
ci: add OpenAPI validation
refactor: extract authorization scope evaluator
security: fix a reachable vulnerability
chore: bump the Go toolchain
```

Not `misc changes`, `update files`, `fix stuff`, `wip`.

**The message body is where the reasoning goes.** A diff shows what changed; it
cannot show what else was considered, or what the change is protecting
against. If a commit's body seems long, read a few in the history and then try
reconstructing the same decision from the diff alone.

Never force-push a shared branch. Never rewrite published history.

## Releases and the changelog

Unlike the services, this repository **does** publish a package, so it has a
real version and a real changelog. Changesets generates `CHANGELOG.md` from
the changesets in a release, which is why the changeset text is worth writing
for a consumer rather than for yourself.

Publishing is currently blocked on a registry and a credential only the owner
can provide (`TASKS.md` P6.3). The package is built and versioned; only the
last step is missing.

## The rule that matters most

**Never weaken a check to get a green build.** Not a disabled test, not a
skipped lint rule, not a broadened allow-list, not a lowered severity
threshold.

A check exists because something went wrong once. Turning it off does not
remove the problem; it removes the only thing that would have told you about
the next one. If a check is wrong, fix the check and say why in the commit —
that is a change a reviewer can evaluate, which a silent exemption is not.

A finding that is genuinely a false positive gets the narrowest possible
remedy, scoped so it cannot mask anything else, with the reasoning written
down. There is a worked example in `bsystem-integration-core/.gitleaksignore`.

## When to stop and ask

Some work cannot be finished without a decision only the owner can make:

- real credentials, API keys or passwords
- production deployment, restart, DNS or TLS
- credential rotation
- destructive database operations
- a commercial commitment, such as an SLA target
- customer ownership that nobody has defined yet

For these, record a blocked entry in `TASKS.md` with what is needed, and move
to the next independent task. **A plausible default for one of these is worse
than a blocked task**, because a blocked task is visible and a guess is not:
an invented SLA target appears in front of a customer as a promise, and reads
exactly like a real one.
