param([Parameter(Mandatory)][string]$Destination)
$ErrorActionPreference = 'Stop'
$sourceRoot = Split-Path -Parent $PSScriptRoot
$targetRoot = [IO.Path]::GetFullPath($Destination)
if (Test-Path -LiteralPath $targetRoot) { throw 'Destination must be a new directory.' }
New-Item -ItemType Directory -Path $targetRoot | Out-Null
$directories = @('.github', 'assets', 'components', 'composables', 'content', 'data', 'github', 'i18n', 'layouts', 'lib', 'pages', 'plugins', 'public', 'scripts', 'server', 'utils', 'workers')
foreach ($name in $directories) { Copy-Item -LiteralPath (Join-Path $sourceRoot $name) -Destination $targetRoot -Recurse }
$files = @('.env.example', '.gitignore', '.node-version', 'app.config.ts', 'app.vue', 'content.config.ts', 'nuxt.config.ts', 'package.json', 'package-lock.json', 'README.md', 'tailwind.config.ts', 'tsconfig.json', 'tsconfig.portfolio.json', 'vercel.json', 'start-local.cmd')
foreach ($name in $files) { Copy-Item -LiteralPath (Join-Path $sourceRoot $name) -Destination $targetRoot }
New-Item -ItemType Directory -Path (Join-Path $targetRoot 'docs') | Out-Null
foreach ($name in @('content-audit.md', 'interactive-lab.md', 'PORTFOLIO_MAINTENANCE.md', 'pelican-public-notes.md')) {
  Copy-Item -LiteralPath (Join-Path $sourceRoot "docs/$name") -Destination (Join-Path $targetRoot 'docs')
}
Write-Output "Public snapshot: $targetRoot"
Write-Output 'Internal provenance, validation logs, caches, and Git history were excluded.'
