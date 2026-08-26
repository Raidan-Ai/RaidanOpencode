# RaidanOpencode — Architecture Blueprint v1.0

**Document Type:** Architecture Blueprint  
**Version:** 1.0  
**Status:** Proposed / Engineering Baseline  
**Project:** RaidanOpencode  
**Repository:** https://github.com/Raidan-Ai/RaidanOpencode  
**Owner:** Raidan Ameen  
**Website:** https://raidan.bio/  
**GitHub:** https://github.com/Raidan-Ai  
**LinkedIn:** https://www.linkedin.com/in/raidan-ameen/  
**Hugging Face:** https://huggingface.co/RaidanPro  
**Yemen-JPT:** https://huggingface.co/Yemen-JPT  

---

## 1. Executive Summary

RaidanOpencode is a **vendor-neutral AI Agent Operating System for software engineering**.

It is not an OpenCode fork, not a swarm plugin, not a dashboard, and not a collection of unrelated agent repositories. It is a unified control plane and execution architecture that can coordinate multiple agent runtimes, models, skills, tools, workflows, memory systems, evaluation systems, and deployment targets through stable internal contracts.

The central architectural principle is:

```
                 User Intent
                     │
                     ▼
              Raidan Control Plane
                     │
                     ▼
         Capability Intelligence / Meta Router
                     │
                     ▼
           Raidan Agent Kernel (RAK)
                     │
                     ▼
           Unified Orchestration Kernel
                     │
           ┌─────────┼─────────┐
           ▼         ▼         ▼
         Tasks    Workflows   Swarms
           │         │         │
           └─────────┼─────────┘
                     ▼
               Agent Registry
                     │
           ┌─────────┼─────────┐
           ▼         ▼         ▼
        Skills     Tools      Policies
                     │
                     ▼
             Runtime Abstraction
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    OpenCode       Codex       Claude/Gemini/...
       │
       ▼
  Workspace / Worktree / Terminal
       │
       ▼
  Validation → Review → Approval → Delivery
       │
       ▼
  Event / Memory / Evaluation / Audit
```

OpenCode is a **first-class runtime adapter**, not the kernel.

The system is designed so that a new coding agent, model provider, memory backend, browser, CI service, Git provider, or deployment platform can be added as an adapter without rewriting the kernel.

---

## 2. Architecture Goals

### 2.1 Primary Goals

RaidanOpencode MUST:

1. Provide one coherent operating model for AI software engineering.
2. Remain vendor-neutral.
3. Keep the core platform independent from OpenCode and any other runtime.
4. Provide one canonical orchestration kernel.
5. Provide one canonical task engine.
6. Provide one capability model and registry.
7. Provide one logical memory model with pluggable providers.
8. Provide one session abstraction.
9. Provide one policy and approval system.
10. Provide one event-driven observability backbone.
11. Preserve and normalize the user's existing OpenCode configuration.
12. Preserve and normalize existing Skills, Agents, Commands, MCP, Plugins, Models, Providers and routing.
13. Support Windows, Linux and WSL as first-class environments.
14. Support OpenCode, Codex, Claude Code, Gemini CLI and future runtimes through adapters.
15. Provide interactive installation and migration.
16. Make source provenance and license compliance explicit.
17. Enable capability-driven agent and model routing.
18. Minimize context and token waste.
19. Support recovery, resumable tasks and bounded autonomy.
20. Provide Arabic and English documentation.

### 2.2 Non-Goals

RaidanOpencode MUST NOT become:

- a fork of OpenCode unless a narrowly-scoped core modification is proven necessary
- a collection of independent orchestrators
- multiple competing task engines
- multiple memory frameworks exposed as separate systems
- several independent dashboards
- a provider-specific platform
- a mandatory cloud service
- a Kubernetes-first platform
- an automatic destructive migration utility
- an uncontrolled autonomous agent swarm

---

## 3. Architectural Principles

### 3.1 Research Before Integration

Every external repository is treated as source material.

The workflow is:

```
Inspect
→ Understand
→ Extract primitives
→ Compare
→ Deduplicate
→ Evaluate
→ License review
→ Security review
→ Select
→ Reimplement / Adapt
→ Test
→ Attribute
```

The source tree must represent the Raidan architecture, not upstream repository boundaries.

### 3.2 One System, Many Adapters

The user experiences one system:

```
ONE CONTROL PLANE
ONE KERNEL
ONE ORCHESTRATOR
ONE TASK ENGINE
ONE CAPABILITY REGISTRY
ONE AGENT REGISTRY
ONE SESSION MANAGER
ONE MEMORY MODEL
ONE POLICY ENGINE
ONE EVENT KERNEL
ONE CLI
ONE SETUP WIZARD
ONE COMMAND CENTER
```

Adapters provide multiple implementations.

### 3.3 Capability-First Routing

Routing is based on required capabilities, not agent names.

```
Task
→ Required Capabilities
→ Candidate Agents
→ Candidate Skills/Tools
→ Model/Provider Selection
→ Runtime Selection
→ Policy Check
→ Execution
```

### 3.4 Minimum Sufficient Team

The system should use the smallest team that can reliably complete the task.

Typical defaults:

```
Simple:      1 agent
Moderate:    2–4 agents
Complex:     4–8 agents
Large:       dynamic scaling
```

### 3.5 Progressive Context

Context is loaded lazily.

