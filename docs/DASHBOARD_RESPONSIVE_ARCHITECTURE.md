# Dashboard responsive architecture

## Breakpoint model

The dashboard is mobile-first. Shared controls use a minimum 44px target (`min-h-11`); content begins with one column and expands through `sm`, `md`, `lg`, and `xl` only where information density requires it.

| Width range | Shell behavior | Content behavior |
| --- | --- | --- |
| 360–639px | Drawer navigation, compact header, account-menu context, two-level breadcrumb maximum. | One-column forms, sticky primary actions, mobile record cards where supplied by a screen. |
| 640–1023px | Header reveals desktop context progressively; sidebar remains a drawer. | Two-column form grids and compact filter layouts become available. |
| 1024px+ | Persistent collapsible sidebar and full breadcrumb trail. | Full tables with an overflow-safe scroller and multi-column grids. |

## Shell guarantees

- The mobile drawer locks background scroll, traps focus, restores focus, responds to Escape, and closes after navigation or overlay activation.
- Sidebar sections expose `aria-expanded`; the active route opens its containing group. Mobile sections are accordion-like, desktop sections can remain independently expanded.
- Logical CSS properties (`start`, `end`, `ps`, `pe`, `border-e`) preserve RTL and LTR behavior.
- The content container is `min-w-0` and uses responsive insets to avoid a shell-induced horizontal overflow.

## Verification matrix

Manual browser validation is required at 360×800, 375×812, 390×844, 412×915, 768×1024, 1024×768, 1280×800, 1366×768, 1440×900, and 1920×1080. The required checks are drawer focus restoration, no horizontal overflow, full form submission visibility, table fallback/card rendering where present, Arabic RTL, English LTR, and light/dark contrast.
