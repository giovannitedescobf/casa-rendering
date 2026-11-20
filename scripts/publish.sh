#!/usr/bin/env bash
# One command to publish: regenerate every generated scene, refresh the thumbnails, run the tests, commit, merge the
# remote (the site commits moved.json itself), push and wait until the site serves the new scene.
#   scripts/publish.sh "commit message" [--no-test]
# The site address is read from the untracked git config:  git config publish.url https://<site>/   (no trailing path)
# Stops at the first error and says where. Commit trailers come from PUBLISH_TRAILER (optional, multi-line).
set -euo pipefail
cd "$(dirname "$0")/.."
MSG="${1:?usage: scripts/publish.sh \"message\" [--no-test]}"; TEST=1; [ "${2:-}" = "--no-test" ] && TEST=0
step() { printf '\n== %s\n' "$*"; }
fail() { printf '\nPUBLISH STOPPED: %s\n' "$*" >&2; exit 1; }

step "regenerate scenes"
for pj in projects/*/project.json; do
  gen=$(node -e "const p=require('./$pj');process.stdout.write(p.generator||'')")
  [ -n "$gen" ] && { node "$(dirname "$pj")/$gen" >/dev/null || fail "generator $(dirname "$pj")/$gen"; }
done

step "thumbnails"
npm run -s thumbs >/dev/null 2>&1 || fail "npm run thumbs"

if [ $TEST = 1 ]; then
  git fetch -q origin main 2>/dev/null || true
  # only the model changed (no viewer, server or test code): the slow engine checks (indirect light, quality, ~4 min) are skipped
  if git diff --name-only origin/main -- public server.js scripts/smoke.js scripts/build-static.js scripts/projects.js | grep -q .; then Q=0; else Q=1; fi
  step "tests (npm test$( [ $Q = 1 ] && echo ', quick: viewer unchanged'))"
  out=$(SMOKE_QUICK=$Q npm test 2>&1) || { echo "$out" | grep -E "FAIL|Error" | head -20; fail "npm test"; }
  echo "$out" | tail -1
fi

step "commit"
git add -A projects public scripts .claude CLAUDE.md README.md docs 2>/dev/null || true
if git diff --cached --quiet; then echo "nothing to commit"; else
  git commit -q -m "$MSG${PUBLISH_TRAILER:+

$PUBLISH_TRAILER}" || fail "git commit"; git log --oneline -1; fi

step "merge the remote and push"
for i in 1 2 3 4; do git pull --no-rebase -q origin main && break; sleep $((i * 2)); done || fail "git pull"
for i in 1 2 3 4; do git push -q origin HEAD:main 2>/dev/null && break; [ $i = 4 ] && fail "git push"; sleep $((i * 2)); done
br=$(git rev-parse --abbrev-ref HEAD); [ "$br" != main ] && git push -q origin HEAD 2>/dev/null || true

URL=$(git config --get publish.url || true)
[ -z "$URL" ] && { echo "pushed (no publish.url set: not waiting for the site)"; exit 0; }
step "waiting for the site"
for pj in projects/*/scene.json; do
  id=$(basename "$(dirname "$pj")"); want=$(sha1sum "$pj" | cut -c1-40)
  for i in $(seq 1 60); do
    got=$(curl -fsS "${URL%/}/$id/scene.json" 2>/dev/null | sha1sum | cut -c1-40 || true)
    [ "$got" = "$want" ] && { echo "live: ${URL%/}/$id/"; break; }
    [ $i = 60 ] && fail "the site did not update in 10 minutes ($id)"; sleep 10
  done
done
