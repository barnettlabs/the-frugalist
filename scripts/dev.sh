#!/usr/bin/env bash
#
# One command to bring up the whole local stack.
#
# The three processes (API, worker, web) are only the last step. The steps
# before them are the ones that have actually cost time:
#
#   - contracts must be BUILT, not just present. Its package.json exports point
#     at dist/, so tsx and vitest both resolve through dist - source changes are
#     invisible until it is rebuilt, and a missing dist fails module resolution
#     outright rather than falling back to source.
#   - the database must be MIGRATED. A fresh container starts empty, and an
#     empty schema surfaces as `relation does not exist` at the first query,
#     which reads like a code fault rather than a missing setup step.
#
# Usage:  pnpm dev              from the repo root
#         pnpm dev --no-web     API and worker only
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

WITH_WEB=1
[[ "${1:-}" == "--no-web" ]] && WITH_WEB=0

# Every child dies with this script. Without the trap, Ctrl-C leaves the API
# holding :8787 and the next run fails with EADDRINUSE.
pids=()
cleanup() {
	trap - INT TERM EXIT
	[[ ${#pids[@]} -gt 0 ]] && kill "${pids[@]}" 2>/dev/null || true
	wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

step() { printf '\033[1;34m==>\033[0m %s\n' "$1"; }

step 'Starting Postgres, Valkey and Mailpit'
docker compose up -d --wait

step 'Building @frugalist/contracts'
pnpm --filter @frugalist/contracts build >/dev/null

step 'Applying migrations'
pnpm --filter @frugalist/server db:migrate 2>&1 | grep -iE 'applied successfully|error' || true

# Prefix each stream so three interleaved logs stay readable.
run() {
	local name=$1 colour=$2
	shift 2
	"$@" 2>&1 | sed -u "s/^/$(printf '\033[%sm[%s]\033[0m ' "$colour" "$name")/" &
	pids+=($!)
}

step 'Starting processes - Ctrl-C stops all of them'
echo
run api    '1;32' pnpm --filter @frugalist/server dev
run worker '1;33' pnpm --filter @frugalist/server dev:worker
[[ $WITH_WEB == 1 ]] && run web '1;36' pnpm --filter thefrugalist-web dev

cat <<EOF

  API      http://localhost:8787     health: /health
  Web      http://localhost:5173     (vite binds ::1 - 127.0.0.1 will not answer)
  Mailpit  http://localhost:58025

EOF

wait
