<#
.SYNOPSIS
  Tests install.ps1 and the plugin installers in throwaway homes (Windows
  PowerShell 5.1 and PowerShell 7). Prints one line per check and exits 1 if
  any fails.

.EXAMPLE
  powershell -NoProfile -File scripts/test-installers.ps1

.EXAMPLE
  pwsh -NoProfile -File scripts/test-installers.ps1
#>
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$shell = (Get-Process -Id $PID).Path
$failures = 0

function Check([string]$name, [bool]$ok) {
  if ($ok) { Write-Host "OK   $name" } else { Write-Host "FAIL $name"; $script:failures++ }
}

function New-TempDir {
  $dir = Join-Path ([IO.Path]::GetTempPath()) ("skills-test-" + [guid]::NewGuid())
  New-Item -ItemType Directory -Path $dir | Out-Null
  $dir
}

function Get-Skills([string]$dir) {
  if (Test-Path $dir) { (Get-ChildItem -Directory $dir | Sort-Object Name | ForEach-Object Name) -join ' ' } else { '' }
}

# Runs an installer in a child shell whose home is $homeDir, with no `claude`
# command on PATH. Returns its exit code.
function Invoke-Installer([string]$script, [string]$homeDir, [string]$arguments = '', [string]$cwd = $homeDir) {
  $command = "Set-Location '$cwd'; try { & '$script' $arguments } catch { exit 1 }; if (-not `$?) { exit 1 }; exit 0"
  # A failing installer writes to stderr: that must not stop the test run.
  $ErrorActionPreference = 'Continue'
  $env:USERPROFILE_BACKUP = $env:USERPROFILE
  $savedPath = $env:Path
  try {
    $env:USERPROFILE = $homeDir
    $env:Path = (($env:Path -split ';') | Where-Object { $_ -and -not (Test-Path (Join-Path $_ 'claude*')) }) -join ';'
    & $shell -NoProfile -ExecutionPolicy Bypass -Command $command *> $null
    $LASTEXITCODE
  } finally {
    $env:USERPROFILE = $env:USERPROFILE_BACKUP
    $env:Path = $savedPath
  }
}

$allSkills = (Get-ChildItem -Directory (Join-Path $root 'plugins/*/skills/*') | Sort-Object Name | ForEach-Object Name) -join ' '
$installer = Join-Path $root 'install.ps1'

$h = New-TempDir
$code = Invoke-Installer $installer $h
Check 'default without Claude Code: .agents only' ($code -eq 0 -and (Get-Skills "$h/.agents/skills") -eq $allSkills -and -not (Test-Path "$h/.claude"))

$h = New-TempDir; New-Item -ItemType Directory "$h/.claude" | Out-Null
Invoke-Installer $installer $h | Out-Null
Check 'default with ~/.claude: .agents and .claude' ((Get-Skills "$h/.agents/skills") -eq $allSkills -and (Get-Skills "$h/.claude/skills") -eq $allSkills)

$h = New-TempDir
Invoke-Installer $installer $h '-Agent all' | Out-Null
Check 'all: .agents, .claude and .cursor' ((Get-Skills "$h/.agents/skills") -and (Get-Skills "$h/.claude/skills") -and (Get-Skills "$h/.cursor/skills"))

$h = New-TempDir
Invoke-Installer $installer $h '-Agent claude' | Out-Null
Check 'claude only' ((Get-Skills "$h/.claude/skills") -and -not (Test-Path "$h/.agents"))

$h = New-TempDir
Check 'unknown agent fails' ((Invoke-Installer $installer $h '-Agent vim') -ne 0)
Check 'unknown skill fails' ((Invoke-Installer $installer $h '-Skill no-such-skill') -ne 0)

$h = New-TempDir
Invoke-Installer $installer $h '-Skill illustrate-it' | Out-Null
New-Item -ItemType File "$h/.agents/skills/illustrate-it/stale.txt" | Out-Null
Invoke-Installer $installer $h '-Skill illustrate-it' | Out-Null
Check 're-run replaces the old copy' (-not (Test-Path "$h/.agents/skills/illustrate-it/stale.txt"))

$h = New-TempDir; $project = New-TempDir
Invoke-Installer $installer $h '-Project -Skill illustrate-it' $project | Out-Null
Check '-Project installs into the current folder' (Test-Path "$project/.agents/skills/illustrate-it/SKILL.md")

foreach ($plugin in Get-ChildItem -Directory (Join-Path $root 'plugins')) {
  $h = New-TempDir
  Invoke-Installer (Join-Path $plugin.FullName 'install.ps1') $h | Out-Null
  Check "$($plugin.Name) installer installs only its own skills" ((Get-Skills "$h/.agents/skills") -eq (Get-Skills "$($plugin.FullName)/skills"))
}

if ($failures -eq 0) { Write-Host "INSTALLERS OK ($($PSVersionTable.PSEdition) $($PSVersionTable.PSVersion))" } else { Write-Host "$failures check(s) failed"; exit 1 }
