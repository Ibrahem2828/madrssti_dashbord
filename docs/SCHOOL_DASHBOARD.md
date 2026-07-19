# School Dashboard

## Purpose

School is an operations workspace scoped to the active school returned by the session. It consumes the school overview, KPIs, and document-overview endpoints for live operational metrics, document pressure, and recent document activity.

## Available workflows

- School dashboard, user lifecycle and RBAC.
- Academic setup and attendance operations.
- Correspondence: incoming, outgoing, internal, circular, reply-needed, archive, categories, parties, attachments, preview, and activity.
- Tickets, notifications, reports, and authorized settings.

Quick actions on the dashboard are constructed only from current session permissions. Recent activity is shown only when returned by the documents overview contract.

## Contract boundary

Student, teacher, class, subject, guardian, and import experiences are not invented as mock modules. They require a verified current endpoint and capability before being added to route navigation or product UI.
