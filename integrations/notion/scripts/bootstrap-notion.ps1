#Requires -Version 5.1
<#
.SYNOPSIS
  RaidanOpencode - Notion bootstrap (idempotent).
.DESCRIPTION
  Creates or reuses the "Opencode" thinking-system project in the connected Notion
  workspace: root page + governed databases + seed records. Safe to re-run;
  nothing is duplicated.
.SECURITY
  The token is read ONLY from the NOTION_API_TOKEN environment variable.
  It is never printed, logged, or written to disk by this script.
.EXAMPLE
  $env:NOTION_API_TOKEN = "<token>"
  ./bootstrap-notion.ps1
#>
[CmdletBinding()]
param(
    [string]$RootPageTitle = "Opencode",
    [string]$NotionVersion = "2022-06-28",
    [string]$ApiBase       = "https://api.notion.com/v1"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($env:NOTION_API_TOKEN)) {
    throw "BLOCKED: Missing NOTION_API_TOKEN environment variable.`nSet it for this session only and re-run. Never hardcode tokens in files."
}

$Headers = @{
    "Authorization"  = "Bearer $($env:NOTION_API_TOKEN)"
    "Notion-Version" = $NotionVersion
    "Content-Type"   = "application/json"
}

function Invoke-NotionApi {
    param([string]$Method, [string]$Path, $Body)
    $uri  = "{0}/{1}" -f $ApiBase.TrimEnd('/'), $Path.TrimStart('/')
    $json = if ($null -ne $Body) { ConvertTo-Json -InputObject $Body -Depth 16 } else { $null }
    for ($attempt = 1; $attempt -le 5; $attempt++) {
        try {
            if ($json) { return Invoke-RestMethod -Method $Method -Uri $uri -Headers $Headers -Body $json }
            else       { return Invoke-RestMethod -Method $Method -Uri $uri -Headers $Headers }
        } catch {
            $code = 0
            if ($_.Exception.Response) { $code = [int]$_.Exception.Response.StatusCode }
            if ($code -eq 429 -or $code -ge 500) { Start-Sleep -Seconds ([math]::Pow(2, $attempt)); continue }
            throw
        }
    }
    throw "Notion API failed after retries: $Method $Path"
}

function Get-PlainTextArray { param($Arr) if ($null -eq $Arr) { return "" }; return (($Arr | ForEach-Object { $_.plain_text }) -join "") }

function Get-PageTitleText {
    param($Page)
    foreach ($prop in $Page.properties.PSObject.Properties) {
        if ($prop.Value.type -eq "title") { return (Get-PlainTextArray $prop.Value.title) }
    }
    return ""
}

function Find-PageByExactTitle {
    param([string]$Title)
    $res = Invoke-NotionApi -Method Post -Path "search" -Body @{ query = $Title; filter = @{ property = "object"; value = "page" } }
    foreach ($r in $res.results) { if ((Get-PageTitleText $r) -eq $Title) { return $r } }
    return $null
}

function Find-DatabaseByExactTitle {
    param([string]$Title)
    $res = Invoke-NotionApi -Method Post -Path "search" -Body @{ query = $Title; filter = @{ property = "object"; value = "database" } }
    foreach ($r in $res.results) { if ((Get-PlainTextArray $r.title) -eq $Title) { return $r } }
    return $null
}

function ConvertTo-NotionProperties {
    param($Spec)
    $out = @{}
    foreach ($key in $Spec.Keys) {
        $def = $Spec[$key]
        switch ($def.type) {
            "title"     { $out[$key] = @{ title = @{} } }
            "rich_text" { $out[$key] = @{ rich_text = @{} } }
            "url"       { $out[$key] = @{ url = @{} } }
            "date"      { $out[$key] = @{ date = @{} } }
            "checkbox"  { $out[$key] = @{ checkbox = @{} } }
            "number"    { $out[$key] = @{ number = @{ format = "number" } } }
            "select"    {
                $opts = @()
                foreach ($o in $def.options) { $opts += ,@{ name = $o } }
                $out[$key] = @{ select = @{ options = $opts } }
            }
            default { throw "Unsupported property type '$($def.type)' for '$key'" }
        }
    }
    return $out
}

function Test-RowExists {
    param([string]$DatabaseId, [string]$Value)
    $body = @{ filter = @{ property = "Name"; title = @{ equals = $Value } }; page_size = 1 }
    $res = Invoke-NotionApi -Method Post -Path "databases/$DatabaseId/query" -Body $body
    return (@($res.results).Count -gt 0)
}

function Add-Row {
    param([string]$DatabaseId, $Props)
    Invoke-NotionApi -Method Post -Path "pages" -Body @{ parent = @{ database_id = $DatabaseId }; properties = $Props } | Out-Null
}

