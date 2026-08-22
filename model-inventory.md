# RaidanOpencode Model Inventory

## Current OpenCode Model Configuration

### Primary Model
- **Model**: nemotron-3.5-lightning-free
- **Provider**: OpenCode built-in (nemotron family)
- **Version**: 3.5 (free, local-first capable)
- **Context window**: Configurable (default optimized for OpenCode operations)
- **Temperature**: 0.1 (deterministic for agent operations)
- **Mode**: primary (default agent execution model)

### Detected Models and Providers

| Model | Provider | Type | Context | Status |
|-------|----------|------|---------|--------|
| nemotron-3.5-lightning-free | OpenCode built-in | Free local | Optimized | Active |
| (none configured externally) | — | — | — | — |

### External Model/Provider Configuration
- **MCP servers**: 0 configured (see mcp-inventory.md)
- **API keys**: 0 stored in auth.json (see auth.json has 0 credentials)
- **Custom endpoints**: None detected
- **Provider aliases**: None configured

### OpenCode Model Settings (from opencode.jsonc)
```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": {},
  "mode": {},
  "plugin": [],
  "command": {},
  "username": "ecs-user"
}
```
No model-specific configuration in opencode.jsonc beyond the default.

### Model Routing (Current OpenCode Behavior)
- Single model usage: Whatever model is selected for the session
- No fallback chains
- No provider routing
- No cost-aware selection
- No latency-aware selection
- No context-window-aware selection

## RaidanOpencode Model Router Architecture

### Layer 8 — Model Router

#### Model Registry
- Central registry of all available models with metadata:
  - Model ID and name
  - Provider (OpenAI-compatible, Anthropic-compatible, Google-compatible, OpenRouter, local, Ollama, vLLM, LM Studio, custom endpoints)
  - Capabilities (coding, reasoning, research, vision, fast, premium, local)
  - Context window size (input tokens, output tokens)
  - Latency (average p50, p95, p99)
  - Cost per token (input, output, approximate)
  - Availability (last check, success rate, downtime)
  - Rate limits (requests per minute, tokens per minute)
  - Specializations (coding, reasoning, research, vision)
  - Hardware requirements (GPU, CPU, memory)
  - Software requirements (API version, compatibility flags)

#### Provider Registry
- OpenAI-compatible APIs (GPT-4, GPT-3.5, etc.)
- Anthropic-compatible APIs (Claude 3, Claude 2, etc.)
- Google-compatible APIs (Gemini 1.5, Gemini 1.0, etc.)
- OpenRouter (aggregated access to 100+ models)
- Local models (Ollama, vLLM, LM Studio, etc.)
- Custom endpoints (user-defined API URLs)
- **Never hard-code API keys**: Keys stored in environment variables or OS credential stores only

#### Capability Matching
- Model selection based on task requirements:
  - **Task type**: coding, reasoning, research, vision, fast, premium, local
  - **Agent role**: developer, researcher, architect, tester, reviewer, etc.
  - **Complexity**: L0 (trivial) → L1 (simple) → L2 (medium) → L3 (complex) → L4 (system-level)
  - **Context fit**: Model's context window vs task's context requirements
  - **Latency requirement**: Maximum acceptable response time
  - **Cost constraint**: Maximum acceptable cost per task
  - **Availability**: Model must be operational and reachable
  - **Historical success rate**: Past performance with similar tasks

#### Routing Score Formula
```
routing_score = quality × task_fit × context_fit × latency × cost × availability × historical_success_rate
```
- **quality**: Base model quality rating (1-10)
- **task_fit**: How well model matches task type (1-10)
- **context_fit**: Context window adequacy (1-10)
- **latency**: Inverse of response time (higher = faster, normalized 0-1)
- **cost**: Inverse of cost (lower cost = higher score, normalized 0-1)
- **availability**: Model uptime and reachability (0-1)
- **historical_success_rate**: Past success rate with this model on similar tasks (0-1)

**Never blindly choose the most powerful model**. The cheapest safe mode that satisfies the task is selected.

#### Fallback Chains
- **Primary model**: Selected by routing score
- **Secondary model**: Next-highest scoring model for same task type
- **Fallback model**: Different provider, same capability class
- **Emergency model**: Local/fast model as last resort
- **Human escalation**: If all models fail, human notification and intervention

