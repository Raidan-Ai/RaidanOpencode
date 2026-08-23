#!/usr/bin/env node
import { Command } from "commander";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import { ConfigManager, resolveRefs } from "../core/config/manager.js";
import { EventBus } from "../core/events/bus.js";
import { AgentRegistry } from "../core/agents/registry.js";
import { TaskEngine } from "../core/tasks/engine.js";
import { SkillRegistry } from "../core/skills/registry.js";
import { PolicyEngine, type PolicyMode } from "../core/policies/engine.js";
import { ModelRouter, FAILOVER_TRIGGERS } from "../core/gateway/router.js";
import { McpRegistry } from "../core/mcp/registry.js";
import { MigrationEngine, inspectOpencode } from "../core/migrate/engine.js";

const VERSION = "0.3.0";
const HOME = homedir();
const OC_GLOBAL = join(HOME, ".config", "opencode");
const STATE_DIR = join(HOME, ".raidan");
const BACKUP_DIR = join(HOME, ".raidan-opencode-backups");

function statePaths() {
  mkdirSync(STATE_DIR, { recursive: true });
  return {
    ledger: join(STATE_DIR, "events.jsonl"),
    tasks: join(STATE_DIR, "tasks.json"),
  };
}

function opencodeDirs() {
  const agentsDir = join(OC_GLOBAL, "agents");
  if (!existsSync(agentsDir)) return [join(OC_GLOBAL, "agent")];
  return [agentsDir];
}

function skillsDirs() {
  return [
    { path: join(OC_GLOBAL, "skills"), scope: "global" as const },
    { path: join(process.cwd(), ".opencode", "skills"), scope: "project" as const },
  ];
}

function bus() {
  return new EventBus(statePaths().ledger);
}

type CheckRow = [string, string, string];

export function envChecks(): CheckRow[] {
  const rows: CheckRow[] = [];
  const check = (name: string, ok: boolean, note: string) =>
    rows.push([ok ? "PASS" : "WARN", name, note]);

  check("node", Number(process.versions.node.split(".")[0]) >= 20, `v${process.versions.node}`);
  try { execFileSync("git", ["--version"], { stdio: "pipe" }); check("git", true, ""); }
  catch { check("git", false, "not found"); }

  const cfgPath = join(OC_GLOBAL, "opencode.jsonc");
  const altPath = join(OC_GLOBAL, "opencode.json");
  const found = [cfgPath, altPath].find(existsSync);
  if (found) {
    check("opencode-config", true, found);
    try {
      JSON.parse(readFileSync(found, "utf8").replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, ""));
      check("opencode-config-parse", true, "");
    } catch { check("opencode-config-parse", false, "invalid JSON/C"); }
  } else check("opencode-config", false, "no opencode.json(c) in ~/.config/opencode");

  const sd = join(OC_GLOBAL, "skills");
  check("skills-dir", existsSync(sd), existsSync(sd) ? `${readdirSync(sd).length} skills` : "missing");
  return rows;
}

const program = new Command();
program.name("raidan").description("RaidanOpencode — AI Agent Engineering OS for OpenCode").version(VERSION);

program
  .command("doctor")
  .description("verify environment and report PASS/WARN/FAIL")
  .action(() => {
    for (const [status, name, note] of envChecks())
      console.log(`${status.padEnd(5)} ${name}${note ? ` — ${note}` : ""}`);
  });

program
  .command("status")
  .description("show canonical system status")
  .action(() => {
    const cfg = new ConfigManager({ global: join(OC_GLOBAL, "opencode.jsonc") }).load();
    const agents = new AgentRegistry(opencodeDirs()).list();
    const skills = new SkillRegistry(skillsDirs()).list();
    const tasks = new TaskEngine(statePaths().tasks).list();
    console.log(`RaidanOpencode ${VERSION}`);
    console.log(`policy mode : ${cfg.policies?.mode ?? "supervised"}`);
    console.log(`telemetry   : ${cfg.telemetry ?? "off"}`);
    console.log(`agents      : ${agents.length} loaded`);
    console.log(`skills      : ${skills.length} discovered`);
    console.log(`tasks       : ${tasks.length}`);
  });

