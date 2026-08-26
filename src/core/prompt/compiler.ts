/**
 * RaidanOpencode — Prompt Fragment Registry & Compiler
 *
 * Implements ARCHITECTURE.md §16: the final prompt is COMPILED from reusable,
 * validated fragments — never hand-assembled per agent. This replaces prompt
 * sprawl with one deterministic assembly point.
 *
 * Compile inputs (§16.2): Base Policy + Role + Agent Profile + Task + Skills +
 * Context + Runtime + Security Policy + Success Criteria + Workspace Policy.
 * Validation (§16.3): duplicate directives, missing security policy, excessive
 * context, empty task.
 */

// ---------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------

export type FragmentCategory =
  | "security"
  | "git"
  | "testing"
  | "review"
  | "research"
  | "coding"
  | "architecture"
  | "deployment"
  | "documentation";

export interface PromptFragment {
  id: string;
  category: FragmentCategory;
  content: string;
  /** Ordering within its category (lower first). Default 100. */
  priority?: number;
}

/** Registry of reusable fragments — one canonical store (§16.1). */
export class PromptFragmentRegistry {
  private fragments = new Map<string, PromptFragment>();

  register(fragment: PromptFragment): PromptFragment {
    if (!fragment.id) throw new Error("fragment.id is required");
    if (!fragment.content?.trim())
      throw new Error(`fragment ${fragment.id}: content is required`);
    const stored = { priority: 100, ...fragment };
    this.fragments.set(fragment.id, stored);
    return stored;
  }

  get(id: string): PromptFragment | undefined {
    return this.fragments.get(id);
  }

  byCategory(category: FragmentCategory): PromptFragment[] {
    return [...this.fragments.values()]
      .filter((f) => f.category === category)
      .sort((a, b) => a.priority! - b.priority! || a.id.localeCompare(b.id));
  }

  list(): PromptFragment[] {
    return [...this.fragments.values()];
  }
}

// ---------------------------------------------------------------------------
// Compilation
// ---------------------------------------------------------------------------

export interface AgentProfileHints {
  id: string;
  role?: string;
  constraints?: string[];
}

export interface CompileInput {
  task: string;
  agentProfile?: AgentProfileHints;
  skillHints?: string[];
  contextBlocks?: string[];
  runtime?: string;
  successCriteria?: string[];
  workspacePolicy?: string;
  /** Extra fragment ids to include (e.g. category-specific policies). */
  extraFragmentIds?: string[];
  /** Soft budget for the compiled prompt in characters. Default 12000. */
  maxChars?: number;
}

export interface CompiledPrompt {
  prompt: string;
  sections: { title: string; body: string }[];
  warnings: string[];
  charCount: number;
}

const SECTION_ORDER = [
  "IDENTITY",
  "TASK",
  "CONTEXT",
  "SKILLS",
  "CONSTRAINTS",
  "SECURITY POLICY",
  "SUCCESS CRITERIA",
  "WORKSPACE",
] as const;

/**
 * Deterministic compiler: same registry state + input ⇒ byte-identical output.
 */
export class PromptCompiler {
  constructor(
    private registry: PromptFragmentRegistry,
    private options: { maxChars?: number } = {},
  ) {}

  compile(input: CompileInput): CompiledPrompt {
    const warnings: string[] = [];
    const maxChars = input.maxChars ?? this.options.maxChars ?? 12_000;

    if (!input.task?.trim()) {
      throw new Error("compile: task is required");
    }

    // --- gather fragments ---------------------------------------------------
    const seen = new Set<string>();
    const securityBlocks: string[] = [];
    for (const f of this.registry.byCategory("security")) {
      if (seen.has(f.id)) continue; // duplicate directive guard
      seen.add(f.id);
      securityBlocks.push(f.content.trim());
    }
    if (securityBlocks.length === 0) {
      warnings.push("no security policy fragments registered — refusing silent policy gap");
    }

    for (const id of input.extraFragmentIds ?? []) {
      const f = this.registry.get(id);
      if (!f) {
        warnings.push(`extra fragment "${id}" not found — skipped`);
        continue;
      }
      if (seen.has(id)) {
        warnings.push(`duplicate fragment "${id}" requested again — included once`);
        continue;
      }
      seen.add(id);
      if (f.category === "security") securityBlocks.push(f.content.trim());
    }

    // --- build sections -----------------------------------------------------
    const sections: { title: string; body: string }[] = [];

    const identityLines: string[] = [];
    if (input.agentProfile?.role)
      identityLines.push(`Role: ${input.agentProfile.role}`);
    if (input.agentProfile?.id)
      identityLines.push(`Agent profile: ${input.agentProfile.id}`);
    if (input.runtime) identityLines.push(`Runtime: ${input.runtime}`);
    if (identityLines.length)
      sections.push({ title: "IDENTITY", body: identityLines.join("\n") });

    sections.push({ title: "TASK", body: input.task.trim() });

    if (input.contextBlocks?.length) {
      const cleaned = input.contextBlocks.map((c) => c.trim()).filter(Boolean);
      if (cleaned.length) sections.push({ title: "CONTEXT", body: cleaned.join("\n\n") });
    }

    if (input.skillHints?.length) {
      sections.push({
        title: "SKILLS",
        body: input.skillHints.map((s) => `- ${s}`).join("\n"),
      });
    }

    const constraints = [...(input.agentProfile?.constraints ?? [])];
    if (constraints.length)
      sections.push({ title: "CONSTRAINTS", body: constraints.map((c) => `- ${c}`).join("\n") });

    if (securityBlocks.length)
      sections.push({ title: "SECURITY POLICY", body: securityBlocks.join("\n") });

    if (input.successCriteria?.length)
      sections.push({
        title: "SUCCESS CRITERIA",
        body: input.successCriteria.map((c) => `- ${c}`).join("\n"),
      });

    if (input.workspacePolicy)
      sections.push({ title: "WORKSPACE", body: input.workspacePolicy });

    // Order deterministically regardless of construction order.
    sections.sort(
      (a, b) =>
        SECTION_ORDER.indexOf(a.title as (typeof SECTION_ORDER)[number]) -
        SECTION_ORDER.indexOf(b.title as (typeof SECTION_ORDER)[number]),
    );

    // --- budget check ---------------------------------------------------------
    const prompt = sections.map((s) => `## ${s.title}\n${s.body}`).join("\n\n");
    const charCount = prompt.length;
    if (charCount > maxChars) {
      warnings.push(
        `compiled prompt exceeds budget (${charCount} > ${maxChars} chars) — reduce context blocks`,
      );
    }

    return { prompt, sections, warnings, charCount };
  }
}
