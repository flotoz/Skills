<#
.SYNOPSIS
  Installs the illustrate-it skills into ~/.agents/skills, plus ~/.claude/skills when
  Claude Code is detected (Windows). Parameters are advanced options.

.EXAMPLE
  irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/illustrate-it/install.ps1 | iex

.EXAMPLE
  & ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/illustrate-it/install.ps1))) -Project
#>
param(
  [ValidateSet('auto', 'agents', 'claude', 'codex', 'cursor', 'all')]
  [string[]]$Agent = @('auto'),
  [switch]$Project,
  [string]$Ref = 'main',
  [switch]$List
)

$ErrorActionPreference = 'Stop'
$forward = @{ Plugin = @('illustrate-it'); Agent = $Agent; Project = $Project; Ref = $Ref; List = $List }

# Use the repository installer next to this plugin, otherwise download it.
$local = if ($PSScriptRoot) { Join-Path $PSScriptRoot '../../install.ps1' }
if ($local -and (Test-Path $local)) {
  & $local @forward
} else {
  $installer = [scriptblock]::Create((Invoke-RestMethod "https://raw.githubusercontent.com/flotoz/Skills/$Ref/install.ps1"))
  & $installer @forward
}
