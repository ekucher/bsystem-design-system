---
"@bsystem/design-system": minor
---

Add the component set, light and dark theming, and versioned distribution.

Thirteen components join Button, Card and Badge: Input, Textarea, Select,
Table, Dialog, Alert, Spinner, Skeleton, Tabs, Breadcrumbs, Dropdown,
Pagination and StatusBadge.

Tokens are split into primitives and semantics, with a light theme applied
from the reader's system preference or forced with `data-theme`. Components
reference only semantic tokens.

`Button` now defaults to `type="button"`, which changes behaviour for any
button rendered inside a form without an explicit type: it no longer submits.

Components moved from `src/components.tsx` into `src/components/`. The public
entry point is unchanged, and consumers importing from the package root are
unaffected.