```
Global
→ Organization
→ Project
→ Repository
→ Workspace
→ Task
→ Swarm
→ Agent
→ Session
→ Memory
```

Agents do not receive the entire project context by default.

### 3.6 Event-Driven Coordination

Subsystems communicate through contracts and events where possible rather than tight implementation coupling.

The Event Kernel is the backbone for:

- observability
- recovery
- notifications
- audit
- state transitions
- orchestration telemetry

### 3.7 Security by Default

Every agent action is constrained by:

- identity
- capability
- permissions
- policy
- trust level
- resource limits
- audit

### 3.8 Local-First

The core must work locally.

Optional cloud services are adapters.

No cloud service is mandatory for the core architecture.

---

## 4. System Context — C4 Level 1

### 4.1 People / Actors

#### Human Developer

Uses:

- CLI
- TUI
- Web Control Center
- OpenCode
- other supported agent runtime

Can:

- submit objectives
- inspect plans
- approve actions
- override routing
- review results
- inspect costs
- manage providers and Skills
- manage connectors
- operate deployments

#### Engineering Operator

Manages:

- runtime fleet
- agents
- Skills
- providers
- MCP
- policies
- deployments
- health
- updates

#### Agent Runtime

Examples:

- OpenCode
- Claude Code
- Codex
- Gemini CLI
- Aider
- Pi
- OpenClaw
- Hermes
- generic CLI runtime

#### External Providers

Examples:

- OpenAI
- Anthropic
- Gemini
- Bedrock
- NVIDIA NIM
- OpenRouter
- DeepSeek
- xAI
- Z.AI
- local runtimes
- custom OpenAI-compatible endpoints

#### External Services

Examples:

- GitHub
- GitLab
- Notion
- Google Drive
- Telegram
- Slack
- Discord
- Vercel
- Cloudflare
- AWS
- GCP
- Azure
- search providers

---

## 5. C4 Container Architecture

The primary containers are:

```
1. Control Plane
2. Raidan Agent Kernel
3. Orchestration Kernel
4. Agent/Skill/Tool Registry
5. Task & Workflow Engine
6. Session & Runtime Manager
7. AI Gateway
8. Context & Memory Engine
9. MCP/A2A/Connector Plane
10. Policy & Security Engine
11. Event & Observability Engine
12. Evaluation & Learning Engine
13. Artifact & Evidence Engine
14. CLI
15. TUI
16. Web Control Center
17. Setup/Migration/Doctor
18. Adapter SDK
19. Storage Provider
```

---

## 6. Control Plane

### Responsibility

The Control Plane is the operator-facing application layer above the kernel.

It owns:

- intent intake
- system configuration
- profile selection
- global/project configuration
- capability intelligence
- Meta Router
- routing visibility
- operator overrides
- administrative actions
- policy-aware control
- setup state
- migration state

### It MUST NOT own

- runtime-specific execution code
- business logic duplicated from the kernel
- UI-specific task state
- direct shell control bypassing policy

---

## 7. Raidan Agent Kernel (RAK)

### 7.1 Role

RAK is the platform-neutral core.

It defines contracts and domain primitives only.

### 7.2 Responsibilities

RAK owns:

- identities
- capabilities
- agents
- roles
- tasks
- workflows
- swarms
- policies
- approvals
- checkpoints
- events
- memory contracts
- message contracts
- runtime contracts
- execution contracts
- artifact contracts

### 7.3 Kernel Independence

RAK MUST NOT depend on:

- OpenCode
- Claude
- Codex
- Gemini
- tmux
- Docker
- Kubernetes
- PostgreSQL
- Redis
- a particular cloud provider
- a particular UI framework

Adapters may depend on those systems.

---

## 8. Domain Model

Canonical domain entities:

```
Organization
Project
Repository
Workspace
Worktree
Task
Workflow
Agent
AgentRole
Swarm
Skill
Tool
MCP
Runtime
Session
Execution
Artifact
Checkpoint
Memory
Message
Event
Review
Approval
Policy
Provider
Model
Budget
Capability
Evaluation
Connector
DeploymentTarget
ExecutionNode
DecisionTrace
PromptFragment
Plugin
```

Every entity has a stable identifier.

---

## 9. Capability System

### 9.1 Capability Registry

Capabilities are first-class objects.

Example:

```yaml
id: security-review
name: Security Review
description: Review code for security vulnerabilities
level: advanced
required_tools:
  - git
  - filesystem
required_skills:
  - ai-agent-security
supported_runtimes:
  - opencode
  - codex
  - claude
model_requirements:
  reasoning: high
risk_level: sensitive
cost_class: medium
confidence: 0.90
```

### 9.2 Capability Graph

Relationships:

```
Agent
  └── hasCapability → Capability

Skill
  └── enablesCapability → Capability

Tool
  └── supportsCapability → Capability

MCP
  └── exposesCapability → Capability

Runtime
  └── executesCapability → Capability

Model
  └── bestAtCapability → Capability

Provider
  └── supportsCapability → Capability
```

### 9.3 Why

The graph enables:

- capability discovery
- intelligent routing
- deduplication
- compatibility checking
- cost optimization
- model selection
- runtime selection
- failure-based routing

---

## 10. Meta Router

### Purpose

Answer:

> What is the cheapest, fastest, safest and most reliable way to accomplish this task?

### Inputs

