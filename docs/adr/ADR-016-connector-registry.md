# ADR-016 - Connector Registry
Status: Accepted · Date: 2026-08-23
Connectors detect/catalog/recommend/guide - never assume availability (§32). Categories developer/knowledge/comms/storage/cloud/deployment. Auth ladder: OAuth/device-flow > OS credential store > env-ref; plaintext repo files forbidden. Progressive disclosure in wizard; recommendation engine suggests by selected tasks, installs nothing without consent (§76).
Consequences: + least-privilege defaults; - OAuth app registrations needed per provider (start P0/P1 set only).
