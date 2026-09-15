# BSYSTEM Design System Architecture

## Goal

Provide reusable visual primitives and interaction patterns shared by BSYSTEM-owned applications.

## Layers

```text
Design Tokens
    ↓
Primitives
    ↓
Components
    ↓
Patterns
    ↓
Product Screens
```

## Design tokens

Tokens should cover:

- color roles;
- typography;
- spacing;
- radius;
- elevation;
- borders;
- motion;
- breakpoints.

Tokens must use semantic names where practical, for example:

```text
color.status.success
color.status.warning
color.status.error
space.200
radius.card
```

## Components

Initial component groups:

- Button
- IconButton
- Input
- Select
- Checkbox
- Radio
- TextArea
- FormField
- Badge
- StatusBadge
- Card
- Table
- DataGrid
- Tabs
- Breadcrumbs
- Sidebar
- AppSwitcher
- Modal
- Drawer
- Toast
- Alert
- EmptyState
- ErrorState
- Skeleton
- Pagination

## Accessibility

- keyboard navigation;
- visible focus states;
- semantic HTML;
- ARIA only where needed;
- sufficient contrast;
- labels for controls;
- status information must not depend on color alone.

## Product integration

Owned BSYSTEM products should consume a versioned package rather than copy-pasting components.

Third-party platforms should use their supported theming/extension interfaces. The Design System must not require deep forks of authentik, EspoCRM, Redmine or Outline.

## Versioning

Use Semantic Versioning.

Breaking component API/token changes require a MAJOR version.
