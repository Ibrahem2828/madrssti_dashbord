# Frontend conventions

- `app/api` is the BFF; `config` holds typed route, permission, navigation, and endpoint constants.
- Server-only configuration is never imported by Client Components. New visual code uses semantic Tailwind tokens, translation keys, Lucide icons, logical layout utilities, and visible focus styles.
- Components default to Server Components. Client Components are reserved for stateful interaction.
- Browser API calls use same-origin routes and normalized `ApiResult` values. Backend errors are not parsed independently in UI modules.
- Exact permission codes are defined once and checked with `can`, `canAny`, or `canAll`; role display is not authorization.
- Never add tokens to storage, URLs, state, or browser-readable cookies. Do not log authentication material.
- Accessible labels, keyboard interaction, reduced-motion support, and RTL/LTR behavior are required for new UI.
