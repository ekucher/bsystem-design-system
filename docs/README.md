# Design system documentation

| Document | What it answers |
| --- | --- |
| [ARCHITECTURE.md](ARCHITECTURE.md) | what belongs here and what does not |
| [RELEASING.md](RELEASING.md) | how a change reaches a consumer |
| [adr/ADR-011](adr/ADR-011-design-system-distribution.md) | why versioned packages rather than a branch |

## The one rule

**No business logic.** A component here knows how something looks and how it
behaves as a control. It does not know what a client is, what a permission
means, or which API returns it. A component that needed that knowledge would
make this repository a second place where platform decisions live.