- user intent
- task description
- project
- current resources
- available capabilities
- policies
- budget
- runtime availability
- model availability

### Outputs

```
workflow
roles
agents
skills
tools
MCP
runtime
model
provider
parallelization plan
workspace strategy
approval policy
budget
validation strategy
```

### Important Boundary

Meta Router is NOT a second orchestrator.

It creates a decision plan.

The Orchestration Kernel executes that plan and handles dynamic changes.

---

## 11. Multi-Objective Routing

Routing optimizes:

```
quality
reliability
cost
latency
risk
context efficiency
availability
```

Example configurable weights:

```
QUALITY      0.40
RELIABILITY  0.20
COST         0.15
LATENCY      0.10
RISK         0.10
CONTEXT      0.05
```

Weights are policy-configurable.

---

## 12. Deduplication Engine

Before creating:

- Agent
- Skill
- Workflow
- Plugin
- Command
- MCP integration
- Runtime adapter
- Connector

perform similarity and capability analysis.

Inputs:

```
purpose
capability
inputs
outputs
tools
triggers
keywords
scope
implementation
dependencies
```

Possible result:

```
REUSE
EXTEND
MERGE
SPECIALIZE
CREATE
```

This is a core governance capability, not merely a documentation tool.

---

## 13. Agent Model

### 13.1 Agent Profile

```yaml
agent_id:
name:
role:
description:
capabilities:
skills:
tools:
mcps:
permissions:
model_policy:
runtime_policy:
memory_namespace:
autonomy_level:
budget:
constraints:
health_policy:
evaluation_policy:
workspace_policy:
```

### 13.2 Role vs Implementation

Separate:

```
Role = reviewer
Implementation = OpenCode reviewer / Codex reviewer / Claude reviewer
```

The orchestrator selects role first, implementation second.

### 13.3 Agent Contract

Every Agent exposes:

```
INPUTS
OUTPUTS
CAPABILITIES
TOOLS
RESTRICTIONS
SUCCESS CRITERIA
FAILURE CONDITIONS
ESCALATION POLICY
```

Internal results must be structured.

Example:

```json
{
  "status": "completed",
  "artifacts": [],
  "findings": [],
  "tests": [],
  "risks": [],
  "recommended_next_steps": []
}
```

---

## 14. Agent Engineering Skill System

### 14.1 Skill Tree

The canonical taxonomy includes:

#### Foundation
- agent architecture
- agent design
- agent patterns
- lifecycle
- state
- reliability

#### Agents
- orchestration
- multi-agent systems
- agentic workflows
- routing
- delegation
- handoffs
- planning
- workers
- supervisors
- swarms
- autonomous agents
- background agents
- long-running agents
- human-in-the-loop
- permissions

#### Tools
- tool use
- tool calling
- structured output
- tool design
- tool permissions
- tool reliability

#### Memory
- memory engineering
- short-term
- long-term
- episodic
- semantic
- procedural
- retrieval

#### Protocols
- MCP
- MCP engineering
- MCP security
- A2A
- A2A agent cards
- A2A tasks
- A2A streaming
- agent discovery
- interoperability
- ACP
- OpenAI-compatible APIs

#### Gateway
- AI gateway
- model routing
- provider routing
- semantic routing
- fallback
- failover
- load balancing
- retry
- circuit breakers
- rate limiting
- quotas
- budgeting
- token accounting
- cost tracking
- health
- streaming
- model cascading

#### RAG
- embeddings
- RAG
- agentic RAG
- graph RAG
- multimodal RAG
- hybrid search
- BM25
- reranking
- contextual retrieval
- ingestion
- chunking
- metadata filtering
- retrieval evaluation
- knowledge graphs
- vector databases

#### Security
- prompt injection
- indirect injection
- tool poisoning
- MCP security
- A2A security
- authentication
- authorization
- capability security
- secrets
- sandboxing
- isolation
- SSRF
- data exfiltration
- input/output validation
- policy enforcement
- PII
- audit
- AI governance
- model supply chain
- dependency security

#### Evaluation
- LLM evaluation
- agent evaluation
- task evaluation
- trajectory evaluation
- tool-call evaluation
- RAG evaluation
- hallucination
- groundedness
- faithfulness
- regression
- golden datasets
- synthetic evaluation
- benchmarking
- model comparison
- prompt evaluation
- production evaluation

#### Observability
- LLM observability
- agent tracing
- distributed tracing
- OpenTelemetry
- token metrics
- latency metrics
- cost metrics
- tool metrics
- failure analysis
- run replay
- prompt/response logging
- evaluation traces
- production monitoring

#### Production
- deployment
- scaling
- reliability
- disaster recovery
- monitoring
- secrets
- governance

### 14.2 Physical Skill Rule

The taxonomy does not require hundreds of physical Skills.

A physical Skill exists only if it is a reusable operational capability.

Examples:

- model-routing
- mcp-engineering
- a2a-engineering
- agent-architecture
- agent-orchestration
- ai-agent-security
- agent-evaluation
- agent-observability

---

## 15. Skill Registry

Each Skill stores:

```
name
version
capabilities
triggers
dependencies
permissions
MCP dependencies
platform
license
author
source
quality score
usage statistics
```

Required package structure:

```
skill/
├── SKILL.md
├── manifest.json
├── references/
├── scripts/
├── examples/
└── tests/
```

---

## 16. Prompt Architecture

