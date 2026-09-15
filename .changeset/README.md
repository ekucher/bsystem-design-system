# Changesets

Every change that affects a consumer needs a changeset. A changeset is a small
file describing *what changed and how much it matters*, written by the author
of the change — who is the only person who knows whether a rename is a tidy-up
or a breaking change.

```bash
npx changeset          # describe the change and pick a bump
npx changeset version  # apply the bumps and write CHANGELOG.md
```

The alternative — deciding the version at release time by reading the diff —
is where accidental breaking releases come from.

See [docs/RELEASING.md](../docs/RELEASING.md).
