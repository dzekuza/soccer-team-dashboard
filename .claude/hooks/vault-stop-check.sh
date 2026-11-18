#!/bin/bash
# Stop hook: nudge Claude to sync the obsidian/ vault, but only when this session
# edited a real project file outside obsidian/ AND the vault has not been updated
# since that edit. Fires at most once per batch of code edits.
#
# Skips (does not count as a code edit):
#   - files outside the project dir (scratchpad, ~/.claude, other repos)
#   - .claude/, .git/, node_modules/, .next/, dist/, build/ inside the project
#   - edits to obsidian/ itself (those count as "vault updated")
# Never blocks when stop_hook_active is true (loop guard).
set -euo pipefail

input="$(cat)"
session_id="$(printf '%s' "$input" | jq -r '.session_id // empty')"
transcript="$(printf '%s' "$input" | jq -r '.transcript_path // empty')"
active="$(printf '%s' "$input" | jq -r '.stop_hook_active // false')"
project_dir="${CLAUDE_PROJECT_DIR:-$(printf '%s' "$input" | jq -r '.cwd // empty')}"

if [ "$active" = "true" ] || [ -z "$session_id" ] || [ -z "$transcript" ] || [ ! -f "$transcript" ] || [ -z "$project_dir" ]; then
  exit 0
fi

marker="${TMPDIR:-/tmp}/claude-vault-stop-${session_id}"
last_checked=0
[ -f "$marker" ] && last_checked="$(cat "$marker" 2>/dev/null || echo 0)"

# Prints "<last_code_edit_ts> <last_vault_edit_ts>" (epoch seconds, 0 if none).
read -r last_code last_vault <<EOF
$(python3 - "$transcript" "$project_dir" <<'PY'
import json, sys, datetime

path, project = sys.argv[1], sys.argv[2].rstrip("/") + "/"
SKIP = ("/.claude/", "/.git/", "/node_modules/", "/.next/", "/dist/", "/build/")
last_code = 0.0
last_vault = 0.0
try:
    with open(path) as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except Exception:
                continue
            if d.get("type") != "assistant":
                continue
            ts = d.get("timestamp")
            if not ts:
                continue
            try:
                t = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00")).timestamp()
            except Exception:
                continue
            for c in d.get("message", {}).get("content", []) or []:
                if not isinstance(c, dict) or c.get("type") != "tool_use":
                    continue
                if c.get("name") not in ("Edit", "Write", "NotebookEdit", "MultiEdit"):
                    continue
                fp = (c.get("input", {}) or {}).get("file_path") or (c.get("input", {}) or {}).get("notebook_path") or ""
                if not fp.startswith(project):
                    continue
                rel = "/" + fp[len(project):]
                if rel.startswith("/obsidian/"):
                    last_vault = max(last_vault, t)
                    continue
                if any(s in rel for s in SKIP):
                    continue
                last_code = max(last_code, t)
except FileNotFoundError:
    pass
print(last_code, last_vault)
PY
)
EOF

now="$(date +%s)"
should_block="$(python3 -c "print('1' if float('$last_code') > float('$last_checked') and float('$last_code') > float('$last_vault') else '0')")"
echo "$now" > "$marker"

if [ "$should_block" = "1" ]; then
  echo '{"decision":"block","reason":"Project files were edited and obsidian/ has not been updated since. Update the matching vault docs now: catalog notes under obsidian/frontend/ for components/hooks/utils, obsidian/meta/changelog.md for notable changes, obsidian/meta/decisions-log.md for new architectural decisions, and always obsidian/meta/status.md (rewrite the live snapshot: current focus, in progress, next) plus a short entry at the top of obsidian/meta/session-log.md (what changed, status, next)."}'
fi

exit 0