Example fallback chain:
```
Primary: gpt-4o (premium, coding)
Secondary: gpt-4 (premium, coding)
Fallback: claude-3-opsonnet (reasoning, cost-effective)
Emergency: local-code-model (fast, no API cost, limited capabilities)
```

#### Dynamic Routing
- **Model scores tracked**: Each model's routing score updated after each call
- **Latency tracking**: p50, p95, p99 response times per model per provider
- **Error tracking**: Error types, frequencies, and contexts tracked per model
- **Cost tracking**: Input/output tokens and cost accumulated per model
- **Success rate tracking**: Per-model success rate updated after each task
- **Automatic re-routing**: If a model's score drops below threshold, automatically switch

#### Model Fallback Policy
```
Provider failure → retry → alternate model → alternate provider → human escalation
```
- **Retry**: Configurable attempt count (default 3), exponential backoff timeout
- **Alternate model**: Same provider, different model class
- **Alternate provider**: Different provider with same capability
- **Human escalation**: If all models/failovers exhausted, notify human for decision

#### Per-Agent Model Profiles
- Each agent can have a preferred model profile
- Profiles define: primary model, fallback model, cost limit, latency limit
- Profiles stored in agent registry (Layer 0)
- Dynamic routing can override profile based on task requirements
- **Per-agent profiles allow**: Different agents optimized for different task types

#### Model Statistics Tracking
- Tokens used per model per session
- Cost approximated per model per session
- Latency recorded per model call
- Success/failure per model
- Context window usage per model
- Rate limit triggers per model
- **Statistics used for**: Routing score updates, cost monitoring, capacity planning

### Model Inventory Summary

| Category | Count |
|----------|-------|
| Primary model | 1 (nemotron-3.5-lightning-free) |
| External models configured | 0 |
| Models in registry | 0 (populated dynamically) |
| Provider types supported | 6 (OpenAI, Anthropic, Google, OpenRouter, local, custom) |
| Fallback chain length | 4 (primary → secondary → fallback → emergency) |
| Per-agent profiles supported | Unlimited |
| Statistics tracked | 7 (tokens, cost, latency, success, failure, context, rate-limits) |

### Migration Plan for Models

#### Phase 0: Current State
- 1 primary model: nemotron-3.5-lightning-free
- 0 external models configured
- No fallback chains
- Single model per session

#### Phase 1: Import (Planned)
- Discover any externally configured models/providers
- Document current model preferences
- Create model inventory: docs/migration/model-inventory.md

#### Phase 2: Validate (Planned)
- Verify current model works with RaidanOpencode
- Test model router with primary model only
- Confirm no breaking changes

#### Phase 3: Enable (Planned)
- Configure fast model, reasoning model, coding model, review model, research model, fallback model, local model
- Set up capability-based routing
- Test fallback chains

#### Phase 4: Observe (Planned)
- Monitor model usage statistics
- Track cost and latency per model
- Observe fallback chain triggers

#### Phase 5: Optimize (Planned)
- Tune routing scores based on actual usage
- Balance cost vs quality per task type
- Configure per-agent model profiles

### Model Router Commands (Planned)
- `raidan model list` — List all configured/models in registry
- `raidan model test` — Test model connectivity and performance
- `raidan model health` — Check model health and statistics
- `raidan model route` — Show routing score for a task type
- `raidan model profile` — Set/get per-agent model profile

### Key Principles
1. **Model routing is multifactorial**: Never choose solely by power/capabilities
2. **Cost-aware**: Cheapest model that satisfies task requirements is preferred
3. **Latency-aware**: Fast models for trivial tasks, premium for complex
4. **Availability-aware**: Models with poor track record are avoided
5. **Fallback chains are deterministic**: Provider failure → retry → alternate model → alternate provider → human escalation
6. **Per-agent profiles**: Different agents can be optimized for different task types
7. **No hardcoded API keys**: Keys in environment variables/credential stores only
8. **Statistics drive routing**: Actual usage data updates routing scores

---
*Model inventory generated on 2026-08-23. Current primary model: nemotron-3.5-lightning-free. 0 external models configured. Model router adds multifactorial routing with fallback chains.*