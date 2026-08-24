import { execFile } from "node:child_process";
import type { EventBus } from "../events/bus.js";

export type NotifyLevel = "info" | "warning" | "approval" | "error" | "critical";

export const NOTIFY_LEVELS: readonly NotifyLevel[] = ["info", "warning", "approval", "error", "critical"];

const LEVEL_RANK: Record<NotifyLevel, number> = {
  info: 0,
  warning: 1,
  approval: 2,
  error: 3,
  critical: 4,
};

export interface NotifyMessage {
  level: NotifyLevel;
  title: string;
  body?: string;
}

export interface ChannelResult {
  channel: string;
  ok: boolean;
  error?: string;
}

export interface NotificationChannel {
  readonly name: string;
  readonly minLevel: NotifyLevel;
  send(msg: NotifyMessage): Promise<void>;
}

export class TerminalChannel implements NotificationChannel {
  readonly name = "terminal";
  constructor(
    readonly minLevel: NotifyLevel = "info",
    private sink: (line: string) => void = (l) => console.log(l),
  ) {}

  async send(msg: NotifyMessage): Promise<void> {
    const icon = { info: "[i]", warning: "[!]", approval: "[?]", error: "[x]", critical: "[!!]" }[msg.level];
    this.sink(`${icon} ${msg.title}${msg.body ? ` — ${msg.body}` : ""}`);
  }
}

export class WebhookChannel implements NotificationChannel {
  readonly name = "webhook";
  constructor(
    readonly minLevel: NotifyLevel,
    private url: string,
    private timeoutMs = 5000,
  ) {}

  async send(msg: NotifyMessage): Promise<void> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const res = await fetch(this.url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ source: "raidan-opencode", ...msg, ts: new Date().toISOString() }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`webhook responded ${res.status}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

export class DesktopChannel implements NotificationChannel {
  readonly name = "desktop";
  constructor(readonly minLevel: NotifyLevel = "warning") {}

  async send(msg: NotifyMessage): Promise<void> {
    const text = `RaidanOpencode: ${msg.title}`;
    if (process.platform === "win32") {
      await exec("powershell", [
        "-NoProfile",
        "-Command",
        `[System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')|Out-Null;` +
          `[System.Windows.Forms.MessageBox]::Show('${escape(text)}','RaidanOpencode')|Out-Null`,
      ]);
      return;
    }
    if (process.platform === "darwin") {
      await exec("osascript", ["-e", `display notification "${escape(text)}"`]);
      return;
    }
    if (process.platform === "linux") {
      await exec("notify-send", [text]);
      return;
    }
    throw new Error(`desktop notifications unsupported on ${process.platform}`);
  }
}

function escape(s: string): string {
  return s.replace(/'/g, "''").replace(/"/g, '\\"');
}

function exec(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { windowsHide: true }, (err) => (err ? reject(err) : resolve()));
  });
}

export interface NotificationEngineOptions {
  webhookUrl?: string;
  webhookMinLevel?: NotifyLevel;
  desktop?: boolean;
  desktopMinLevel?: NotifyLevel;
  terminalSink?: (line: string) => void;
}

export class NotificationEngine {
  private channels: NotificationChannel[] = [];

  constructor(opts: NotificationEngineOptions = {}, private bus?: EventBus) {
    this.channels.push(new TerminalChannel("info", opts.terminalSink));
    if (opts.webhookUrl)
      this.channels.push(new WebhookChannel(opts.webhookMinLevel ?? "warning", opts.webhookUrl));
    if (opts.desktop)
      this.channels.push(new DesktopChannel(opts.desktopMinLevel ?? "warning"));
  }

  channelsFor(level: NotifyLevel): NotificationChannel[] {
    return this.channels.filter((c) => LEVEL_RANK[level] >= LEVEL_RANK[c.minLevel]);
  }

  async send(msg: NotifyMessage): Promise<ChannelResult[]> {
    const results = await Promise.all(
      this.channelsFor(msg.level).map(async (c): Promise<ChannelResult> => {
        try {
          await c.send(msg);
          return { channel: c.name, ok: true };
        } catch (e) {
          return { channel: c.name, ok: false, error: e instanceof Error ? e.message : String(e) };
        }
      }),
    );
    this.bus?.emit("run.completed", { kind: "notify", title: msg.title, results });
    return results;
  }

  listChannels(): Array<{ name: string; minLevel: NotifyLevel }> {
    return this.channels.map((c) => ({ name: c.name, minLevel: c.minLevel }));
  }
}
