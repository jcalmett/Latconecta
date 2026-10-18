# Migraciones SQL — Latconecta

Cada cambio de esquema o de configuración en la base de datos se versiona aquí,
como un archivo numerado en `migrations/`. Así todas las instalaciones (Perú,
México, producción, USA) reciben exactamente los mismos cambios, y cada BD sabe
qué tiene aplicado en la tabla `schema_migrations`.

## Reglas

1. Un archivo por cambio: `NNN_descripcion.sql` (NNN = 000, 001, 002…).
2. Nunca se edita un archivo ya aplicado. Si hay que corregir algo, se crea uno nuevo.
3. Cada archivo se ejecuta completo en una transacción: si falla, no deja nada a medias.
4. **Nunca se escriben credenciales** (contraseñas, API keys, secret keys) en estos
   archivos. Las credenciales se cargan desde el admin (formulario del vendor).
5. Se aplica con `migrate.sh`, no a mano.

## Uso en el servidor

```bash
cd /var/www/latconecta/backend/sql
./migrate.sh status      # qué está aplicado y qué falta (no cambia nada)
./migrate.sh apply       # aplica lo pendiente, en orden
```

Otra base de datos: `DB=otra_bd ./migrate.sh status`.

## Baseline (esquema inicial)

`001_baseline_schema.sql` es el esquema de la BD existente al empezar el control de
versiones, extraído con:

```bash
sudo -u postgres pg_dump -d latconecta_db --schema-only --no-owner --no-privileges \
     --exclude-table=schema_migrations > 001_baseline_schema.sql
```

- En una BD que **ya tiene** ese esquema (CalmetServer): se registra sin ejecutarlo
  → `./migrate.sh baseline 001_baseline_schema.sql`
- En una **instalación nueva** (México, producción): se ejecuta normalmente con
  `./migrate.sh apply` y crea todas las tablas. Los datos iniciales (países,
  servicios, compañías, productos) se cargan aparte.

## Migraciones

| Archivo | Contenido |
|---|---|
| 000_schema_migrations.sql | Tabla de control de migraciones |
| 001_baseline_schema.sql | Esquema de la BD al iniciar el control (pendiente de generar en el servidor) |
| 002_latcom_api_v09.sql | LATCOM en su nueva plataforma: URLs, mapping de provisión (JWT bearer) y de saldo; desactiva mappings antiguos |
