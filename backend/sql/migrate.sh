#!/usr/bin/env bash
# =============================================================================
# migrate.sh — Aplica las migraciones SQL pendientes de backend/sql/migrations
#
# Uso (en el servidor):
#   cd /var/www/latconecta/backend/sql
#   ./migrate.sh status            # muestra aplicadas y pendientes (no cambia nada)
#   ./migrate.sh apply             # aplica las pendientes, en orden
#   ./migrate.sh baseline <archivo> # marca un archivo como aplicado SIN ejecutarlo
#
# Base de datos: variable DB (por defecto latconecta_db), ejecutado como postgres:
#   DB=latconecta_db ./migrate.sh apply
#
# Reglas:
#   - Cada archivo se ejecuta en UNA transacción (psql -1) y con ON_ERROR_STOP:
#     si algo falla, no queda nada a medias y se detiene.
#   - Un archivo ya aplicado nunca se vuelve a ejecutar. Si su contenido cambió
#     después de aplicado, se avisa (checksum distinto) y se detiene.
#   - Nunca se editan migraciones ya aplicadas: los cambios van en un archivo nuevo.
# =============================================================================
set -euo pipefail
export PGOPTIONS="${PGOPTIONS:-} -c client_min_messages=warning"

DB="${DB:-latconecta_db}"
DIR="$(cd "$(dirname "$0")" && pwd)/migrations"
PSQL=(sudo -u postgres psql -d "$DB" -X -q -v ON_ERROR_STOP=1)
if [[ "${PSQL_DIRECT:-}" == "1" ]]; then
    PSQL=(psql -d "$DB" -X -q -v ON_ERROR_STOP=1)
fi

ensure_table() {
    "${PSQL[@]}" -c "CREATE TABLE IF NOT EXISTS schema_migrations (
        filename VARCHAR(255) PRIMARY KEY, checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        applied_by VARCHAR(100) NOT NULL DEFAULT CURRENT_USER);" >/dev/null
}

applied_checksum() {
    "${PSQL[@]}" -tA -c "SELECT checksum FROM schema_migrations WHERE filename = '$1';"
}

record() {
    "${PSQL[@]}" -c "INSERT INTO schema_migrations (filename, checksum) VALUES ('$1', '$2');" >/dev/null
}

cmd="${1:-status}"
ensure_table

case "$cmd" in
  status|apply)
    pending=0
    for f in $(ls "$DIR"/*.sql | sort); do
        name="$(basename "$f")"
        sum="$(sha256sum "$f" | cut -d' ' -f1)"
        done_sum="$(applied_checksum "$name")"
        if [[ -n "$done_sum" ]]; then
            if [[ "$done_sum" != "$sum" ]]; then
                echo "❌ $name fue modificado después de aplicarse (checksum distinto). Detenido."
                exit 1
            fi
            echo "✅ aplicada   $name"
            continue
        fi
        pending=$((pending + 1))
        if [[ "$cmd" == "status" ]]; then
            echo "⏳ pendiente  $name"
        else
            echo "▶️  aplicando $name ..."
            "${PSQL[@]}" -1 -f "$f"
            record "$name" "$sum"
            echo "✅ aplicada   $name"
        fi
    done
    if [[ "$cmd" == "status" ]]; then echo "Pendientes: $pending"; fi
    ;;
  baseline)
    f="$DIR/${2:?Indica el archivo, ej: 001_baseline_schema.sql}"
    [[ -f "$f" ]] || { echo "No existe $f"; exit 1; }
    name="$(basename "$f")"
    [[ -n "$(applied_checksum "$name")" ]] && { echo "Ya registrada: $name"; exit 0; }
    record "$name" "$(sha256sum "$f" | cut -d' ' -f1)"
    echo "✅ registrada sin ejecutar: $name (baseline)"
    ;;
  *)
    echo "Uso: $0 status | apply | baseline <archivo>"; exit 1 ;;
esac
