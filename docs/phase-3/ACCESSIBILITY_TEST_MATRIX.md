# Accessibility test matrix

| Area | Route(s) | Checks |
|---|---|---|
| Shell landmarks | all protected routes | skip link, main landmark, nav label, breadcrumb label |
| Dialogs | document actions, command palette, any confirmation dialogs | Escape closes, focus trap adequacy, focus return |
| Drawer | mobile shell | trigger focus restore, overlay close, keyboard close |
| User menu | protected shell | trigger semantics, Escape close, outside click behavior |
| Forms | login, schools, users, documents | labels, required state, error association, summary behavior |
| Tables | schools, users, attendance, archive, reports | semantic table structure, header labels, `aria-sort` where applicable |
| Icon buttons | language/theme/sidebar/toplevel controls | accessible names present |
| RTL/LTR | Arabic and English routes | direction, focus order, alignment, card reading order |
| Print | reports | headings and order remain meaningful in print preview |
