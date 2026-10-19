<#
.SYNOPSIS
  Installs the finary-coach skills into Claude Code, Codex or Cursor (Windows).

.EXAMPLE
  irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.ps1 | iex

.EXAMPLE
  & ([scriptblock]::Create((irm https://raw.githubusercontent.com/flotoz/Skills/main/plugins/finary-coach/install.ps1))) -Agent all -Project
#>
param(
  [ValidateSet('claude', 'codex', 'cursor', 'all')]
  [string[]]$Agent = @('claude'),
  [switch]$Project,
  [string]$Ref = 'main',
  [switch]$List
)

$ErrorActionPreference = 'Stop'
$forward = @{ Plugin = @('finary-coach'); Agent = $Agent; Project = $Project; Ref = $Ref; List = $List }

# Use the repository installer next to this plugin, otherwise download it.
$local = if ($PSScriptRoot) { Join-Path $PSScriptRoot '../../install.ps1' }
if ($local -and (Test-Path $local)) {
  & $local @forward
} else {
  $installer = [scriptblock]::Create((Invoke-RestMethod "https://raw.githubusercontent.com/flotoz/Skills/$Ref/install.ps1"))
  & $installer @forward
}