### 16.1 Prompt Fragment Registry

Reusable fragments:

```
security
git
testing
review
research
citation
coding
architecture
deployment
documentation
```

### 16.2 Prompt Compiler

The final prompt is compiled from:

```
Base Policy
+
Role
+
Agent Profile
+
Task
+
Skills
+
Context
+
Runtime
+
Security Policy
+
Success Criteria
+
Workspace Policy
```

### 16.3 Prompt Validation

Check:

- conflicts
- duplicate directives
- missing policies
- excessive context
- unsafe permissions
- tool mismatch

---

## 17. Orchestration Kernel

### Responsibilities

- planning
- decomposition
- delegation
- workflow execution
- scheduling
- parallelization
- handoffs
- recovery
- validation
- approval
- completion

There is exactly one Orchestration Kernel.

---

## 18. Task Engine

The Task Engine is the canonical execution state machine.

Support:

```
Goal
Epic
Task
Subtask
Dependency
DAG
Kanban view
Priority
Deadline
Budget
Lock
Claim
Lease
Retry
Checkpoint
Review
Approval
Artifact
Result
```

Kanban is a view over the same underlying task state.

---

## 19. Task Lease System

Each worker receives:

```
task_id
agent_id
session_id
lease_start
lease_expiry
heartbeat
```

Failure behavior:

```
worker death
→ lease expiry
→ READY / RECOVERY
→ retry / reassign / escalate
```

This prevents duplicate execution.

---

## 20. Workflow Engine

Built-in reusable workflows:

```
feature-development
bug-fix
security-review
research
refactor
release
incident-response
documentation
migration
```

Each workflow contains:

```
stages
agents/roles
Skills
policies
approval gates
retry logic
outputs
```

---

## 21. Workflow Compiler

Input:

```
High-Level Objective
```

Output:

```
Workflow Graph
```

The system should generate DAGs automatically for normal work.

---

## 22. Swarm Engine

The Swarm Engine is implemented inside the Orchestration Kernel.

It provides:

- minimum sufficient team
- dynamic scaling
- parallel execution
- supervisor-worker patterns
- planner-executor patterns
- hierarchical teams
- speculative execution
- agent competition where justified

Swarm size is policy-driven.

---

## 23. Parallelization Engine

For every workflow determine:

```
what can run in parallel
what must remain sequential
what shares state
what needs isolated worktrees
what needs approval
```

Use DAG analysis.

---

## 24. Session Manager

One canonical Session Manager.

Capabilities:

```
fleet
search
groups
fork
archive
resume
attach
status
cost
tokens
runtime
workspace
worktree
transcript
notifications
health
watchdog
```

It must not contain orchestration business logic.

---

## 25. Conductor

Conductor is a role.

Responsibilities:

- watches fleet
- receives events
- nudges agents
- escalates failures
- resumes work
- summarizes progress

It reports to the Orchestrator.

It does not become a second global brain.

---

## 26. Runtime Abstraction

Define:

```
RuntimeAdapter
```

Methods:

```
discover
install
validate
spawn
attach
detach
send
receive
pause
resume
stop
restart
inspect
health
logs
destroy
```

---

## 27. Runtime Matrix

### First-Class

- OpenCode
- Codex
- Claude Code
- Gemini CLI

### Optional / Future

- Aider
- Pi
- OpenClaw
- Hermes
- custom CLI agents

---

## 28. OpenCode Adapter

Responsibilities:

```
agents
skills
commands
plugins
MCP
configuration
sessions
models
routing
permissions
instructions
```

The adapter must translate between OpenCode concepts and Raidan contracts.

It must not leak OpenCode assumptions into RAK.

---

## 29. RAAP — Raidan Agent Adapter Protocol

Define a transport-neutral adapter protocol for runtimes.

A new runtime should be addable without changing:

- Kernel
- Task Engine
- Orchestrator
- Memory
- Messaging
- Policy
- UI

---

## 30. Workspace Layer

The Workspace Manager provides:

```
shared workspace
isolated workspace
worktree
branch
artifact workspace
```

Worktree policy:

```
simple task → shared
parallel code → isolated worktree
high-risk → isolated worktree + approval
```

---

## 31. Terminal Abstraction

Define:

```
TerminalAdapter
```

Backends:

- native PTY
- PowerShell
- Windows Terminal
- WSL
- tmux (optional)
- remote terminal

---

## 32. Process Supervisor

One Process Supervisor only.

Functions:

```
start
stop
restart
signal
monitor
resources
logs
health
```

Use OS-native implementations behind PlatformAdapter.

---

## 33. Cross-Platform Layer

First-class:

```
Windows
Linux
WSL
```

Feasible:

```
macOS
```

Platform-specific implementations live behind:

```
PlatformAdapter
```

---

## 34. AI Gateway

The AI Gateway is the model/provider access abstraction.

Flow:

```
Agent
→ Meta Router
→ AI Gateway
→ Capability Matching
→ Model Router
→ Provider Router
→ Provider
→ Model
```

---

## 35. Model Capability Registry

Each model is described by:

```
reasoning
coding
vision
audio
context
latency
cost
tool use
structured output
availability
```

---

## 36. Provider Layer

Supported examples:

### Cloud

