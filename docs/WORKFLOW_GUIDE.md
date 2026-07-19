# Workflow Guide

## Principle

Screens organize a user outcome around the backend-supported lifecycle, then use tables only as an entry point to that outcome.

## Current workflows

| Workspace | Workflow |
| --- | --- |
| Correspondence | Review → assign/prepare → reply or send/receive → archive → inspect attachments and activity. |
| School users | Find user → inspect details/effective permissions → edit roles or direct grants → confirm sensitive change. |
| Central schools | Find/create school → inspect state → assign or reset administrator → activate/deactivate under permission. |
| Tickets | Review → assign → resolve/close with state refresh. |

Each transition calls its existing backend operation and refreshes the resulting record. Permission gates apply at the action boundary as well as navigation.

## Adding a workflow

Before adding a screen, verify the route, capability, permission, endpoint, request/response mapper, loading/error states, and mobile behavior. If one does not exist in the official contract, document the gap rather than simulate it in the frontend.

## Phase 2 verification rule

Regression tests may inspect routing, BFF boundaries, permission gates, and non-mutating navigation. Create, delete, archive, restore, import, upload, and download verification requires dedicated disposable backend fixtures and explicit environment enablement; it must never run against an unknown account or production data.
