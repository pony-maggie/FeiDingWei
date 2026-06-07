#!/usr/bin/env bash
set -euo pipefail

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-3100}"

echo "Starting FeiDingWei locally on http://${HOST}:${PORT}"

PIDS="$(lsof -tiTCP:"$PORT" -sTCP:LISTEN || true)"

if [ -n "$PIDS" ]; then
  echo "Stopping existing process on port ${PORT}: ${PIDS}"
  kill $PIDS
  sleep 1

  if lsof -tiTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
    echo "Existing process did not stop cleanly; forcing shutdown on port ${PORT}."
    kill -9 $(lsof -tiTCP:"$PORT" -sTCP:LISTEN)
    sleep 1
  fi
fi

npm run prisma:seed
npm run dev -- --hostname "$HOST" --port "$PORT"