- OpenAI
- Azure OpenAI
- Anthropic
- Google Gemini
- AWS Bedrock
- NVIDIA NIM
- Mistral
- Cohere
- Groq
- Together AI
- Fireworks AI
- Perplexity
- OpenRouter
- DeepSeek
- xAI
- Z.AI
- Moonshot
- SambaNova
- Cerebras
- MiniMax
- CometAPI
- other OpenAI-compatible endpoints

### Local

- llama.cpp
- Ollama
- LM Studio
- LocalAI
- KoboldCPP
- Text Generation Web UI
- Docker Model Runner
- Microsoft Foundry Local
- oMLX
- Lemonade
- AnythingLLM

Provider-specific capabilities should be modeled as adapters/reference data rather than unnecessary physical Skills.

---

## 37. Model Failover

Model routing supports:

```
primary
secondary
fallback
emergency
```

Failover only occurs due to explicit conditions:

- timeout
- provider unavailable
- rate limit
- capacity failure
- policy rule

---

## 38. Cost Engine

Track:

```
input tokens
output tokens
cached tokens
reasoning tokens
runtime time
model
provider
task
agent
swarm
```

Budgets:

```
task
swarm
project
organization
```

---

## 39. Resource Manager

Track:

```
CPU
RAM
disk
GPU
process count
runtime count
```

Use resource limits to control concurrency.

---

## 40. Context Engine

Context sources:

```
system
organization
project
repository
workspace
task
swarm
agent
session
skills
tools
memory
external docs
runtime instructions
```

Context must be progressive and relevance-ranked.

---

## 41. Context Budget

Every delegation defines:

```
maximum_context_tokens
required_context
optional_context
excluded_context
```

Use Minimal Viable Information.

---

## 42. Memory Engine

Logical memory hierarchy:

```
L0 Working
L1 Session
L2 Task
L3 Project
L4 Agent
L5 Swarm
L6 Organization
L7 Long-Term Knowledge
```

Providers:

```
filesystem
SQLite
PostgreSQL
vector store
document store
graph backend
```

---

## 43. Memory Provenance

Every persistent memory record requires:

```
source
creator
task
timestamp
confidence
validation status
scope
expiration
```

Unverified information must not silently become trusted long-term memory.

---

## 44. MCP Registry

One MCP Registry.

Tracks:

```
servers
tools
resources
prompts
permissions
authentication
health
risk
provenance
```

Use OpenCode-native MCP support whenever possible.

---

## 45. A2A Layer

A2A provides external agent interoperability.

Support:

```
agent discovery
agent cards
capabilities
tasks
messages
artifacts
streaming
long-running tasks
authentication
authorization
delegation
handoffs
```

Internal Raidan messaging remains its own domain contract.

---

## 46. Connector Registry

Optional external service connectors:

```
Google Drive
Google Docs
Google Sheets
Notion
Slack
Discord
Telegram
GitHub
GitLab
Linear
Jira
Trello
Dropbox
OneDrive
S3
Cloudflare
Vercel
Netlify
AWS
GCP
Azure
```

Connector discovery is part of the setup wizard.

Use least-privilege authentication.

---

## 47. Search Layer

Provider abstraction for:

```
Tavily
Exa
Brave
Serper
Google
Bing-compatible
SearXNG
self-hosted search
native search capabilities
```

Multiple providers may be configured for fallback.

---

## 48. RAG Layer

Canonical flow:

```
Documents
→ Ingestion
→ Parsing
→ Chunking
→ Metadata
→ Embedding
→ Vector Storage
→ Retrieval
→ Hybrid Search
→ Reranking
→ Context Assembly
→ Agent
→ Evaluation
```

---

## 49. Vector Layer

Adapters:

```
LanceDB
PGVector
Qdrant
Milvus
Weaviate
Chroma
Pinecone
Astra DB
Zilliz
```

No single provider is mandatory.

---

## 50. Security Architecture

### 50.1 Policy Domains

```
filesystem
network
shell
git
tools
MCP
A2A
runtime
credentials
deployment
model usage
cost
resource usage
agent delegation
```

### 50.2 Trust Levels

```
SAFE
CONTROLLED
SENSITIVE
DANGEROUS
```

### 50.3 Threat Model

```
Prompt Injection
Indirect Prompt Injection
Tool Poisoning
Malicious MCP
Malicious Agent Cards
SSRF
Privilege Escalation
Credential Theft
Data Exfiltration
Supply Chain Attacks
Dependency Attacks
Path Traversal
Unsafe Shell
Secret Leakage
```

---

## 51. Human Gates

Approval required for:

```
destructive operations
production deployment
credential changes
external publication
production database changes
security policy changes
high-cost execution
large-scale autonomous modifications
```

---

## 52. Autonomy Levels

Per-task autonomy:

```
L0
L1
L2
L3
L4
L5
```

Policy determines allowed behavior at each level.

---

## 53. Audit

Every privileged action records:

```
who
what
why
task
agent
runtime
resource
timestamp
decision
result
```

---

## 54. Event Kernel

Events include:

```
task.created
task.assigned
task.started
task.blocked
task.completed

agent.spawned
agent.failed
agent.restarted

session.started
session.failed

runtime.failed

review.requested
review.completed

approval.requested
approval.granted
approval.denied

ci.failed
ci.passed

merge.conflict

memory.promoted
memory.invalidated

model.failed
model.switched

context.loaded
context.compacted
```

The Event Kernel feeds:

- observability
- notifications
- recovery
- auditing
- evaluation
- learning

