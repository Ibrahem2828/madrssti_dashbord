# Central Dashboard

## Purpose

Central is a platform-management workspace, not a school CRUD copy. Its dashboard uses the verified central overview and school-health contracts for system visibility, schools, users, ticket load, and status.

## Available workflows

- School directory, creation, detail, activation, administration, and delegated school-user management.
- System and school health visibility.
- Central tickets: list, assign, and close according to permissions.
- Audit review and global policy updates.

The dashboard quick-navigation actions are individually permission-gated. School health is rendered from the returned health endpoint; no usage, activity, or ticket data is fabricated when an API response does not expose it.

## Boundaries

Central must not access school-only context or endpoints. Capability and permission metadata hide unsupported or unauthorized modules before rendering the corresponding action.
