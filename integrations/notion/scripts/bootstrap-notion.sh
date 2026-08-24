#!/usr/bin/env bash
# RaidanOpencode - Notion bootstrap (idempotent).
# Creates or reuses the "Opencode" thinking-system project: root page + databases + seeds.
# SECURITY: token is read ONLY from NOTION_API_TOKEN env var; never printed or stored.
set -euo pipefail

API_BASE="https://api.notion.com/v1"
NOTION_VERSION="2022-06-28"
ROOT_PAGE_TITLE="${RAIDAN_NOTION_ROOT_PAGE:-Opencode}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUT_FILE="$SCRIPT_DIR/../generated/notion-ids.json"

if [ -z "${NOTION_API_TOKEN:-}" ]; then
  echo "BLOCKED: Missing NOTION_API_TOKEN environment variable." >&2
  echo "Set it for this session only and re-run. Never hardcode tokens in files." >&2
  exit 1
fi

command -v curl >/dev/null || { echo "BLOCKED: curl is required" >&2; exit 1; }
command -v jq   >/dev/null || { echo "BLOCKED: jq is required" >&2; exit 1; }

api() {
  local method="$1" path="$2" body="${3:-}" attempt=1 code resp out
  while [ "$attempt" -le 5 ]; do
    if [ -n "$body" ]; then
      out="$(curl -sS -w '\n%{http_code}' -X "$method" "$API_BASE/$path" \
        -H "Authorization: Bearer $NOTION_API_TOKEN" \
        -H "Notion-Version: $NOTION_VERSION" \
        -H "Content-Type: application/json" --data "$body")"
    else
      out="$(curl -sS -w '\n%{http_code}' -X "$method" "$API_BASE/$path" \
        -H "Authorization: Bearer $NOTION_API_TOKEN" \
        -H "Notion-Version: $NOTION_VERSION")"
    fi
    code="$(printf '%s' "$out" | tail -n1)"
    resp="$(printf '%s' "$out" | sed '$d')"
    if [ "$code" = "429" ] || [ "${code:0:1}" = "5" ]; then sleep $((attempt * 2)); attempt=$((attempt + 1)); continue; fi
    if [ "${code:0:1}" != "2" ]; then
      echo "Notion API error $code on $method /$path" >&2
      printf '%s\n' "$resp" >&2
      exit 1
    fi
    printf '%s' "$resp"
    return 0
  done
  echo "Retries exhausted: $method /$path" >&2
  exit 1
}

page_title_of() {
  jq -r '[.properties | to_entries[] | select(.value.type == "title") | .value.title[]?.plain_text] | join("")' <<<"$1"
}

db_title_of() {
  jq -r '[.title[]?.plain_text] | join("")' <<<"$1"
}

find_page_exact() {
  local res r t
  res="$(api POST search "{\"query\":\"$ROOT_PAGE_TITLE\",\"filter\":{\"property\":\"object\",\"value\":\"page\"}}")"
  while IFS= read -r r; do
    t="$(page_title_of "$r")"
    if [ "$t" = "$ROOT_PAGE_TITLE" ]; then printf '%s' "$r"; return 0; fi
  done < <(jq -c '.results[]' <<<"$res")
  return 1
}

find_db_exact() {
  local title="$1" res r t
  res="$(api POST search "{\"query\":\"$title\",\"filter\":{\"property\":\"object\",\"value\":\"database\"}}")"
  while IFS= read -r r; do
    t="$(db_title_of "$r")"
    if [ "$t" = "$title" ]; then printf '%s' "$r"; return 0; fi
  done < <(jq -c '.results[]' <<<"$res")
  return 1
}

# props spec: "Key:type[:opt1,opt2];Key:type[:...]"
make_props() {
  local spec="$1" out="{" first=1 IFS=';' p key typ fo o
  read -ra parts <<<"$spec"
  for p in "${parts[@]}"; do
    [ -z "$p" ] && continue
    IFS=':' read -ra f <<<"$p"
    key="${f[0]}"; typ="${f[1]}"
    [ "$first" -eq 0 ] && out+=","
    first=0
    case "$typ" in
      title)     out+="\"$key\":{\"title\":{}}" ;;
      rich_text) out+="\"$key\":{\"rich_text\":{}}" ;;
      url)       out+="\"$key\":{\"url\":{}}" ;;
      date)      out+="\"$key\":{\"date\":{}}" ;;
      checkbox)  out+="\"$key\":{\"checkbox\":{}}" ;;
      number)    out+="\"$key\":{\"number\":{\"format\":\"number\"}}" ;;
      select)
        out+="\"$key\":{\"select\":{\"options\":["
        IFS=',' read -ra opts <<<"${f[2]}"
        fo=1
        for o in "${opts[@]}"; do
          [ "$fo" -eq 0 ] && out+=","
          fo=0
          out+="{\"name\":\"$o\"}"
        done
        out+="]}}"
        ;;
      *) echo "Unsupported type: $typ" >&2; exit 1 ;;
    esac
  done
  printf '%s}' "$out"
}

