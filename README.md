# BSYSTEM Design System

Shared visual language and UI foundation for BSYSTEM Platform products.

## Purpose

The Design System keeps BSYSTEM-HUB and BSYSTEM-owned modules visually and behaviorally consistent without coupling their business logic.

## Scope

- design tokens
- typography
- spacing
- colors and semantic statuses
- icons
- buttons, inputs and forms
- tables and data grids
- cards and dashboards
- navigation
- dialogs
- notifications
- loading / empty / error states
- accessibility rules
- responsive behavior
- product branding guidance

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

- consistent interaction patterns across BSYSTEM products;
- accessible by default;
- responsive and desktop-first for operational products;
- themeable without duplicating component implementations;
- no business-domain logic inside shared UI primitives;
- avoid copying third-party product UI where it creates upgrade or licensing coupling.

## Consumers

- BSYSTEM-HUB
- BSYSTEM QA
- BSYSTEM Development
- BSYSTEM Operations
- BSYSTEM Support
- Customer Portal
- future BSYSTEM AI interfaces

Third-party systems such as authentik, EspoCRM, Redmine and Outline may use compatible branding/themes where their supported extension model allows it, but this repository must not require upstream core modifications.

See [Architecture](docs/ARCHITECTURE.md) and [Roadmap](docs/ROADMAP.md).
