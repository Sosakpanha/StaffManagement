#!/usr/bin/env bash
#
# Build and publish the StaffManagement DACPAC to a target SQL Server.
#
# Usage:
#   ./database/scripts/deploy.sh
#
# Reads MSSQL_SA_PASSWORD and optional TARGET_SERVER / TARGET_DATABASE /
# TARGET_USER from the repo-root .env file (or the current environment).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SQLPROJ="$ROOT_DIR/database/StaffManagement.Database/StaffManagement.Database.sqlproj"
DACPAC="$ROOT_DIR/database/StaffManagement.Database/bin/Debug/StaffManagement.Database.dacpac"

# Load .env if present.
if [[ -f "$ROOT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT_DIR/.env"
  set +a
fi

: "${MSSQL_SA_PASSWORD:?MSSQL_SA_PASSWORD must be set (copy .env.example to .env)}"

TARGET_SERVER="${TARGET_SERVER:-localhost,1433}"
TARGET_DATABASE="${TARGET_DATABASE:-StaffManagement}"
TARGET_USER="${TARGET_USER:-sa}"

echo "==> Building DACPAC..."
dotnet build "$SQLPROJ" --configuration Debug --nologo --verbosity quiet

if ! command -v sqlpackage >/dev/null 2>&1; then
  echo "==> sqlpackage not found; installing as a dotnet global tool..."
  # --ignore-failed-sources skips private NuGet feeds that may be unreachable
  # from a clean checkout (the public nuget.org source is enough).
  dotnet tool install --global Microsoft.SqlPackage --ignore-failed-sources >/dev/null
  export PATH="$PATH:$HOME/.dotnet/tools"
fi

echo "==> Publishing $DACPAC"
echo "    target: $TARGET_USER@$TARGET_SERVER/$TARGET_DATABASE"
sqlpackage \
  /Action:Publish \
  /SourceFile:"$DACPAC" \
  /TargetServerName:"$TARGET_SERVER" \
  /TargetDatabaseName:"$TARGET_DATABASE" \
  /TargetUser:"$TARGET_USER" \
  /TargetPassword:"$MSSQL_SA_PASSWORD" \
  /TargetTrustServerCertificate:True \
  /p:BlockOnPossibleDataLoss=false

echo "==> Deploy complete."
