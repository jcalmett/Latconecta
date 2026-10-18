-- =============================================================================
-- 000_schema_migrations.sql
-- Tabla de control de migraciones aplicadas en esta base de datos.
-- La crea migrate.sh automáticamente si no existe; este archivo la documenta
-- y la deja registrada como primera migración.
-- =============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
    filename    VARCHAR(255) PRIMARY KEY,
    checksum    VARCHAR(64)  NOT NULL,
    applied_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    applied_by  VARCHAR(100) NOT NULL DEFAULT CURRENT_USER
);

COMMENT ON TABLE schema_migrations IS
    'Migraciones SQL aplicadas (backend/sql/migrations). Gestionada por backend/sql/migrate.sh';
