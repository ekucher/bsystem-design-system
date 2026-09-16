# BSYSTEM Design System

Accessible, token-driven UI primitives for the BSYSTEM Platform.

The package holds **no business logic**. A component here knows about layout,
state and accessibility; it knows nothing about clients, projects or adapters.

## Install

```bash
npm install @bsystem/design-system
```

```ts
import "@bsystem/design-system/tokens.css";
import "@bsystem/design-system/components.css";
import { Alert, Button, Table } from "@bsystem/design-system";
```

Consume a published version, never the `main` branch — see
[docs/RELEASING.md](docs/RELEASING.md).

## Components

| | |
| --- | --- |
| Actions | `Button`, `Dropdown` |
| Layout | `Card`, `Table`, `Tabs` |
| Forms | `Input`, `Textarea`, `Select` |
| Feedback | `Alert`, `Spinner`, `Skeleton` |
| Status | `Badge`, `StatusBadge` |
| Navigation | `Breadcrumbs`, `Pagination` |

## Tokens

Two layers, deliberately separated:

- **Primitives** — raw values with no meaning of their own (`--bs-gray-700`).
- **Semantics** — what a value is *for* (`--bs-color-surface`).

Components only ever reference semantic tokens. A component that reaches past
one to a primitive cannot be re-themed, because the theme is exactly the
mapping between the two layers.

### Theming

BSYSTEM is dark by default. Light is applied when the reader's system asks for
it, and either theme can be forced:

```html
<html data-theme="light">
<html data-theme="dark">
```

Only the semantic mapping changes. No component is aware which theme is active.

## Accessibility

Accessibility is asserted in the test suite, not assumed:

- Every field is associated with its label, and its description and error are
  announced with it.
- Alerts interrupt for warnings and errors, and wait for a pause for
  information and success. Interrupting someone to say a thing worked is an
  interruption for nothing.
- The dialog moves focus in, traps `Tab`, closes on `Escape` and **returns
  focus to whatever opened it** — without which a keyboard user is dropped at
  the top of the document.
- Tabs use a roving tabindex with arrow, `Home` and `End` keys, so the tab list
  is one stop in the page order rather than one stop per tab.
- The dropdown is a menu: `ArrowDown`/`ArrowUp` open it at either end, arrows
  wrap, `Escape` closes and returns focus, and a click outside dismisses it.
- Colour never carries meaning alone. Status badges render their status as
  text, alerts name their tone, invalid fields are marked and outlined, and the
  selected tab is weighted and underlined as well as coloured.
- Animation is removed for readers who ask for reduced motion.

`npm test` runs axe over every component. Automated checks cover only part of
what accessibility means — they cannot tell whether a label is accurate or
whether focus goes somewhere useful — so the behavioural tests cover those
directly. What automation catches is the part that regresses silently.

## Development

```bash
npm install
npm run check   # types
npm test        # behaviour and accessibility
npm run build   # dist/
npx changeset   # describe a consumer-visible change
```
