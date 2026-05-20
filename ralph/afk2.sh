#!/bin/bash
set -eo pipefail

iterations="${1:-}"

if [ -n "$(git status --porcelain)" ]; then
  echo "Working tree is dirty. Commit or stash before running $(basename "$0")." >&2
  git status --short >&2
  exit 1
fi

# Read a single YAML frontmatter field from a file (between the first two --- lines)
get_frontmatter() {
  local file="$1" field="$2"
  awk -v field="$field" '
    /^---$/ { fm++; next }
    fm == 1 && $0 ~ ("^" field ":") { sub(/^[^:]+:[[:space:]]*/, ""); print; exit }
    fm >= 2 { exit }
  ' "$file"
}

# Extract referenced blocker filenames from the "## Blocked by" section
get_blockers() {
  local file="$1"
  awk '
    /^## Blocked by/ { in_section=1; next }
    in_section && /^## /  { exit }
    in_section && /`issues\/[0-9]/ {
      s = $0
      gsub(/.*`issues\//, "", s)
      gsub(/`.*/, "", s)
      print s
    }
  ' "$file"
}

# Returns 0 (true) if an issue is AFK and all its blockers are done
is_eligible() {
  local file="$1"
  local mode
  mode=$(get_frontmatter "$file" "mode")

  if [[ "$mode" == "hitl" ]]; then
    echo "  skip [HITL]    $(basename "$file")" >&2
    return 1
  fi

  while IFS= read -r blocker; do
    [[ -z "$blocker" ]] && continue
    if [[ ! -f "issues/done/$blocker" ]]; then
      echo "  skip [blocked] $(basename "$file") — waiting on $blocker" >&2
      return 1
    fi
  done < <(get_blockers "$file")

  return 0
}

# jq filter to extract streaming text from assistant messages
stream_text='select(.type == "assistant").message.content[]? | select(.type == "text").text // empty | gsub("\n"; "\r\n") | . + "\r\n\n"'

# jq filter to extract final result
final_result='select(.type == "result").result // empty'

tmpfile=""
cleanup_tmp() {
  if [ -n "$tmpfile" ] && [ -f "$tmpfile" ]; then
    rm -f "$tmpfile"
  fi
}
trap cleanup_tmp EXIT

max_iterations="${iterations:-999}"

for ((i=1; i<=max_iterations; i++)); do
  # Rescan eligible issues each iteration so newly unblocked issues are picked up
  eligible_issues=()
  for issue in issues/[0-9]*.md; do
    [[ -f "$issue" ]] || continue
    if is_eligible "$issue"; then
      eligible_issues+=("$issue")
    fi
  done

  if [[ ${#eligible_issues[@]} -eq 0 ]]; then
    echo "No more eligible issues. Ralph complete after $((i-1)) iterations." >&2
    exit 0
  fi

  echo "" >&2
  echo "=== Ralph iteration $i — eligible issues ===" >&2
  for f in "${eligible_issues[@]}"; do echo "  ✓ $(basename "$f")" >&2; done
  echo "" >&2

  tmpfile=$(mktemp)

  commits=$(git log -n 5 --format="%H%n%ad%n%B---" --date=short 2>/dev/null || echo "No commits found")
  issues=$(cat "${eligible_issues[@]}")
  prompt=$(cat ralph/prompt.md)

  claude \
    --verbose \
    --print \
    --output-format stream-json \
    --dangerously-skip-permissions \
    "Previous commits: $commits Issues: $issues $prompt" \
  | grep --line-buffered '^{' \
  | tee "$tmpfile" \
  | jq --unbuffered -rj "$stream_text"

  result=$(jq -r "$final_result" "$tmpfile")

  rm -f "$tmpfile"
  tmpfile=""

  if [[ "$result" == *"<promise>NO MORE TASKS</promise>"* ]]; then
    echo "Ralph complete after $i iterations."
    exit 0
  fi
done