row_exists() {
  local db_id="$1" value="$2" res
  res="$(api POST "databases/$db_id/query" \
    "{\"filter\":{\"property\":\"Name\",\"title\":{\"equals\":\"$value\"}},\"page_size\":1}")"
  [ "$(jq '.results | length' <<<"$res")" -gt 0 ]
}

add_row() {
  local db_id="$1" props="$2"
  api POST pages "{\"parent\":{\"database_id\":\"$db_id\"},\"properties\":$props}" >/dev/null
}

title_prop_row() { # db_id value extra_json(optional)
  local db_id="$1" value="$2" extra="${3:-}"
  printf '{"Name":{"title":[{"text":{"content":"%s"}}]}%s}' "$value" "$extra"
}

rt() { printf '"%s":{"rich_text":[{"text":{"content":"%s"}}]}' "$1" "$2"; }
sel() { printf '"%s":{"select":{"name":"%s"}}' "$1" "$2"; }

# ---- Main ----
echo "[1/5] Validating connection..."
ME="$(api GET users/me)"
echo "      Connected as bot: $(jq -r '.name // "unnamed"' <<<"$ME")"

echo "[2/5] Locating root page '$ROOT_PAGE_TITLE'..."
if ROOT_JSON="$(find_page_exact)"; then
  ROOT_ID="$(jq -r '.id' <<<"$ROOT_JSON")"
else
  echo "      Not found -> creating top-level page."
  CREATE_BODY="{\"parent\":{\"type\":\"workspace\",\"workspace\":true},\"properties\":{\"title\":{\"title\":[{\"text\":{\"content\":\"$ROOT_PAGE_TITLE\"}}]}}}"
  if ! ROOT_JSON="$(api POST pages "$CREATE_BODY" 2>/dev/null)"; then
    echo "BLOCKED: Could not create a workspace-level page." >&2
    echo "Share an existing page named '$ROOT_PAGE_TITLE' with this connection (page menu -> Connections) and re-run." >&2
    exit 1
  fi
  ROOT_ID="$(jq -r '.id' <<<"$ROOT_JSON")"
fi
echo "      Root page id: $ROOT_ID"

echo "[3/5] Ensuring databases (find-or-create)..."
declare -A IDS
DB_SPECS=(
  "Projects|Name:title;Status:select:PLANNED,ACTIVE,PAUSED,COMPLETED,ARCHIVED;Phase:select:DISCOVERY,RESEARCH,ARCHITECTURE,IMPLEMENTATION,VALIDATION,RELEASE,OPERATIONS;Priority:select:P0,P1,P2,P3;Vision:rich_text;Repository:url"
  "Objectives|Name:title;Status:select:OPEN,IN_PROGRESS,DONE,BLOCKED;Priority:select:P0,P1,P2,P3;Project:rich_text;SuccessMetric:rich_text"
  "Requirements|Name:title;Type:select:FUNCTIONAL,NON_FUNCTIONAL,SECURITY,PERFORMANCE,GOVERNANCE;Status:select:PROPOSED,ACCEPTED,REJECTED,IMPLEMENTED;Priority:select:P0,P1,P2,P3;AcceptanceCriteria:rich_text"
  "Epics|Name:title;Status:select:BACKLOG,ACTIVE,DONE;Phase:select:DISCOVERY,RESEARCH,ARCHITECTURE,IMPLEMENTATION,VALIDATION,RELEASE,OPERATIONS"
  "Milestones|Name:title;Status:select:PLANNED,IN_PROGRESS,DONE,MISSED;Deadline:date;Goal:rich_text"
  "Tasks|Name:title;Status:select:BACKLOG,PLANNED,READY,RUNNING,WAITING,BLOCKED,REVIEW,APPROVAL,DONE,FAILED,CANCELLED;Priority:select:P0,P1,P2,P3;Epic:rich_text;Notes:rich_text"
  "Decisions (ADR)|Name:title;ADR_ID:rich_text;Status:select:PROPOSED,ACCEPTED,SUPERSEDED,REJECTED;Context:rich_text;Decision:rich_text"
  "Risks|Name:title;Severity:select:LOW,MEDIUM,HIGH,CRITICAL;Status:select:OPEN,MITIGATED,CLOSED;Mitigation:rich_text"
  "Sources|Name:title;Url:url;License:rich_text;Decision:select:CORE,ADAPTER,OPTIONAL,REIMPLEMENT,REFERENCE_ONLY,REJECT;Notes:rich_text"
  "Research Questions|Name:title;Status:select:OPEN,RESEARCHING,ANSWERED,BLOCKED,INVALIDATED;Priority:select:P0,P1,P2,P3;Hypothesis:rich_text"
  "Capabilities|Name:title;Category:rich_text;RiskLevel:select:SAFE,CONTROLLED,SENSITIVE,DANGEROUS;Description:rich_text"
  "Agents|Name:title;Role:rich_text;Status:select:PLANNED,ACTIVE,DEPRECATED;Autonomy:select:L0,L1,L2,L3,L4,L5"
  "Skills|Name:title;Category:rich_text;Status:select:ACTIVE,DUPLICATE,DEPRECATED;Source:rich_text"
  "Workflows|Name:title;Trigger:rich_text;ApprovalGate:checkbox;Stages:rich_text"
  "Knowledge|Name:title;Type:select:FACT,PATTERN,LESSON,FINDING,CONSTRAINT;Confidence:select:VERIFIED,LIKELY,UNVERIFIED;Content:rich_text"
)
for spec in "${DB_SPECS[@]}"; do
  name="${spec%%|*}"; props_spec="${spec#*|}"
  if DB_JSON="$(find_db_exact "$name")"; then
    IDS["$name"]="$(jq -r '.id' <<<"$DB_JSON")"
    printf '  = %-20s reuse  %s\n' "$name" "${IDS[$name]}"
  else
    CREATE_DB="{\"parent\":{\"page_id\":\"$ROOT_ID\"},\"title\":[{\"type\":\"text\",\"text\":{\"content\":\"$name\"}}],\"properties\":$(make_props "$props_spec")}"
    DB_JSON="$(api POST databases "$CREATE_DB")"
    IDS["$name"]="$(jq -r '.id' <<<"$DB_JSON")"
    printf '  + %-20s create %s\n' "$name" "${IDS[$name]}"
  fi
