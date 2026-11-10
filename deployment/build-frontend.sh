#!/bin/sh
set -eu
cd "$(dirname "$0")/../frontend"
node node_modules/typescript/bin/tsc -b
node node_modules/vite/bin/vite.js build
node scripts/check-no-devtools-in-build.mjs
