[CmdletBinding()]
param(
    [switch]$Rebuild,
    [switch]$Check
)

# The shared launcher configures D: temp/cache paths, then runs only the static
# loopback preview. It does not open a browser or start a background process.
$ErrorActionPreference = 'Stop'
& (Join-Path $PSScriptRoot 'dev-local.ps1') -Action preview -Rebuild:$Rebuild -Check:$Check
