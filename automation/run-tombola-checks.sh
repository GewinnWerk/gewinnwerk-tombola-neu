#!/bin/sh
set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
CONFIG_PATH=${1:-"$SCRIPT_DIR/config.json"}

exec node "$SCRIPT_DIR/tombola-runner.mjs" --mode all --config "$CONFIG_PATH"
