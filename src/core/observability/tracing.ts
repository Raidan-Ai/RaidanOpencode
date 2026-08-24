/**
 * Cloudflare Workers tracing facade following the OpenTelemetry GenAI
 * semantic conventions used by Cloudflare Agents tracing.
 *
 * Backed by the Workers custom spans API (`cloudflare:workers` -> tracing)
 * when running inside a Worker; a silent no-op under the Node CLI and tests.
 * The module specifier only resolves in workerd, hence the guarded dynamic
 * import instead of a static one.
 *
 * Turn structure (Cloudflare Agents docs):
 *   invoke_agent {agent}
 *   ├── chat {model}
 *   └── execute_tool {tool}
 *       └── tool_approval {tool}
 *
 * Payload policy: metadata only. Message contents and tool arguments/results
 * are never recorded; callers must not pass payloads as attributes either.
 */

export interface AgentTurnIdentity {
  /** Shared logical agent name, e.g. "raidan-orchestrator". Never derived from user or request IDs. */
  agentName: string;
  /** Stable instance identifier, e.g. "raidan-opencode-production". */
  agentId: string;
  /** Conversation/session/thread identifier for the current exchange. */
  conversationId: string;
}

export type AttributeValue = string | number | boolean | undefined;

interface CfSpan {
  readonly isTraced: boolean;
  setAttribute(key: string, value: AttributeValue): void;
  end(): void;
}

interface CfTracing {
  enterSpan<T>(name: string, callback: (span: CfSpan) => T): T;
  startActiveSpan<T>(name: string, callback: (span: CfSpan) => T): T;
}

const CF_WORKERS_MODULE = "cloudflare:workers";

let cached: CfTracing | null | undefined;

async function tracingApi(): Promise<CfTracing | null> {
  if (cached !== undefined) return cached;
  try {
    const mod = (await import(CF_WORKERS_MODULE)) as { tracing?: CfTracing };
    cached = mod.tracing ?? null;
  } catch {
    cached = null;
  }
  return cached;
}

function markIdentity(span: CfSpan, identity: AgentTurnIdentity, operation: string): void {
  if (!span.isTraced) return;
  span.setAttribute("gen_ai.operation.name", operation);
  span.setAttribute("gen_ai.agent.name", identity.agentName);
  span.setAttribute("gen_ai.agent.id", identity.agentId);
  span.setAttribute("gen_ai.conversation.id", identity.conversationId);
}

/** Wraps one full agent turn in an `invoke_agent` span (no-op outside Workers). */
export async function invokeAgentTurn<T>(
  identity: AgentTurnIdentity,
  turn: () => Promise<T>,
): Promise<T> {
  const api = await tracingApi();
  if (!api) return turn();
  return api.enterSpan("invoke_agent", (span) => {
    markIdentity(span, identity, "invoke_agent");
    return turn();
  });
}

/** Wraps a single model call in a nested `chat` span. Call within invokeAgentTurn. */
export async function chat<T>(
  identity: AgentTurnIdentity,
  model: string,
  call: () => Promise<T>,
): Promise<T> {
  const api = await tracingApi();
  if (!api) return call();
  return api.enterSpan("chat", (span) => {
    markIdentity(span, identity, "chat");
    if (span.isTraced) span.setAttribute("gen_ai.request.model", model);
    return call();
  });
}

/**
 * Wraps a tool run in a nested `execute_tool` span. When `approve` is given,
 * a `tool_approval` span wraps the gate decision before execution.
 */
export async function executeTool<T>(
  identity: AgentTurnIdentity,
  toolName: string,
  run: () => Promise<T>,
  approve?: () => boolean | Promise<boolean>,
): Promise<T> {
  const api = await tracingApi();
  const gated = async (): Promise<T> => {
    if (!approve) return run();
    let allowed: boolean;
    if (api) {
      allowed = await api.enterSpan("tool_approval", (span) => {
        markIdentity(span, identity, "tool_approval");
        if (span.isTraced) span.setAttribute("gen_ai.tool.name", toolName);
        return Promise.resolve(approve());
      });
    } else {
      allowed = await approve();
    }
    if (!allowed) throw new Error(`tool "${toolName}" rejected by approval gate`);
    return run();
  };
  if (!api) return gated();
  return api.enterSpan("execute_tool", (span) => {
    markIdentity(span, identity, "execute_tool");
    if (span.isTraced) span.setAttribute("gen_ai.tool.name", toolName);
    return gated();
  });
}

/** Generic application span for request-level or engine-level instrumentation. */
export async function withSpan<T>(
  name: string,
  attributes: Record<string, AttributeValue> | undefined,
  fn: () => Promise<T>,
): Promise<T> {
  const api = await tracingApi();
  if (!api) return fn();
  return api.enterSpan(name, (span) => {
    if (attributes && span.isTraced) {
      for (const [key, value] of Object.entries(attributes)) span.setAttribute(key, value);
    }
    return fn();
  });
}