---

## 55. Observability

Track:

```
run_id
parent_run_id
task_id
agent_id
team/swarm_id
runtime_id
model_id
provider_id
timestamp
status
```

Detailed telemetry:

```
prompt
tool calls
tool arguments
tool results
tokens
latency
cost
errors
retries
handoffs
approvals
context size
resources
evaluation
```

Never log secrets.

---

## 56. Evaluation Engine

Metrics:

```
success_rate
quality
latency
cost
```

---

## 57. Security Scanning

Before every commit/release:

```
secret scan
dependency scan
license scan
code scan
```

---

## 58. CI

CI must perform:

```
lint
test
typecheck
build
secret scan
license scan
documentation validation
installer checks
cross-platform checks
```

---

## 59. Test Strategy

Four levels:

```
unit
integration
contract
end-to-end
```

Mandatory contract tests for:

```
RuntimeAdapter
SkillProvider
ToolProvider
MCPProvider
MemoryProvider
StorageProvider
ModelProvider
ConnectorProvider
```

---

## 60. E2E Test

Verify:

```
User Request
→ Meta Router
→ Orchestrator
→ Router
→ Swarm
→ Agent
→ Runtime
→ Worktree
→ Test
→ Review
→ Approval
→ Merge
→ Memory
→ Event Log
```

---

## 61. Simulation

Create simulation mode.

Simulate:

```
10 agents
50 agents
100 agents
```

without launching them.

Simulate:

```
latency
failure
retries
budget
dependencies
provider outage
resource limits
```

---

## 62. Chaos Testing

Test:

```
runtime failure
provider outage
task duplication
message loss
lease expiration
worktree conflict
process death
machine restart
```

---

## 63. Stress Testing

Measure:

```
latency
CPU
RAM
tokens
cost
event throughput
message throughput
```

---

## 64. Recovery Testing

Kill:

```
agent
runtime
orchestrator
provider connection
```

Then verify:

```
state recovery
lease handling
task recovery
artifact integrity
audit continuity
```

---

## 65. Migration Testing

Test migration from:

```
plain OpenCode
OpenAgentsControl
OpenCode Swarm
Agent Deck
mixed configurations
```

Detect conflicts.

Never silently overwrite.

---

## 66. Benchmark Suite

Benchmarks:

```
simple coding
multi-file coding
refactor
bug fixing
security review
research
documentation
DevOps
Git
agent orchestration
RAG
evaluation
```

Measure:

```
success
time
tokens
cost
review defects
recovery
```

---

## 67. Agent Competition

Allow:

```
OpenCode implementation
vs
Codex implementation
vs
Claude implementation
vs
Gemini implementation
```

Evaluator selects the best result based on policy.

---

## 68. Speculative Execution

For difficult/high-value tasks:

```
run strategy A
run strategy B
compare
review
select
```

Only when expected value exceeds cost.

---

## 69. Failure-Based Routing

If an agent repeatedly fails a task class:

```
reduce routing score
```

Do not permanently disable automatically.

Use statistical decay and confidence.

---

## 70. Architecture Auditor

Create an internal:

```
# Architecture Auditor
```

Continuously inspect:

```
duplication
coupling
complexity
security
dependency growth
vendor lock-in
```

---

## 71. Design Review Gate

No major architecture change can merge without:

```
Architecture Review
```

---

## 72. Feature Selection Engine

Before adding a feature:

```
value
overlap
complexity
maintenance
license
security
compatibility
```

Below threshold:

```
REJECT
```

---

## 73. Dependency Budget

For every dependency ask:

```
Does it replace custom complexity?
Does it create vendor lock-in?
Does it duplicate an existing module?
Does it create maintenance burden?
Is its license compatible?
```

Prefer lightweight dependencies.

---

## 74. Package Boundaries

Use logical modules:

```
core
domain
orchestrator
capabilities
agents
skills
tools
mcp
tasks
workflows
sessions
runtime
workspaces
worktrees
memory
messaging
events
policy
security
evaluation
artifacts
research
providers
models
connectors
deployment
plugins
sdk
adapters
  ├── opencode/
  ├── claude/
  ├── codex/
  ├── gemini/
  ├── openclaw/
  ├── hermes/
  └── generic/
sdk
cli
tui
web
installer
  ├── linux/
  ├── windows/
  ├── wsl/
  └── macos/
config
profiles
examples
benchmarks
simulations
tests
docs
  ├── ar/
  ├── en/
  ├── architecture/
  ├── sources/
  ├── legal/
  ├── guides/
  ├── prompts/
  └── generated/
.github
.env.example
sources.lock.json
agent-engineering-manifest.yaml
LICENSE
NOTICE
THIRD_PARTY_NOTICES.md
README.md
README.ar.md
ARCHITECTURE.md
SECURITY.md
CONTRIBUTING.md
ROADMAP.md
CHANGELOG.md
```

Do not force the exact structure if the selected language/framework requires a better structure.

---

## 75. Documentation

Create:

```
README.md
README.ar.md
ARCHITECTURE.md
SECURITY.md
CONTRIBUTING.md
ROADMAP.md
CHANGELOG.md
```

Also:

```
docs/ar/
docs/en/
docs/architecture/
docs/sources/
docs/legal/
docs/guides/
docs/prompts/
docs/generated/
```

---

## 76. Architecture Documentation

Create:

