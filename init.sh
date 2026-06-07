#!/bin/bash
set -euo pipefail

echo "=== FeiDingWei Harness Initialization ==="

if [ ! -f package.json ]; then
  echo "No package.json yet."
  echo "Current project is in planning/harness setup state."
  echo ""
  echo "Available project files:"
  find . -maxdepth 3 -type f | sort
  echo ""
  echo "Next steps:"
  echo "1. Read feature_list.json."
  echo "2. Pick feat-001 or the first unblocked feature."
  echo "3. Implement only that feature."
  exit 0
fi

if [ -f package-lock.json ]; then
  PM="npm"
elif [ -f pnpm-lock.yaml ]; then
  PM="pnpm"
elif [ -f yarn.lock ]; then
  PM="yarn"
elif [ -f bun.lock ] || [ -f bun.lockb ]; then
  PM="bun"
else
  PM="npm"
fi

echo "=== Installing dependencies with $PM ==="
if [ "$PM" = "npm" ]; then
  npm install
else
  "$PM" install
fi

if [ -d prisma ]; then
  echo "=== Generating Prisma client ==="
  if [ "$PM" = "npm" ]; then
    npm run prisma:generate
  else
    "$PM" run prisma:generate
  fi
fi

run_script_if_present() {
  local script="$1"
  node -e "const s=require('./package.json').scripts||{}; process.exit(s['$script']?0:1)" && {
    echo "=== Running $script ==="
    if [ "$PM" = "npm" ]; then
      npm run "$script"
    else
      "$PM" run "$script"
    fi
  }
}

run_script_if_present lint
run_script_if_present test
run_script_if_present build

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Read feature_list.json to see current feature state."
echo "2. Pick one unfinished unblocked feature."
echo "3. Implement only that feature."
echo "4. Re-run ./init.sh before claiming done."
