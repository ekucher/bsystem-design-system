# ADR-011: Design System distribution

Status: Accepted

Date: 2026-09-16

## Context

The HUB needs the design system's components and tokens. There are three ways
to get them there, and the easy one is wrong.

**Consume `main` directly** — a git dependency on the branch. `CLAUDE.md`
forbids it, and the reason is worth stating rather than citing: a consumer
pinned to `main` receives every change the moment it lands, including the ones
that were not finished. A broken commit here becomes a broken build in the HUB
with no step in between where anybody could have looked. There is no way for a
consumer to say "not that one yet", and no way to tell from the HUB's lockfile
what it is actually built against.

**Vendor a copy** into the HUB. The HUB then builds reproducibly, and the two
copies diverge within weeks. Worse, the divergence is invisible: nothing
compares them.

**Publish versioned packages.** More machinery, and the machinery is the point.

## Decision

Versioned npm packages, released with Changesets.

**Every change that affects a consumer carries a changeset**, written by the
author — the only person who knows whether a rename is a tidy-up or a breaking
change. A tool cannot tell those apart by reading a diff, and a tool that
guesses will guess "patch" on the change that breaks every consumer.

The bump describes the **effect on a consumer**, not the size of the diff:

| Bump | When |
| --- | --- |
| `patch` | a fix that changes no API and no markup a consumer styles |
| `minor` | a new component or prop, or a change to rendered markup or class names |
| `major` | a removed or renamed export, a changed prop contract, a removed token |

Rendered markup and class names are in that table deliberately. They are not
"internal": a consumer styles them, and changing them breaks that consumer as
surely as removing an export would.

**Tests are excluded from the published bundle.** They were being compiled into
`dist/` and would have shipped test-only helpers as public API — things nobody
designed, documented or intended to support, but which a consumer could import
and would then depend on.

## Consequences

The HUB upgrades deliberately. A change here reaches it when somebody chooses
it, and the choice is recorded in a lockfile that says exactly what the build
contains.

The cost is a release step, and a discipline: a change without a changeset is a
change no consumer can receive. That friction is doing work — it is the moment
where "is this breaking?" gets asked by the only person who can answer it.

**Publishing is currently blocked**: it needs a registry and a credential that
only the owner can provide, recorded in `TASKS.md` as P6.3. Until then the
package is built and versioned but not distributed, and the HUB carries its own
styles. Nothing about this decision changes when the credential arrives — the
machinery is in place and untested only in its last step.
