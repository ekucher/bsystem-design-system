# Security Policy

The Design System must not contain business secrets, production credentials, authentication tokens, customer data, or environment-specific configuration.

## UI security principles

- Components must not imply that UI visibility equals authorization.
- Sensitive actions should support explicit confirmation patterns.
- Authentication/authorization logic belongs to application/backend layers.
- Components rendering untrusted text must avoid unsafe HTML injection.
- External links should use safe defaults where appropriate.
- Accessibility and security states should be clearly distinguishable.

## Reporting

Do not publish exploitable security findings in public issues. Use the repository owner's private security process when configured.
