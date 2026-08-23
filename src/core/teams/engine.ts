import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import type { EventBus } from "../events/bus.js";

export interface TeamRecord {
  id: string;
  name: string;
  parentId?: string;
  leadAgentId?: string;
  memberAgentIds: string[];
  createdAt: string;
}

export interface DelegationCheck {
  ok: boolean;
  reason?: string;
  chain: string[];
}

let seq = 0;

export class TeamEngine {
  constructor(private storePath: string, private bus?: EventBus) {
    mkdirSync(dirname(storePath), { recursive: true });
    if (!existsSync(storePath)) writeFileSync(storePath, JSON.stringify([]));
  }

  private loadAll(): TeamRecord[] {
    return JSON.parse(readFileSync(this.storePath, "utf8")) as TeamRecord[];
  }

  private saveAll(teams: TeamRecord[]): void {
    const tmp = `${this.storePath}.tmp`;
    writeFileSync(tmp, JSON.stringify(teams, null, 2));
    renameSync(tmp, this.storePath);
  }

  create(name: string, opts: { id?: string; parentId?: string; leadAgentId?: string } = {}): TeamRecord {
    const all = this.loadAll();
    if (opts.parentId && !all.some((t) => t.id === opts.parentId))
      throw new Error(`parent team not found: ${opts.parentId}`);
    const team: TeamRecord = {
      id: opts.id ?? `TEAM-${Date.now().toString(36)}-${(seq++).toString(36)}`,
      name,
      parentId: opts.parentId,
      leadAgentId: opts.leadAgentId,
      memberAgentIds: [],
      createdAt: new Date().toISOString(),
    };
    all.push(team);
    this.saveAll(all);
    this.bus?.emit("agent.created", { kind: "team", name }, { runId: team.id });
    return team;
  }

  get(id: string): TeamRecord | undefined {
    return this.loadAll().find((t) => t.id === id);
  }

  list(): TeamRecord[] {
    return this.loadAll();
  }

  addMember(teamId: string, agentId: string): TeamRecord {
    const all = this.loadAll();
    const t = all.find((x) => x.id === teamId);
    if (!t) throw new Error(`team not found: ${teamId}`);
    if (!t.memberAgentIds.includes(agentId)) t.memberAgentIds.push(agentId);
    this.saveAll(all);
    return t;
  }

  removeMember(teamId: string, agentId: string): TeamRecord {
    const all = this.loadAll();
    const t = all.find((x) => x.id === teamId);
    if (!t) throw new Error(`team not found: ${teamId}`);
    t.memberAgentIds = t.memberAgentIds.filter((a) => a !== agentId);
    if (t.leadAgentId === agentId) t.leadAgentId = undefined;
    this.saveAll(all);
    return t;
  }

  setLead(teamId: string, agentId: string): TeamRecord {
    const all = this.loadAll();
    const t = all.find((x) => x.id === teamId);
    if (!t) throw new Error(`team not found: ${teamId}`);
    if (!t.memberAgentIds.includes(agentId))
      throw new Error(`lead must be a member first: add ${agentId} to ${teamId}`);
    t.leadAgentId = agentId;
    this.saveAll(all);
    return t;
  }

  pathToRoot(teamId: string): TeamRecord[] {
    const all = this.loadAll();
    const chain: TeamRecord[] = [];
    let cur = all.find((t) => t.id === teamId);
    const seen = new Set<string>();
    while (cur && !seen.has(cur.id)) {
      seen.add(cur.id);
      chain.push(cur);
      cur = cur.parentId ? all.find((t) => t.id === cur!.parentId) : undefined;
    }
    return chain;
  }

  roster(teamId?: string): Map<string, Set<string>> {
    const all = this.loadAll();
    const out = new Map<string, Set<string>>();
    for (const t of all) {
      if (teamId && !this.pathToRoot(t.id).some((x) => x.id === teamId)) continue;
      out.set(t.id, new Set(t.memberAgentIds));
    }
    return out;
  }

  escalationPath(teamId: string): Array<{ teamId: string; leadAgentId?: string }> {
    return this.pathToRoot(teamId)
      .filter((t) => t.leadAgentId)
      .map((t) => ({ teamId: t.id, leadAgentId: t.leadAgentId }));
  }

  checkDelegation(teamId: string, agentId: string): DelegationCheck {
    const t = this.get(teamId);
    if (!t) return { ok: false, reason: `team not found: ${teamId}`, chain: [] };
    const subtree = [...this.roster(teamId).values()].flatMap((s) => [...s]);
    const chain = this.pathToRoot(teamId).map((x) => x.id);
    if (!subtree.includes(agentId))
      return {
        ok: false,
        reason: `agent ${agentId} is not a member of ${teamId} or its subteams`,
        chain,
      };
    return { ok: true, chain };
  }
}
