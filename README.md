# BSYSTEM Design System

Shared visual language and UI foundation for BSYSTEM Platform products.

## Package

```text
@bsystem/design-system
```

Current baseline exports:

```text
Button
Card
Badge
./tokens.css
./components.css
```

The package is intentionally private until a package publishing strategy is selected. Consumers should not copy component implementations into their own repositories.

## Local development

```bash
npm install
npm run check
npm run build
```

CI performs TypeScript type-checking and package build on every push and pull request.

## Usage contract

A future consuming application should import the shared styles once at its application root:

```ts
import "@bsystem/design-system/tokens.css";
import "@bsystem/design-system/components.css";
```

and components from the package:

```tsx
import { Badge, Button, Card } from "@bsystem/design-system";
```

Do not hardcode semantic colors in product components when an equivalent design token exists.

## Design tokens

Initial tokens cover:

- application/background surfaces;
- text and muted text;
- border;
- primary action;
- success/warning/danger/focus states;
- typography;
- spacing;
- radii;
- elevation;
- control height.

The current baseline is dark-theme first. Additional themes should override tokens rather than fork components.

## Foundational components

### Button

Variants:

```text
primary
secondary
danger
```

### Card

Supports standard and elevated surfaces.

### Badge

Semantic tones:

```text
neutral
success
warning
danger
```

## Semantic status model

```text
GREEN   = success / healthy / OK
BLUE    = information
YELLOW  = warning
ORANGE  = degraded
RED     = error / critical
GRAY    = unknown / disabled
```

## Platform principles

- accessible by default;
- consistent interaction patterns across BSYSTEM-owned products;
- responsive and desktop-first for operational products;
- no business-domain logic in UI primitives;
- semantic colors come from tokens;
- shared components must not depend on HUB authorization or API clients;
- third-party products are themed only through supported extension mechanisms;
- avoid upstream core forks merely to reproduce BSYSTEM visual styling.

## Consumers

Planned consumers:

- BSYSTEM-HUB
- BSYSTEM QA
- BSYSTEM Development
- BSYSTEM Operations
- BSYSTEM Support
- Customer Portal
- BSYSTEM AI interfaces

Before HUB consumes this package directly, choose one reproducible distribution mechanism (for example GitHub Packages or another internal npm registry) and pin package versions. Do not depend on an unbuilt `main` branch at runtime.

See [Architecture](docs/ARCHITECTURE.md) and [Roadmap](docs/ROADMAP.md).
