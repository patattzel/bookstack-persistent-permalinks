#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="${ROOT_DIR}/dist"
OUT_FILE="${OUT_DIR}/bookstack-persistent-permalinks.zip"

mkdir -p "${OUT_DIR}"
rm -f "${OUT_FILE}"

cd "${ROOT_DIR}"
zip -r "${OUT_FILE}" \
  bookstack-module.json \
  functions.php \
  lang \
  public \
  views \
  README.md
