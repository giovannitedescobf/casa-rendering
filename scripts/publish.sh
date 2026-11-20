#!/usr/bin/env bash
# One command to publish, fast:  scripts/publish.sh "commit message" [--thumbs] [--full|--quick]
#  1. regenerate every generated scene (a second);
#  2. check-scene.mjs on every project: saved positions + clashes with walls / furniture (stops on a clash: user rule);
#  3. npm test: when only project data changed (no viewer, server, build or test code differs from origin/main) the quick
#     mode (SMOKE_MODEL=1: every Node check + each viewer loads all its objects without errors, ~10 s); otherwise, or
#     with --full, everything (~7 min on software GL); --quick forces the quick mode (only right after a full npm test
#     passed on the same files);
#  4. thumbnails only with --thumbs (a stale card picture is only a warning);
#  5. commit (trailer from PUBLISH_TRAILER), merge the remote (the site commits moved.json itself), push HEAD:main and the
#     current branch;
#  6. the site rebuild (~2-3 min) is watched in the background: tail /tmp/publish-wait.log (site address in the
#     untracked `git config publish.url`).
set -euo pipefail
cd "$(dirname "$0")/.."
PUBLISH_TRAILER="${PUBLISH_TRAILER:-$(git config --get publish.trailer || true)}"
MSG="${1:?usage: scripts/publish.sh \"message\" [--thumbs] [--full|--quick]}"; shift
THUMBS=0; FULL=0; QUICK=0
for a in "$@"; do case "$a" in --thumbs) THUMBS=1 ;; --full) FULL=1 ;; --quick) QUICK=1 ;; *) echo "unknown option $a" >&2; exit 2 ;; esac; done
step() { printf '== %s\n' "$*"; }
fail() { printf '\nPUBLISH STOPPED: %s\n' "$*" >&2; exit 1; }

step "regenerate scenes"
for pj in projects/*/project.json; do
  gen=$(node -e "const p=require('./$pj');process.stdout.write(p.generator||'')")
  [ -n "$gen" ] && { node "$(dirname "$pj")/$gen" >/dev/null || fail "generator $(dirname "$pj")/$gen"; }
done

step "saved positions and clashes"
for d in projects/*/; do
  [ -f "$d/scene.json" ] || continue
  out=$(node scripts/check-scene.mjs "$(basename "$d")" 2>&1) || { echo "$out" | sed -n '/clashes/,$p'; fail "clash in $(basename "$d") (walls and furniture are solid)"; }
done

if [ $THUMBS = 1 ]; then step "thumbnails"; npm run -s thumbs >/dev/null 2>&1 || fail "npm run thumbs"; fi

git fetch -q origin main 2>/dev/null || true
code_changed() { { git diff --name-only origin/main; git ls-files -o --exclude-standard; } | grep -qE '^(public/|server\.js|scripts/(smoke|build-static|projects|scene-kit)\.js|package)'; }
if [ $QUICK = 1 ] || { [ $FULL = 0 ] && ! code_changed; }; then
  step "tests (quick: only project data changed)"; MODE=1
else
  step "tests (full: viewer / server / build code changed)"; MODE=0
fi
out=$(SMOKE_MODEL=$MODE npm test 2>&1) || { echo "$out" | grep -E "FAIL|Error" | head -20; fail "npm test"; }
echo "$out" | tail -1

step "commit and push"
git add -A projects public scripts .claude .github CLAUDE.md README.md docs package.json package-lock.json 2>/dev/null || true
if git diff --cached --quiet; then echo "nothing to commit"; else
  git commit -q -m "$MSG${PUBLISH_TRAILER:+

$PUBLISH_TRAILER}" || fail "git commit"; git log --oneline -1; fi
for i in 1 2 3 4; do git pull --no-rebase -q origin main && break; [ $i = 4 ] && fail "git pull"; sleep $((i * 2)); done
for i in 1 2 3 4; do git push -q origin HEAD:main 2>/dev/null && break; [ $i = 4 ] && fail "git push"; sleep $((i * 2)); done
br=$(git rev-parse --abbrev-ref HEAD); [ "$br" != main ] && { git push -q origin HEAD 2>/dev/null || true; }

URL=$(git config --get publish.url || true)
[ -z "$URL" ] && { echo "pushed (no publish.url: the site is not watched)"; exit 0; }
LOG=/tmp/publish-wait.log
( for pj in projects/*/scene.json; do
    id=$(basename "$(dirname "$pj")"); want=$(sha1sum "$pj" | cut -c1-40)
    for i in $(seq 1 60); do
      [ "$(curl -fsS "${URL%/}/$id/scene.json" 2>/dev/null | sha1sum | cut -c1-40)" = "$want" ] && { echo "live: ${URL%/}/$id/"; break; }
      [ $i = 60 ] && echo "NOT LIVE after 10 min: $id"; sleep 10
    done
  done ) > "$LOG" 2>&1 &
echo "pushed; the site updates in ~2-3 min (watch: cat $LOG)"
