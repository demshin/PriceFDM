#!/bin/bash
set -e

echo "============================================"
echo " PriceFDM — сборка macOS-приложения"
echo "============================================"
echo

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
DIST_DIR="$ROOT_DIR/dist-electron"
RELEASE_DIR="$ROOT_DIR/release"

# Собираем проект
echo "[1/3] Сборка..."
cd "$ROOT_DIR"
npm run electron:build:mac

echo
echo "[2/3] Копирование файлов в папку release/..."
mkdir -p "$RELEASE_DIR"

COPIED=0
for f in "$DIST_DIR"/*.dmg; do
    [ -f "$f" ] || continue
    echo "  Копирую: $(basename "$f")"
    cp -f "$f" "$RELEASE_DIR/"
    COPIED=$((COPIED + 1))
done

if [ "$COPIED" -eq 0 ]; then
    echo "[ПРЕДУПРЕЖДЕНИЕ] Файлы .dmg в dist-electron/ не найдены."
    echo "Смотрите содержимое папки dist-electron/ вручную."
else
    echo
    echo "[3/3] Готово! Скопировано файлов: $COPIED"
    echo "Папка с файлами: $RELEASE_DIR"
fi

echo
read -rp "Нажмите Enter для выхода..."
