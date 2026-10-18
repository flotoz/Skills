<#
.SYNOPSIS
  Installs skills from github.com/flotoz/Skills into one or more agents (Windows).

.EXAMPLE
  irm https://raw.githubusercontent.com/flotoz/Skills/main/install.ps1 | iex

.EXAMPLE
  & ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/install.ps1))) -Skill coach-my-finances -Agent all

.EXAMPLE
  .\install.ps1 -List
#>
param(
  [string[]]$Skill = @(),
  [ValidateSet('claude', 'codex', 'cursor', 'all')]
  [string[]]$Agent = @('claude'),
  [switch]$Project,
  [string]$Ref = 'main',
  [switch]$List
)

$ErrorActionPreference = 'Stop'
$Repo = 'flotoz/Skills'

# Use the local checkout when run from inside the repository, otherwise download it.
$tmp = $null
if ($PSScriptRoot -and (Test-Path (Join-Path $PSScriptRoot '.claude-plugin/marketplace.json'))) {
  $src = $PSScriptRoot
} else {
  $tmp = Join-Path ([IO.Path]::GetTempPath()) ("flotoz-skills-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $tmp | Out-Null
  Write-Host "Downloading $Repo@$Ref..."
  $zip = Join-Path $tmp 'repo.zip'
  Invoke-WebRequest -UseBasicParsing -Uri "https://github.com/$Repo/archive/$Ref.zip" -OutFile $zip
  Expand-Archive -Path $zip -DestinationPath $tmp
  $src = (Get-ChildItem -Path $tmp -Directory | Where-Object Name -like 'Skills-*' | Select-Object -First 1).FullName
}

try {
  # Every directory holding a SKILL.md under skills/ or plugins/*/skills/ is a skill.
  $roots = @('skills', 'plugins') | ForEach-Object { Join-Path $src $_ } | Where-Object { Test-Path $_ }
  $skillDirs = @($roots | ForEach-Object { Get-ChildItem -Path $_ -Recurse -Filter 'SKILL.md' -File } |
    ForEach-Object { $_.Directory } | Sort-Object Name)

  if ($skillDirs.Count -eq 0) { throw "No skills found in $src." }

  if ($List) {
    Write-Host 'Available skills:'
    $skillDirs | ForEach-Object { Write-Host "  - $($_.Name)" }
    return
  }

  if ($Agent -contains 'all') { $Agent = @('claude', 'codex', 'cursor') }

  function Get-TargetDir([string]$name) {
    if ($Project) {
      switch ($name) { 'claude' { '.claude/skills' } default { '.agents/skills' } }
    } else {
      switch ($name) {
        'claude' { Join-Path $HOME '.claude/skills' }
        'codex'  { Join-Path $HOME '.agents/skills' }
        'cursor' { Join-Path $HOME '.cursor/skills' }
      }
    }
  }

  $installed = 0
  foreach ($dir in $skillDirs) {
    if ($Skill.Count -gt 0 -and $Skill -notcontains $dir.Name) { continue }
    foreach ($a in $Agent) {
      $dest = Join-Path (Get-TargetDir $a) $dir.Name
      New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
      if (Test-Path $dest) { Remove-Item -Recurse -Force $dest }
      Copy-Item -Recurse -Path $dir.FullName -Destination $dest
      Write-Host "OK  $($dir.Name) -> $dest"
    }
    $installed++

    # Skills shipped in a plugin may need the plugin's MCP servers.
    $mcpFile = Join-Path $dir.Parent.Parent.FullName '.mcp.json'
    if (Test-Path $mcpFile) {
      Write-Host "    $($dir.Name) needs these MCP servers (add them to your agent, then authenticate):"
      Get-Content $mcpFile | ForEach-Object { Write-Host "      $_" }
    }
  }

  if ($installed -eq 0) { throw "None of the requested skills exist: $($Skill -join ', '). Run with -List." }
  Write-Host "Installed $installed skill(s). Restart your agent to load them."
} finally {
  if ($tmp) { Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue }
}