# ---- v0 schema (mirrors integrations/notion/schema/notion-schema.yaml) ----
$P0123 = @("P0","P1","P2","P3")
$PHASES = @("DISCOVERY","RESEARCH","ARCHITECTURE","IMPLEMENTATION","VALIDATION","RELEASE","OPERATIONS")
$Schema = @(
    @{ name = "Projects";            props = [ordered]@{ Name=@{type="title"}; Status=@{type="select";options=@("PLANNED","ACTIVE","PAUSED","COMPLETED","ARCHIVED")}; Phase=@{type="select";options=$PHASES}; Priority=@{type="select";options=$P0123}; Vision=@{type="rich_text"}; Repository=@{type="url"} } },
    @{ name = "Objectives";          props = [ordered]@{ Name=@{type="title"}; Status=@{type="select";options=@("OPEN","IN_PROGRESS","DONE","BLOCKED")}; Priority=@{type="select";options=$P0123}; Project=@{type="rich_text"}; SuccessMetric=@{type="rich_text"} } },
    @{ name = "Requirements";        props = [ordered]@{ Name=@{type="title"}; Type=@{type="select";options=@("FUNCTIONAL","NON_FUNCTIONAL","SECURITY","PERFORMANCE","GOVERNANCE")}; Status=@{type="select";options=@("PROPOSED","ACCEPTED","REJECTED","IMPLEMENTED")}; Priority=@{type="select";options=$P0123}; AcceptanceCriteria=@{type="rich_text"} } },
    @{ name = "Epics";               props = [ordered]@{ Name=@{type="title"}; Status=@{type="select";options=@("BACKLOG","ACTIVE","DONE")}; Phase=@{type="select";options=$PHASES} } },
    @{ name = "Milestones";          props = [ordered]@{ Name=@{type="title"}; Status=@{type="select";options=@("PLANNED","IN_PROGRESS","DONE","MISSED")}; Deadline=@{type="date"}; Goal=@{type="rich_text"} } },
    @{ name = "Tasks";               props = [ordered]@{ Name=@{type="title"}; Status=@{type="select";options=@("BACKLOG","PLANNED","READY","RUNNING","WAITING","BLOCKED","REVIEW","APPROVAL","DONE","FAILED","CANCELLED")}; Priority=@{type="select";options=$P0123}; Epic=@{type="rich_text"}; Notes=@{type="rich_text"} } },
    @{ name = "Decisions (ADR)";     props = [ordered]@{ Name=@{type="title"}; ADR_ID=@{type="rich_text"}; Status=@{type="select";options=@("PROPOSED","ACCEPTED","SUPERSEDED","REJECTED")}; Context=@{type="rich_text"}; Decision=@{type="rich_text"} } },
    @{ name = "Risks";               props = [ordered]@{ Name=@{type="title"}; Severity=@{type="select";options=@("LOW","MEDIUM","HIGH","CRITICAL")}; Status=@{type="select";options=@("OPEN","MITIGATED","CLOSED")}; Mitigation=@{type="rich_text"} } },
    @{ name = "Sources";             props = [ordered]@{ Name=@{type="title"}; Url=@{type="url"}; License=@{type="rich_text"}; Decision=@{type="select";options=@("CORE","ADAPTER","OPTIONAL","REIMPLEMENT","REFERENCE_ONLY","REJECT")}; Notes=@{type="rich_text"} } },
    @{ name = "Research Questions";  props = [ordered]@{ Name=@{type="title"}; Status=@{type="select";options=@("OPEN","RESEARCHING","ANSWERED","BLOCKED","INVALIDATED")}; Priority=@{type="select";options=$P0123}; Hypothesis=@{type="rich_text"} } },
    @{ name = "Capabilities";        props = [ordered]@{ Name=@{type="title"}; Category=@{type="rich_text"}; RiskLevel=@{type="select";options=@("SAFE","CONTROLLED","SENSITIVE","DANGEROUS")}; Description=@{type="rich_text"} } },
    @{ name = "Agents";              props = [ordered]@{ Name=@{type="title"}; Role=@{type="rich_text"}; Status=@{type="select";options=@("PLANNED","ACTIVE","DEPRECATED")}; Autonomy=@{type="select";options=@("L0","L1","L2","L3","L4","L5")} } },
    @{ name = "Skills";              props = [ordered]@{ Name=@{type="title"}; Category=@{type="rich_text"}; Status=@{type="select";options=@("ACTIVE","DUPLICATE","DEPRECATED")}; Source=@{type="rich_text"} } },
    @{ name = "Workflows";           props = [ordered]@{ Name=@{type="title"}; Trigger=@{type="rich_text"}; ApprovalGate=@{type="checkbox"}; Stages=@{type="rich_text"} } },
    @{ name = "Knowledge";           props = [ordered]@{ Name=@{type="title"}; Type=@{type="select";options=@("FACT","PATTERN","LESSON","FINDING","CONSTRAINT")}; Confidence=@{type="select";options=@("VERIFIED","LIKELY","UNVERIFIED")}; Content=@{type="rich_text"} } }
)

# ---- Main ----
Write-Host "[1/5] Validating connection..."
$me = Invoke-NotionApi -Method Get -Path "users/me"
Write-Host ("      Connected as bot: {0}" -f $me.name)

