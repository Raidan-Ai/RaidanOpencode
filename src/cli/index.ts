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

const program = new Command();
program.name("raidan").description("RaidanOpencode — AI Agent Engineering OS for OpenCode").version(VERSION);

program
  .command("doctor")
  .description("verify environment and report PASS/WARN/FAIL")
  .action(() => {
    const rows: [string, string, string][] = [];
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

    for (const [status, name, note] of rows)
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

program.parseAsync(process.argv).catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exitCode = 1;
});

export { resolveRefs };
