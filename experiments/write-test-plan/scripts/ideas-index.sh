#!/usr/bin/env bash
# Thin shim — delegates to ideas-index.ts
exec npx tsx "$(dirname "$0")/ideas-index.ts" "$@"
