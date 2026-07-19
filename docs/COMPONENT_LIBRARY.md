# Component Library

## UI primitives

`src/components/ui` contains the reusable accessible building blocks: Button, Input, Textarea, Select, Checkbox, Switch, Badge, Dialog, Drawer, ConfirmDialog, Tooltip, SearchInput, Skeleton, and reason-dialog. Prefer them over local equivalents.

## Product primitives

`src/components/layout/product-framework.tsx` is the page composition layer:

- `PageStack`, `PageHeader`, and `SectionHeader` establish hierarchy.
- `SurfaceCard`, `MetricGrid`, and `MetricCard` present platform and school metrics consistently.
- `FilterBar`, `ActiveFilterChips`, table helpers, and `PaginationBar` form the CRUD foundation.
- `QuickActionGrid` and `QuickActionCard` host locale-aware, permission-safe links or actions.
- `ActivityFeed`, metadata, mobile record cards, and route skeletons cover operational context and responsive states.

Feature-local `common.tsx` files only re-export this layer or compose it. They are not a second visual system.

## Usage rule

Use semantic elements and native controls first. A caller supplies the interactive child for a quick-action card so `Link`, `Button`, permission gates, and accessible names retain their real behavior.

## Phase 2 verification additions

`DashboardRouteLoading` is the shared route-level skeleton used by both portal route boundaries. Playwright public-shell smoke checks validate direct login URLs, client-side validation, locale direction, keyboard-addressable fields, and phone-width overflow without relying on an authenticated backend response.
