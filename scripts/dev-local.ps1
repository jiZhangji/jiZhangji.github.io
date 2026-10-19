[CmdletBinding()]
param(
    [ValidateSet('dev', 'preview', 'install', 'typecheck', 'build', 'generate', 'check:static', 'verify')]
    [string]$Action = 'dev',
    [switch]$Rebuild,
    [switch]$Check
)

$ErrorActionPreference = 'Stop'
$blogRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
if ([System.IO.Path]::GetPathRoot($blogRoot) -ine 'D:\') {
    throw 'These local launchers require the project to remain on D:; no files have been created.'
}
if (($Rebuild -or $Check) -and $Action -ne 'preview') {
    throw '-Rebuild and -Check apply only to the static preview. Use -Action verify for all checks.'
}

$blogLocal = Join-Path $blogRoot '.local'
$blogTemporary = Join-Path $blogLocal 'tmp'
$blogNpmCache = Join-Path $blogLocal 'npm-cache'
$blogOtherCache = Join-Path $blogLocal 'cache'
$blogEnvironment = @{
    TEMP = $blogTemporary
    TMP = $blogTemporary
    TMPDIR = $blogTemporary
    npm_config_cache = $blogNpmCache
    npm_config_update_notifier = 'false'
    XDG_CACHE_HOME = $blogOtherCache
    NUXT_TELEMETRY_DISABLED = '1'
    NUXT_PUBLIC_SITE_URL = 'http://127.0.0.1:4178'
    NUXT_APP_BASE_URL = '/'
}
$blogPreviousEnvironment = @{}
$blogPushedLocation = $false

function Invoke-BlogNpm {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)
    $blogNpmCommand = Get-Command 'npm.cmd' -CommandType Application -ErrorAction Stop
    & $blogNpmCommand.Source @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw ('npm {0} failed with exit code {1}.' -f ($Arguments -join ' '), $LASTEXITCODE)
    }
}

function Initialize-BlogDependencies {
    if (-not (Test-Path -LiteralPath (Join-Path $blogRoot 'node_modules/nuxt/package.json') -PathType Leaf)) {
        Write-Host 'Installing the locked dependencies on D: (network access may be required).'
        Invoke-BlogNpm -Arguments @('ci', '--no-audit', '--no-fund')
    }
}

try {
    $blogNodeCommand = Get-Command 'node.exe' -CommandType Application -ErrorAction Stop
    $blogNodeVersionText = & $blogNodeCommand.Source --version
    if ($LASTEXITCODE -ne 0) { throw 'Node.js could not be started.' }
    $blogVersionMatch = [regex]::Match([string]$blogNodeVersionText, '\d+\.\d+\.\d+')
    if (-not $blogVersionMatch.Success) { throw 'The Node.js version could not be identified.' }
    $blogNodeVersion = [version]$blogVersionMatch.Value
    $blogNodeSupported = $blogNodeVersion.Major -ge 24 -or
        ($blogNodeVersion.Major -eq 23 -and $blogNodeVersion.Minor -ge 4) -or
        ($blogNodeVersion.Major -eq 22 -and $blogNodeVersion.Minor -ge 13)
    if (-not $blogNodeSupported) {
        throw 'Node.js 24 LTS is recommended. Minimum: 22.13, or 23.4, with built-in node:sqlite.'
    }

    New-Item -ItemType Directory -Path $blogTemporary, $blogNpmCache, $blogOtherCache -Force | Out-Null
    foreach ($blogKey in $blogEnvironment.Keys) {
        $blogPreviousEnvironment[$blogKey] = [Environment]::GetEnvironmentVariable($blogKey, 'Process')
        [Environment]::SetEnvironmentVariable($blogKey, $blogEnvironment[$blogKey], 'Process')
    }
    Push-Location -LiteralPath $blogRoot
    $blogPushedLocation = $true
    Write-Host ('Project: {0}' -f $blogRoot)
    Write-Host ('Temporary files and caches: {0}' -f $blogLocal)

    switch ($Action) {
        'preview' {
            $blogIndex = Join-Path $blogRoot '.output/public/index.html'
            if ($Rebuild -or -not (Test-Path -LiteralPath $blogIndex -PathType Leaf)) {
                Initialize-BlogDependencies
                Write-Host 'Generating the static site for the local URL...'
                Invoke-BlogNpm -Arguments @('run', 'generate')
            }
            if ($Check) { Invoke-BlogNpm -Arguments @('run', 'check:static') }
            Write-Host 'Open http://127.0.0.1:4178 in your browser. Press Ctrl+C to stop.'
            Write-Host 'Static files only; no SSR server, background service, or external deployment.'
            & $blogNodeCommand.Source (Join-Path $blogRoot 'scripts/serve-static.mjs') --host 127.0.0.1 --port 4178
            if ($LASTEXITCODE -ne 0) { throw ('Static preview stopped with exit code {0}.' -f $LASTEXITCODE) }
        }
        'install' {
            Invoke-BlogNpm -Arguments @('ci', '--no-audit', '--no-fund')
        }
        'dev' {
            Initialize-BlogDependencies
            Write-Host 'Development mode: http://127.0.0.1:4178. Press Ctrl+C to stop.'
            Write-Host 'Stop any existing preview before starting development on the same port.'
            Invoke-BlogNpm -Arguments @('run', 'dev', '--', '--host', '127.0.0.1', '--port', '4178')
        }
        'verify' {
            Initialize-BlogDependencies
            foreach ($blogJob in @('typecheck', 'build', 'generate', 'check:static')) {
                Invoke-BlogNpm -Arguments @('run', $blogJob)
            }
        }
        'check:static' {
            Invoke-BlogNpm -Arguments @('run', 'check:static')
        }
        default {
            Initialize-BlogDependencies
            Invoke-BlogNpm -Arguments @('run', $Action)
        }
    }
}
finally {
    if ($blogPushedLocation) { Pop-Location }
    foreach ($blogKey in $blogPreviousEnvironment.Keys) {
        [Environment]::SetEnvironmentVariable($blogKey, $blogPreviousEnvironment[$blogKey], 'Process')
    }
}
