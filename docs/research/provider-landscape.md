# Provider Landscape

Date: 2026-08-23
Normalized provider catalog for the Model/Provider Router. Adapters normalize to OpenAI-compatible + Anthropic-compatible protocol classes; provider-specific quirks recorded as adapter metadata. No physical Skill per provider — `model-provider-engineering` skill + catalog data (spec §26).

## Cloud providers
| Provider | Protocol class | Models note | Priority |
|---|---|---|---|
| OpenAI | openai | full capability matrix incl. vision/audio/tools | P0 |
| Anthropic | anthropic | tool use, long context, extended thinking | P0 |
| Google Gemini | gemini/openai-compat | multimodal, huge context | P0 |
| Azure OpenAI | openai (deployment-scoped) | enterprise quotas | P1 |
| AWS Bedrock | bedrock | enterprise, cross-model | P2 |
| NVIDIA NIM | openai | user already runs NIM configs (10 skills present) | P1 |
| Mistral / Cohere / Groq / Together / Fireworks / Cerebras / SambaNova | openai | fast/cheap tiers | P1-P2 |
| OpenRouter | openai | meta-router; fallback aggregator | P1 |
| DeepSeek / xAI / Z.AI / Moonshot / MiniMax / Novita / PPIO / Gitee AI / CometAPI / Perplexity | openai | regional/specialty | P2 |

## Local providers (local-first mandate)
| Runtime | Protocol | Notes |
|---|---|---|
| llama.cpp server | openai | reference OSS |
| Ollama | native+openai | easiest local onboarding |
| LM Studio | openai | GUI users |
| LocalAI / KoboldCPP / TGWUI | openai | alternates |
| Docker Model Runner | openai | when docker present |
| Foundry Local | openai | Windows-native angle |
| vLLM | openai | self-host serving |

## Existing user infrastructure (must compose, not replace)
- **OmniRoute local proxy** at localhost:20128 with auto/* aliases (best-coding/best-reasoning/best-fast…) — modeled in catalog as a gateway-class provider; Raidan Gateway treats it as upstream with health/quota metadata.
- **NVIDIA NIM** function-ID configs exist in user skills (opencode-models) → importable catalog entries.

## Embeddings providers
OpenAI · Azure OpenAI · Gemini · Cohere · Voyage · Mistral · Ollama · LM Studio · LocalAI · Lemonade · OpenRouter · LiteLLM · generic OpenAI-compatible endpoint.

## Router scoring inputs (per spec §25)
task type/complexity, agent role, capability requirements (coding/reasoning/vision/audio/tool-calling/structured-output), context size, latency, cost, health, quota, availability, user/project preference. Failover chains: primary→secondary→fallback→emergency, transitions policy-controlled and event-logged (`model.switched`).

## Model classification taxonomy
coding · reasoning · fast · cheap · research · vision · audio · tool-calling · structured-output · long-context · embedding · reranking
