# Dashboard forms implementation

## Shared primitives

`src/components/forms/form-primitives.tsx` contains layout, field, label, help, error, summary, and action primitives. `FormControl` was added as the default wrapper for one control: it renders a visual label and uses native label nesting to associate the control semantically.

## Applied workflows

- Create and edit correspondence document forms now display permanent labels for direction, type, title, subject, priority, dates, classifications, parties, free text, and notes.
- Central school create/edit forms now expose labels for name, code, phone, timezone, and address.
- Document and Central school actions use `StickyPageActions` so the primary control remains reachable on a phone without covering the form body.

## Validation and errors

Required controls retain browser validation. Feature services return normalized backend errors; screens use inline feedback and page error states. The shared error summary and field error primitives remain available for flows that receive field-level backend envelopes.

## Migration rule

New or touched forms must use visible labels and semantic controls. Existing legacy routes are retained for compatibility and should be migrated only alongside a verified feature change, not by a blind markup rewrite.
