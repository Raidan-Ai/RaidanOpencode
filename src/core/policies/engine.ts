import type { EventBus } from "../events/bus.js";

export type PolicyDomain =
  | "filesystem"
  | "shell"
  | "network"
  | "git"
  | "deployment"
  | "secrets"
  | "external-communication"
  | "mcp"
  | "a2a"
  | "agent-delegation"
  | "model-usage"
  | "cost"
  | "resource-usage";

export type PolicyMode = "manual" | "supervised" | "balanced" | "autonomous";

export interface PolicyDecision {
  domain: PolicyDomain;
  action: string;
  verdict: "ALLOW" | "ASK" | "DENY";
  reason: string;
}

/** Domain risk classes drive mode-based defaults; explicit rules override later. */
const RISK: Record<PolicyDomain, 1 | 2 | 3> = {
  filesystem: 2,
  shell: 3,
  network: 3,
  git: 2,
  deployment: 3,
  secrets: 3,
  "external-communication": 3,
  mcp: 2,
  a2a: 3,
  "agent-delegation": 2,
  "model-usage": 1,
  cost: 1,
  "resource-usage": 1,
};

const MODE_MAX_AUTO_RISK: Record<PolicyMode, number> = {
  manual: 0,
  supervised: 1,
  balanced: 2,
  autonomous: 3,
};

export class PolicyEngine {
  private rules = new Map<string, "ALLOW" | "ASK" | "DENY">();

  constructor(
    private bus?: EventBus,
    private mode: PolicyMode = "supervised",
  ) {}

  setMode(mode: PolicyMode): void {
    this.mode = mode;
  }

  addRule(domain: PolicyDomain, actionPattern: string, verdict: "ALLOW" | "ASK" | "DENY"): void {
    this.rules.set(`${domain}:${actionPattern}`, verdict);
  }

  evaluate(domain: PolicyDomain, action: string): PolicyDecision {
    const ruleKey = `${domain}:${action}`;
    const exact = this.rules.get(ruleKey);
    if (exact)
      return this.finish(domain, action, exact, "explicit rule");

    if (/destructive|delete-all|force-push|rm -rf|format/i.test(action))
      return this.finish(domain, action, "DENY", "destructive pattern denied by default");

    const verdict: PolicyDecision["verdict"] =
      RISK[domain] <= MODE_MAX_AUTO_RISK[this.mode] ? "ALLOW" : "ASK";

    return this.finish(
      domain,
      action,
      verdict,
      `risk=${RISK[domain]} vs mode=${this.mode}`,
    );
  }

  private finish(
    domain: PolicyDomain,
    action: string,
    verdict: PolicyDecision["verdict"],
    reason: string,
  ): PolicyDecision {
    if (verdict === "ALLOW") return { domain, action, verdict, reason };
    // ASK/DENY always audited
    this.bus?.emit(verdict === "DENY" ? "approval.rejected" : "approval.requested", {
      domain,
      action,
      reason,
    });
    return { domain, action, verdict, reason };
  }
}