```
00-overview.md
01-kernel.md
02-domain-model.md
03-capabilities.md
04-agents.md
05-swarms.md
06-task-engine.md
07-session-engine.md
08-runtime-engine.md
09-worktrees.md
10-memory.md
11-messaging.md
12-policy.md
13-security.md
14-events.md
15-routing.md
16-evaluation.md
17-installation.md
18-distribution.md
19-compatibility.md
20-extension-sdk.md
21-setup-wizard.md
22-connectors.md
23-gateway.md
24-rag.md
25-observability.md
```

---

## 77. Arabic Documentation

Arabic docs must explain:

```
الفكرة
المعمارية
Kernel
المحرك
الوكلاء
الأدوار
القدرات
الأسراب
المهارات
الذاكرة
الرسائل
المهام
الجلسات
Runtime
Worktrees
الأمن
السياسات
التقييم
المراقبة
التوجيه
التثبيت
Wizard
الهجرة
التحديث
التراجع
Plugins
SDK
المصادر
التراخيص
```

Use technical English terminology in parentheses where helpful.

---

## 78. Prompt Documentation

Create installation prompts for:

```
OpenCode
Claude Code
Codex
Gemini CLI
OpenClaw
Hermes
Generic AI Agent
```

---

## 79. Generated State Documentation

Create:

```
docs/generated/
```

Generate:

```
installed-agents.md
installed-skills.md
installed-mcp.md
installed-a2a.md
installed-models.md
installed-providers.md
installed-connectors.md
installed-runtimes.md
installed-config.md
```

Never include secrets.

---

## 80. Roadmap

Phases:

```
Phase 1  Kernel
Phase 2  OpenCode Adapter
Phase 3  Agents / Skills
Phase 4  Tasks / Swarms
Phase 5  Runtime / Sessions
Phase 6  Memory / Messaging
Phase 7  Security / Policy
Phase 8  Evaluation / Learning
Phase 9  Cross-Agent Adapters
Phase 10 Distributed Execution
Phase 11 Advanced UI
Phase 12 Ecosystem / SDK
```

---

## 81. Feature Maturity

Every feature has:

```
EXPERIMENTAL
BETA
STABLE
DEPRECATED
```

Use feature flags for experimental systems.

---

## 82. Release Model

Channels:

```
stable
beta
nightly
```

Build:

```
Linux
Windows
WSL-compatible
optional macOS
```

Provide SHA256 checksums.

---

## 83. Update Engine

Update independently where possible:

```
core
adapters
Skills
plugins
providers
```

Do not force a complete reinstall for every update.

---

## 84. Health Engine

One Doctor subsystem.

Command:

```
raidan doctor
```

Check:

```
core
OpenCode
runtime
agents
Skills
MCP
A2A
providers
models
storage
security
filesystem
network
Git
worktrees
connectors
deployment
```

---

## 85. Source Display

Implement:

```
raidan sources
```

Display:

```
source
license
version
commit
components
attributes
integration status
```

---

## 86. Export / Import

Implement:

```
raidan export
raidan import
```

All reproducible state should be exportable except external secrets.

---

## 87. Reproducible Builds

Pin important dependencies.

Record:

```
versions
commit SHAs
checksums
```

Use lockfiles.

CI must validate reproducibility where practical.

---

## 88. GitHub

Target:

```
https://github.com/Raidan-Ai/RaidanOpencode.git
```

Before bootstrap:

```
inspect repository
inspect branch
inspect files
inspect remote
inspect permissions
```

Never destroy history.

---

## 89. Git Workflow

Use:

```
main
develop
feature/*
research/*
release/*
```

Logical commits such as:

```
feat(kernel): establish Raidan Agent Kernel
feat(capabilities): add capability graph
feat(orchestrator): add meta router
feat(tasks): add task leases
feat(runtime): add runtime adapter SDK
feat(opencode): add OpenCode adapter
feat(skills): add skill registry
feat(prompt): add prompt compiler
feat(gateway): add model routing
feat(setup): add interactive setup wizard
feat(migration): add safe OpenCode migration
feat(security): add policy engine
feat(evaluation): add evaluator
docs: add Arabic architecture documentation
docs: add source attribution
ci: add Windows and Linux validation
```

---

## 90. GitHub Actions

At minimum:

```
Linux
Windows
```

CI:

```
install
build
lint
typecheck
unit tests
integration tests
contract tests
CLI smoke
doctor
migration
rollback
secret scan
license scan
documentation validation
```

---

## 91. Definition of Done

Do not declare the project complete because the repository exists.

Complete only when:

