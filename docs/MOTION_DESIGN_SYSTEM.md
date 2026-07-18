# Motion design system

## Rule

Motion communicates containment and state changes; it does not decorate every component. The dashboard uses CSS only and adds no animation dependency.

## Tokenized behavior

`motion-surface-enter` is the shared entry treatment for side panels: a 160ms ease-out opacity and 4px vertical reveal. It is applied to `Drawer` only, which avoids list-wide or layout-shifting animations.

## Accessibility

- The animation is defined exclusively under `prefers-reduced-motion: no-preference`.
- The existing global reduced-motion rule removes animation and transition duration and disables smooth scrolling.
- Focus placement is not delayed by animation; drawers remain immediately keyboard-operable.

## Non-goals

No spring animation, route transition, scrolling effect, or heavy JavaScript animation was introduced.
