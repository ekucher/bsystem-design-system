---
"@bsystem/design-system": minor
---

Make the primary and danger button labels readable in the dark theme, and
enforce contrast in the test suite.

`docs/ARCHITECTURE.md` requires sufficient contrast, and nothing asserted it:
`src/test/axe.ts` disables the contrast rule, honestly, because jsdom does not
lay out or paint. Contrast does not need layout — it needs the two colours, and
both are in `tokens.css` — so the token values are now resolved and measured
directly, for every foreground/background pair the components form, in both
themes.

Two pairs failed. In the dark theme the primary button label measured 3.75:1
and the danger button label 3.35:1, against the 4.5:1 that WCAG AA requires for
text this size. Button text is `0.875rem` bold, which is not large text, so the
relaxed 3:1 threshold does not apply.

The cause is that one token was doing two jobs that pull in opposite
directions. An accent used as *text* on the page background has to be light
enough to read against it; an accent used as a *fill* under
`--bs-color-text-on-accent` has to be dark enough for that text to read against
it. In the dark theme no single value does both: `--bs-blue-500` gives 5.05:1 as
text on the page but 3.75:1 under white, and `--bs-blue-600` reverses it.

Two tokens are added for the fill, and the buttons use them:

- `--bs-color-primary-solid`
- `--bs-color-danger-solid`

In the light theme they equal `--bs-color-primary` and `--bs-color-danger`,
which already met the threshold. In the dark theme the primary and danger
buttons become a slightly deeper blue and red. Nothing else changes colour, and
accent text — breadcrumb links, badges, field errors — is untouched.

The same two rules had been setting `color: white` literally rather than
`var(--bs-color-text-on-accent)`, so no theme could reach them. They now use the
token that exists for the purpose, and the suite fails on any colour written
outside the token system.