const cfgCmd = program.command("config").description("configuration operations");
cfgCmd
  .command("show")
  .option("--layer <layer>", "global|project", "global")
  .action((opts) => {
    const p = opts.layer === "project"
      ? join(process.cwd(), "raidan.config.json")
      : join(OC_GLOBAL, "opencode.jsonc");
    const mgr = new ConfigManager({ global: p });
    console.log(JSON.stringify(mgr.redactSecrets(mgr.load()), null, 2));
  });

const agentCmd = program.command("agent").description("agent registry operations");
agentCmd.command("list").action(() => {
  const reg = new AgentRegistry(opencodeDirs());
  for (const a of reg.list())
    console.log(`${a.id.padEnd(28)} role=${(a.role ?? "-").padEnd(12)} model=${a.models.primary ?? "-"}`);
});
agentCmd
  .command("inspect")
  .argument("<id>")
  .action((id) => {
    const a = new AgentRegistry(opencodeDirs()).get(id);
    if (!a) { console.error(`agent not found: ${id}`); process.exitCode = 1; return; }
    console.log(JSON.stringify(a, null, 2));
  });

const taskCmd = program.command("task").description("task engine operations");
taskCmd
  .command("create")
  .argument("<title>")
  .option("--complexity <level>", "L0|L1|L2|L3|L4", "L1")
  .action((title, opts) => {
    const t = new TaskEngine(statePaths().tasks, bus()).create(title, { complexity: opts.complexity });
    console.log(`${t.id} [${t.state}] ${t.title}`);
  });
taskCmd
  .command("list")
  .argument("[state]", "filter by state")
  .action((state) => {
    const eng = new TaskEngine(statePaths().tasks);
    for (const t of eng.list(state as never))
      console.log(`${t.id.padEnd(16)} ${t.state.padEnd(10)} ${t.complexity} ${t.title}`);
  });

const skillCmd = program.command("skill").description("skill registry operations");
skillCmd.command("duplicates").action(() => {
  const dups = new SkillRegistry(skillsDirs()).findDuplicates();
  if (!dups.length) return console.log("no duplicates found");
  for (const d of dups) console.log(`${d.name}\n  ${d.locations.join("\n  ")}`);
});

const polCmd = program.command("policy").description("policy engine operations");
polCmd
  .command("check")
  .argument("<domain>")
  .argument("<action>")
  .option("--mode <mode>", "manual|supervised|balanced|autonomous")
  .action((domain, action, opts) => {
    const pe = new PolicyEngine(bus(), (opts.mode as PolicyMode) ?? undefined);
    const d = pe.evaluate(domain as never, action);
    console.log(`${d.verdict} (${domain}: ${d.action}) — ${d.reason}`);
  });

const modelCmd = program.command("model").description("model catalog + routing (ADR-008)");
modelCmd.command("list").action(() => {
  for (const m of ModelRouter.defaultCatalog())
    console.log(`${m.id.padEnd(34)} caps=[${m.capabilities.join(",")}] cost=${m.costTier} lat=${m.latencyClass}`);
});
modelCmd
  .command("route")
  .description("resolve a primary→fallback chain for a capability need")
  .option("--need <cap...>", "capabilities required", [])
  .option("--prefer <p>", "quality|cost|latency")
  .action((opts) => {
    const chain = ModelRouter.fromConfigFile(
      existsSync(join(process.cwd(), "raidan.config.json")) ? join(process.cwd(), "raidan.config.json") : undefined,
    ).route({ requires: opts.need, prefer: opts.prefer });
    const line = [chain.primary, chain.secondary, chain.fallback, chain.emergency]
      .filter(Boolean)
      .map((m) => (m as { id: string }).id)
      .join(" → ");
    console.log(line);
    console.log(chain.rationale);
    console.log(`failover triggers: ${FAILOVER_TRIGGERS.join(", ")} (never answer quality)`);
  });

