# Archive experience

## Implemented experience

Phase 2B introduces a dedicated School archive workspace at:

- `/[locale]/school/archive`

This route uses only verified archive behavior already supported by the backend:

- archived documents are listed by filtering the real documents list with `status=ARCHIVED`
- overview counts come from the real document overview endpoint
- archive records link back to the live document detail route

## User experience structure

The archive workspace contains:

- page header and description
- archive availability summary
- clear notice about backend limitations
- server-driven filters
- active filter chips
- desktop table
- mobile record cards
- pagination

## Supported filters

The workspace reuses real correspondence filters that are already supported by the backend contract:

- search
- direction
- category
- target party
- document date from
- document date to
- page

## Explicit non-features

The following were intentionally not invented because no verified backend support was found:

- restore from archive
- permanent destruction
- retention execution
- legal hold
- physical storage location
- barcode/OCR workflows
- separate archive repository semantics

## Metadata behavior

The UI shows archive-adjacent metadata only when it is truly returned by the backend through document detail/activity responses.

Therefore Phase 2B does not fabricate:

- archived by
- archived at
- archive reason history beyond the current supported responses

## Operational rules

- archive creation still happens from the document detail action using the dedicated archive endpoint
- archive reason remains mandatory in the detail workflow
- archived records remain readable through the normal document detail route
- restore is hidden entirely rather than shown disabled

## Phase 3 verification focus

Runtime verification should confirm:

- the backend returns archived records consistently through list filters
- archive reason visibility matches real payloads
- Arabic and English archive filters preserve URL state correctly
- document detail links remain valid for archived records
