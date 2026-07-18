# Dashboard accessibility review

## Implemented shared behavior

| Concern | Implementation |
| --- | --- |
| Landmarks | Skip-to-content link, `aside`, labelled `nav`, `header`, and `main` in `PortalShell`. |
| Navigation state | Active route uses `aria-current`; expandable groups use `aria-expanded` and `aria-controls`. |
| Dialog and drawer | `role=dialog`, `aria-modal`, title/description linkage, Escape, focus containment, and focus restoration. |
| Icon controls | Icon-only shell controls have `aria-label` and shared tooltips. |
| Forms | `FormControl` renders persistent visible labels; required state is visible and semantic. |
| Keyboard | Drawer, dialog, menu dismissal, command palette shortcut, and navigation controls are keyboard operable. |
| Motion | Global reduced-motion rule disables nonessential animation and smooth scrolling. |
| Direction | Logical positioning and spacing utilities support RTL and LTR. |
| Targets | Shared buttons and inputs use 44px minimum height. |

## Review limits

Static review cannot prove screen-reader announcement order, computed color contrast, browser focus order after every mutation, or touch behavior on physical devices. Those tests remain release-gating QA work.

## Follow-up checklist

- Test Arabic and English keyboard navigation at 390px and desktop.
- Verify drawer/menu/dialog focus restoration in Chromium, Firefox, and Safari.
- Measure light/dark contrast for all status colors and disabled controls.
- Confirm every legacy form migrated in a future feature pass has visible label and error association.