```
[ ] All source repositories analyzed
[ ] GitHub skill ecosystem researched
[ ] Additional gaps analyzed
[ ] Capability matrix created
[ ] Deduplication engine implemented
[ ] License compatibility verified
[ ] Sources pinned
[ ] Raidan Agent Kernel implemented
[ ] Domain model implemented
[ ] Capability Graph implemented
[ ] Capability Registry implemented
[ ] Meta Router implemented
[ ] Agent Registry implemented
[ ] Skill Registry implemented
[ ] Prompt Compiler implemented
[ ] Task Engine implemented
[ ] Task Leases implemented
[ ] Workflow Engine implemented
[ ] Swarm Engine implemented
[ ] Session Manager implemented
[ ] Runtime abstraction implemented
[ ] RAAP implemented
[ ] OpenCode adapter implemented
[ ] Cross-agent adapters implemented where practical
[ ] Worktree Manager implemented
[ ] MCP Registry implemented
[ ] A2A layer implemented
[ ] Memory implemented
[ ] Messaging implemented
[ ] Event Kernel implemented
[ ] Policy Engine implemented
[ ] Approval Engine implemented
[ ] Review Engine implemented
[ ] Evaluation Engine implemented
[ ] Benchmark suite implemented
[ ] Recovery implemented
[ ] Watchdog implemented
[ ] Cost Engine implemented
[ ] Resource Manager implemented
[ ] Artifact Manager implemented
[ ] Evidence system implemented
[ ] Research Engine implemented
[ ] Git abstraction implemented
[ ] GitHub abstraction implemented
[ ] Search providers supported
[ ] Connector Registry implemented
[ ] Deployment Registry implemented
[ ] Setup Wizard implemented
[ ] Installer implemented
[ ] Migration implemented
[ ] Backup implemented
[ ] Rollback implemented
[ ] Doctor implemented
[ ] Update implemented
[ ] Restore implemented
[ ] CLI implemented
[ ] TUI implemented or staged
[ ] Web control plane implemented or staged
[ ] Linux support verified
[ ] Windows support verified
[ ] WSL verified
[ ] Arabic documentation complete
[ ] English documentation complete
[ ] Source acknowledgements complete
[ ] Legal audit complete
[ ] Security scan passes
[ ] Tests pass
[ ] Stress tests pass
[ ] Chaos tests pass
[ ] Recovery tests pass
[ ] Installation tests pass
[ ] Existing OpenCode configuration migrated safely
[ ] Existing Skills preserved and normalized
[ ] No duplicate orchestrators
[ ] No duplicate task engines
[ ] No duplicate memory systems
[ ] No duplicate session managers
[ ] No duplicate capability registries
[ ] No duplicate prompt policies
[ ] No uncontrolled agent spawning
[ ] No secrets committed
[ ] Repository pushed
[ ] Release artifacts generated
```

---

## 92. Final Architecture Audit

Have the Architecture Auditor answer:

```
1. Is there exactly ONE control plane?
2. Is there exactly ONE task model?
3. Is there exactly ONE capability registry?
4. Is there exactly ONE memory abstraction?
5. Is there exactly ONE session abstraction?
6. Is there exactly ONE runtime abstraction?
7. Is there exactly ONE security policy engine?
8. Is there exactly ONE routing engine?
9. Are vendors adapters?
10. Can OpenCode be replaced without rebuilding the Kernel?
11. Can a new agent be added without changing the Kernel?
12. Can a new model provider be added without modifying the Orchestrator?
13. Can a new Skill be added without modifying the Agent?
14. Can a new Workflow be added without modifying Core?
15. Can the environment be reproduced from the repository?
16. Is the system simpler than the source ecosystem?
17. Is every major decision explainable?
18. Is every privileged action auditable?
19. Can the whole environment be backed up and restored?
20. Can the user uninstall it without losing their original OpenCode setup?
```

If any answer is NO:

```
# REFACTOR
```

---

## 93. Final Execution Protocol

Execute in this exact order:

```
DISCOVER
↓
AUDIT
↓
RESEARCH
↓
SCORE
↓
NORMALIZE
↓
DEDUPLICATE
↓
DESIGN
↓
BACKUP
↓
BOOTSTRAP
↓
IMPLEMENT KERNEL
↓
IMPLEMENT DOMAIN
↓
IMPLEMENT CAPABILITY GRAPH
↓
IMPLEMENT ORCHESTRATOR
↓
IMPLEMENT TASKS
↓
IMPLEMENT AGENTS
↓
IMPLEMENT SKILLS
↓
IMPLEMENT PROMPT COMPILER
↓
IMPLEMENT RUNTIME
↓
IMPLEMENT OPENCode ADAPTER
↓
IMPLEMENT OTHER ADAPTERS
↓
IMPLEMENT MCP/A2A
↓
IMPLEMENT MEMORY
↓
IMPLEMENT POLICY/SECURITY
↓
IMPLEMENT EVALUATION/OBSERVABILITY
↓
IMPLEMENT SETUP WIZARD
↓
IMPLEMENT INSTALLER
↓
IMPLEMENT MIGRATION
↓
IMPLEMENT CLI
↓
IMPLEMENT UI
↓
TEST
↓
SECURITY AUDIT
↓
LICENSE AUDIT
↓
DOCUMENT
↓
PUSH
↓
VERIFY
```

Never reverse the order.

---

## 94. Final Commandment

Do not optimize for:

```
number of repositories
number of agents
number of Skills
number of models
number of dashboards
```

Optimize for:

```
execution quality
reliability
parallel productivity
context efficiency
security
recovery
interoperability
maintainability
cost efficiency
developer experience
explainability
```

Do not merely integrate.

# Analyze.

Do not merely preserve.

# Normalize.

Do not merely copy.

# Reimplement.

Do not create more agents.

# Create better capability routing.

Do not create more prompts.

# Create the Prompt Compiler.

Do not create more orchestrators.

# Create one Orchestration Kernel.

Do not create more task boards.

# Create one Task Graph with multiple views.

Do not create more memory systems.

# Create one Memory Contract with Providers.

Do not make OpenCode the architecture.

# Make OpenCode the first-class Runtime Adapter.