done

echo "[4/5] Seeding initial records (idempotent)..."
P_ID="${IDS[Projects]}"
if ! row_exists "$P_ID" "Opencode"; then
  add_row "$P_ID" "{$(title_prop_row x Opencode | sed 's/{//; s/}$//'),$(sel Status ACTIVE),$(sel Phase ARCHITECTURE),$(sel Priority P0),$(rt Vision 'Vendor-neutral AI Agent Operating System for software engineering.'),\"Repository\":{\"url\":\"https://github.com/Raidan-Ai/RaidanOpencode\"}}"
  echo "  + Project: Opencode"
fi

A_ID="${IDS[Decisions (ADR)]}"
for pair in "ADR-001|Vendor-Neutral Kernel" "ADR-002|OpenCode as Runtime Adapter" "ADR-003|One Canonical Orchestrator" "ADR-004|Capability-First Routing" "ADR-005|Minimum Sufficient Team" "ADR-006|One Canonical Task Engine" "ADR-007|Notion as Thinking/Governance Layer"; do
  aid="${pair%%|*}"; aname="${pair#*|}"
  if ! row_exists "$A_ID" "$aname"; then
    add_row "$A_ID" "{$(title_prop_row x "$aname" | sed 's/{//; s/}$//'),$(rt ADR_ID "$aid"),$(sel Status PROPOSED)}"
    echo "  + ADR: $aid $aname"
  fi
done

Q_ID="${IDS[Research Questions]}"
while IFS= read -r q; do
  if ! row_exists "$Q_ID" "$q"; then
    add_row "$Q_ID" "{$(title_prop_row x "$q" | sed 's/{//; s/}$//'),$(sel Status OPEN),$(sel Priority P1)}"
    echo "  + Question: $q"
  fi
done <<'EOF'
What is the minimum useful Raidan Kernel?
What should remain outside the kernel?
Which upstream capabilities are truly unique?
Where are the biggest duplication risks?
What is the canonical task model?
What is the canonical capability ontology?
What is the canonical Skill model?
How should Notion synchronization work?
Which runtime adapters should be stable first?
What is the safest autonomy model?
EOF

echo "[5/5] Writing ID map..."
mkdir -p "$SCRIPT_DIR/../generated"
jq -n --arg at "$(date -u +%Y-%m-%dT%H:%M:%SZ)" --arg rid "$ROOT_ID" \
  --argjson dbs "$(for k in "${!IDS[@]}"; do printf '%s=%s\n' "$k" "${IDS[$k]}"; done | jq -R -s 'split("\n") | map(select(length>0)) | map(split("=") | {(.[0]): .[1]}) | add')" \
  '{generated_at: $at, root_page_id: $rid, databases: $dbs}' > "$OUT_FILE"

echo "Done. IDs -> integrations/notion/generated/notion-ids.json (gitignored)."
echo "SECURITY: if this token was shared over chat/email, rotate it now in Notion -> Settings -> Connections."
