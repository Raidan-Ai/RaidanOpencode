# ADR-003 - Agent Registry
Status: Accepted · Date: 2026-08-23
Agents are first-class schema objects (spec §12 YAML contract: id/role/capabilities/skills/tools/models{primary,fallback,emergency}/memory/autonomy/permissions/workspace/runtime/limits), stored as markdown+frontmatter in OpenCode-native agents/ dirs PLUS registry index (agents.yaml). Vague super-agents forbidden (§58 contract fields mandatory: goal/inputs/outputs/success/failure/recovery/termination).
Consequences: + capability-driven routing possible; + doctor validates contracts; - authoring discipline enforced via schema lint.
