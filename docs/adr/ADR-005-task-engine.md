# ADR-005 - Task Engine
Status: Accepted · Date: 2026-08-23
ONE task engine on SQLite (WAL): Goal>Epic>Task>Subtask; lifecycle CREATED>PLANNED>ASSIGNED>RUNNING>WAITING>REVIEW>APPROVAL>COMPLETED; failure ladder FAILED>RETRY>RECOVER>REASSIGN>ESCALATE. Checkpoints enable constant-cost resume (agx pattern). External trackers (Jira/Linear/GitHub) are sync adapters only.
Consequences: + single state machine auditable in event ledger; + resumable long tasks; - external-tool two-way sync deferred post-v1.
