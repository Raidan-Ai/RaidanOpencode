/**
 * Minimal Cloudflare Worker host for RaidanOpencode core engines.
 *
 * Read-only endpoints only, so the repository has a valid deployable entry
 * point with observability.traces enabled. No secrets are served.
 */
import { CAPABILITIES, ModelRouter, type Capability } from "../core/gateway/router.js";
import { withSpan } from "../core/observability/tracing.js";

const VERSION = "0.6.0";
const KNOWN_CAPABILITIES: ReadonlySet<string> = new Set(CAPABILITIES);
const ROUTER = new ModelRouter(ModelRouter.defaultCatalog());

function handleRoute(url: URL): Response {
  const requiresParam = url.searchParams.get("requires");
  const preferRaw = url.searchParams.get("prefer");
  const prefer =
    preferRaw === "quality" || preferRaw === "cost" || preferRaw === "latency"
      ? (preferRaw as "quality" | "cost" | "latency")
      : undefined;
  const requires = requiresParam
    ? requiresParam
        .split(",")
        .map((s) => s.trim())
        .filter((s): s is Capability => KNOWN_CAPABILITIES.has(s))
    : [];
  const chain = ROUTER.route({
    requires,
    ...(prefer ? { prefer } : {}),
  });
  return Response.json(chain);
}

export default {
  async fetch(request: Request): Promise<Response> {
    return withSpan(
      "raidan.request",
      { "url.path": new URL(request.url).pathname },
      async () => {
        const url = new URL(request.url);
        switch (url.pathname) {
          case "/health":
            return Response.json({ ok: true, version: VERSION });
          case "/v1/route":
            return handleRoute(url);
          default:
            return new Response("not found", { status: 404 });
        }
      },
    );
  },
};