Write-Host "[2/5] Locating root page '$RootPageTitle'..."
$root = Find-PageByExactTitle -Title $RootPageTitle
if (-not $root) {
    Write-Host "      Not found -> creating top-level page."
    try {
        $root = Invoke-NotionApi -Method Post -Path "pages" -Body @{
            parent     = @{ type = "workspace"; workspace = $true }
            properties = @{ title = @{ title = @(@{ text = @{ content = $RootPageTitle } }) } }
        }
    } catch {
        throw "BLOCKED: Could not create a workspace-level page. In Notion, share an existing page named '$RootPageTitle' with this connection (page menu -> Connections) and re-run."
    }
}
Write-Host ("      Root page id: {0}" -f $root.id)

Write-Host "[3/5] Ensuring databases (find-or-create)..."
$ids = @{}
foreach ($db in $Schema) {
    $existing = Find-DatabaseByExactTitle -Title $db.name
    if ($existing) {
        $ids[$db.name] = $existing.id
        Write-Host ("  = {0,-20} reuse  {1}" -f $db.name, $existing.id)
        continue
    }
    $created = Invoke-NotionApi -Method Post -Path "databases" -Body @{
        parent     = @{ page_id = $root.id }
        title      = @(@{ type = "text"; text = @{ content = $db.name } })
        properties = ConvertTo-NotionProperties $db.props
    }
    $ids[$db.name] = $created.id
    Write-Host ("  + {0,-20} create {1}" -f $db.name, $created.id)
}

Write-Host "[4/5] Seeding initial records (idempotent)..."
$pId = $ids["Projects"]
if (-not (Test-RowExists -DatabaseId $pId -Value "Opencode")) {
    Add-Row -DatabaseId $pId -Props @{
        Name       = @{ title = @(@{ text = @{ content = "Opencode" } }) }
        Status     = @{ select = @{ name = "ACTIVE" } }
        Phase      = @{ select = @{ name = "ARCHITECTURE" } }
        Priority   = @{ select = @{ name = "P0" } }
        Vision     = @{ rich_text = @(@{ text = @{ content = "Vendor-neutral AI Agent Operating System for software engineering." } }) }
        Repository = @{ url = "https://github.com/Raidan-Ai/RaidanOpencode" }
    }
    Write-Host "  + Project: Opencode"
}

$adrTitles = @(
    @{ id = "ADR-001"; name = "Vendor-Neutral Kernel" },
    @{ id = "ADR-002"; name = "OpenCode as Runtime Adapter" },
    @{ id = "ADR-003"; name = "One Canonical Orchestrator" },
    @{ id = "ADR-004"; name = "Capability-First Routing" },
    @{ id = "ADR-005"; name = "Minimum Sufficient Team" },
    @{ id = "ADR-006"; name = "One Canonical Task Engine" },
    @{ id = "ADR-007"; name = "Notion as Thinking/Governance Layer" }
)
$aId = $ids["Decisions (ADR)"]
foreach ($adr in $adrTitles) {
    if (-not (Test-RowExists -DatabaseId $aId -Value $adr.name)) {
        Add-Row -DatabaseId $aId -Props @{
            Name    = @{ title = @(@{ text = @{ content = $adr.name } }) }
            ADR_ID  = @{ rich_text = @(@{ text = @{ content = $adr.id } }) }
            Status  = @{ select = @{ name = "PROPOSED" } }
        }
        Write-Host ("  + ADR: {0} {1}" -f $adr.id, $adr.name)
    }
}

$questions = @(
    "What is the minimum useful Raidan Kernel?",
    "What should remain outside the kernel?",
    "Which upstream capabilities are truly unique?",
    "Where are the biggest duplication risks?",
    "What is the canonical task model?",
    "What is the canonical capability ontology?",
    "What is the canonical Skill model?",
    "How should Notion synchronization work?",
    "Which runtime adapters should be stable first?",
    "What is the safest autonomy model?"
)
$qId = $ids["Research Questions"]
foreach ($q in $questions) {
    if (-not (Test-RowExists -DatabaseId $qId -Value $q)) {
        Add-Row -DatabaseId $qId -Props @{
            Name     = @{ title = @(@{ text = @{ content = $q } }) }
            Status   = @{ select = @{ name = "OPEN" } }
            Priority = @{ select = @{ name = "P1" } }
        }
        Write-Host "  + Question: $q"
    }
}

Write-Host "[5/5] Writing ID map..."
$outDir = Join-Path (Join-Path $PSScriptRoot "..") "generated"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
[pscustomobject]@{
    generated_at = (Get-Date).ToUniversalTime().ToString("o")
    root_page_id = $root.id
    databases    = $ids
} | ConvertTo-Json -Depth 6 | Set-Content -Encoding UTF8 -Path (Join-Path $outDir "notion-ids.json")

Write-Host "Done. IDs -> integrations/notion/generated/notion-ids.json (gitignored)."
Write-Host "SECURITY: if this token was shared over chat/email, rotate it now in Notion -> Settings -> Connections."
