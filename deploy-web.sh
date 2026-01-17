#!/usr/bin/env bash
set -euo pipefail

# Prosty skrypt do zbudowania aplikacji webowej i wdrożenia jej
# na zdalny serwer przez SFTP.
#
# Wymagane zmienne środowiskowe:
#   DEPLOY_HOST  - adres hosta (np. example.com)
#   DEPLOY_USER  - użytkownik SSH/SFTP (np. deploy)
#   DEPLOY_PATH  - ścieżka docelowa na serwerze (np. /var/www/rallyhq)
# Opcjonalne:
#   DEPLOY_PORT  - port SSH/SFTP (domyślnie 22)
#   DEPLOY_MODE  - tryb Vite (np. production, test, staging) używany przy buildzie,
#                  decyduje z którego pliku .env* zostaną wczytane zmienne.
#
# Przykład użycia:
#   DEPLOY_HOST=example.com \
#   DEPLOY_USER=deploy \
#   DEPLOY_PATH=/var/www/rallyhq \
#   DEPLOY_PORT=22 \
#   ./deploy-web.sh

# DEPLOY_USER=deploy \ 
#  DEPLOY_PATH=/var/www/rallyhq_test \
#  DEPLOY_PORT=22 \
#  DEPLOY_MODE=test \
# ./deploy-web.sh

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

: "${DEPLOY_HOST:?Musisz ustawić DEPLOY_HOST (adres serwera).}"
: "${DEPLOY_USER:?Musisz ustawić DEPLOY_USER (użytkownik na serwerze).}"
: "${DEPLOY_PATH:?Musisz ustawić DEPLOY_PATH (ścieżka docelowa na serwerze).}"
DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_MODE="${DEPLOY_MODE:-production}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Błąd: pnpm nie jest zainstalowany ani dostępny w PATH." >&2
  exit 1
fi

if ! command -v ssh >/dev/null 2>&1; then
  echo "Błąd: ssh nie jest zainstalowany ani dostępny w PATH." >&2
  exit 1
fi

if ! command -v sftp >/dev/null 2>&1; then
  echo "Błąd: sftp nie jest zainstalowany ani dostępny w PATH." >&2
  exit 1
fi

cd "$ROOT_DIR"

echo "[1/3] Budowanie aplikacji @rallyhq/web w trybie '$DEPLOY_MODE'..."
pnpm --filter @rallyhq/web build -- --mode "$DEPLOY_MODE"

LOCAL_DIST="apps/web/dist"

if [ ! -d "$LOCAL_DIST" ]; then
  echo "Błąd: katalog $LOCAL_DIST nie istnieje. Czy build się powiódł?" >&2
  exit 1
fi

echo "[2/3] Przygotowywanie zdalnego katalogu $DEPLOY_PATH na $DEPLOY_HOST..."
ssh -p "$DEPLOY_PORT" "$DEPLOY_USER@$DEPLOY_HOST" "mkdir -p '$DEPLOY_PATH' && rm -rf '$DEPLOY_PATH'/*"

echo "[3/3] Wysyłanie plików przez SFTP..."
sftp -P "$DEPLOY_PORT" "$DEPLOY_USER@$DEPLOY_HOST" <<EOF
cd $DEPLOY_PATH
put -r $LOCAL_DIST/*
EOF

echo "Wdrożenie zakończone pomyślnie. Pliki znajdują się w $DEPLOY_USER@$DEPLOY_HOST:$DEPLOY_PATH"