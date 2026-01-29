#!/bin/bash
# 🛡️ OMEGA-SEED | The Universal Launcher
# 🌀 This is a wrapper for omega.ts to ensure portability.

if ! command -v deno &> /dev/null; then
    echo "⚠️ Deno not found. Please install it to breathe life into the lattice."
    exit 1
fi

deno run -A omega.ts "$@"