const mcpCmd = program.command("mcp").description("MCP governance registry (read-only)");
mcpCmd.command("list").action(() => {
  const rows = new McpRegistry(OC_GLOBAL).list();
  if (!rows.length) return console.log("no MCP servers configured");
  for (const r of rows)
    console.log(`${r.name.padEnd(14)} ${r.transport.padEnd(6)} risk=${r.risk.padEnd(6)} auth=${r.authMode.padEnd(16)} ${r.target}${r.risks.length ? `\n${" ".repeat(15)}⚠ ${r.risks.join("; ")}` : ""}`);
});

const migCmd = program.command("migrate").description("migration engine operations");
migCmd
  .command("backup")
  .description("timestamped backup of OpenCode global config outside the repo")
  .action(() => {
    mkdirSync(BACKUP_DIR, { recursive: true });
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const src = [join(OC_GLOBAL, "opencode.jsonc"), join(OC_GLOBAL, "opencode.json")].find(existsSync);
    if (!src) { console.error("no opencode config found"); process.exitCode = 1; return; }
    const dest = join(BACKUP_DIR, `${src.split(/[\\/]/).pop()}.${ts}.bak`);
    writeFileSync(dest, readFileSync(src));
    console.log(`backed up -> ${dest}`);
  });
migCmd
  .command("inspect")
  .description("inventory the OpenCode global install")
  .action(() => console.log(JSON.stringify(inspectOpencode(OC_GLOBAL), null, 2)));
migCmd
  .command("plan")
  .description("dry-run: what apply would change (default posture)")
  .option("--source <dir>", "skills source dir", join(process.cwd(), "skills"))
  .action((opts) => {
    const steps = new MigrationEngine(join(STATE_DIR, "install-state.json"), join(OC_GLOBAL, "skills")).plan(opts.source);
    if (!steps.length) return console.log("nothing to install");
    for (const s of steps) console.log(`${s.reason?.startsWith("SKIP") ? "SKIP" : "COPY "} ${s.dest} — ${s.reason}`);
  });
migCmd
  .command("apply")
  .option("--source <dir>", "skills source dir", join(process.cwd(), "skills"))
  .action((opts) => {
    const eng = new MigrationEngine(join(STATE_DIR, "install-state.json"), join(OC_GLOBAL, "skills"));
    const { copied, skipped } = eng.apply(eng.plan(opts.source));
    console.log(`copied : ${copied.length}`); for (const c of copied) console.log(`  + ${c}`);
    console.log(`skipped: ${skipped.length}`); for (const s of skipped) console.log(`  = ${s}`);
  });
migCmd
  .command("rollback")
  .description("remove exactly what raidan installed (hash-verified)")
  .action(() => {
    const removed = new MigrationEngine(join(STATE_DIR, "install-state.json"), join(OC_GLOBAL, "skills")).rollback();
    console.log(`removed ${removed.length} file(s)`); for (const r of removed) console.log(`  - ${r}`);
  });

program
  .command("init")
  .description("setup wizard — headless quick mode (interactive phases land next release)")
  .option("--headless", "no prompts; safe defaults", true)
  .option("--install-skills", "also install raidan skills into OpenCode global dir", false)
  .action((opts) => {
    console.log("RaidanOpencode setup — quick/headless");
    let fails = 0;
    for (const [s, n] of envChecks()) if (s === "WARN") { fails++; console.log(`  ! ${n}`); }
    mkdirSync(STATE_DIR, { recursive: true });
    const projCfg = join(process.cwd(), "raidan.config.json");
    if (!existsSync(projCfg)) {
      writeFileSync(
        projCfg,
        JSON.stringify(
          {
            name: "raidan",
            policies: { mode: "supervised" },
            telemetry: "off",
            models: ModelRouter.defaultCatalog(),
          },
          null,
          2,
        ),
      );
      console.log(`wrote ${projCfg}`);
    } else console.log(`kept existing ${projCfg}`);
    if (opts.installSkills) {
      const eng = new MigrationEngine(join(STATE_DIR, "install-state.json"), join(OC_GLOBAL, "skills"));
      const { copied } = eng.apply(eng.plan(join(process.cwd(), "skills")));
      console.log(`installed skills: ${copied.length}`);
    }
    console.log(fails ? `validation warnings: ${fails} (run raidan doctor)` : "validation: clean");
    console.log("next: raidan doctor && raidan status");
  });

program.parseAsync(process.argv).catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});

export { resolveRefs };
