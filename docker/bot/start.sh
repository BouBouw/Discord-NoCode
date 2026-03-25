#!/bin/sh
set -e

MYSQL_DATABASE="${DB_NAME:-bot_db}"
MYSQL_USER="${DB_USER:-botuser}"
MYSQL_PASSWORD="${DB_PASSWORD:-password}"
MYSQL_DATA_DIR="/var/lib/mysql"

# ── 0. Ensure runtime directories exist ──────────────────────────────
mkdir -p /run/mysqld
chown -R mysql:mysql /run/mysqld
chown -R mysql:mysql "${MYSQL_DATA_DIR}" 2>/dev/null || true

# ── 1. Initialize data directory if first start ───────────────────────
if [ ! -d "${MYSQL_DATA_DIR}/mysql" ]; then
  echo "[MySQL] Initializing data directory..."
  mysql_install_db --user=mysql --datadir="${MYSQL_DATA_DIR}" --skip-test-db 2>/dev/null
  echo "[MySQL] Data directory initialized."
fi

# ── 2. Start MySQL server ─────────────────────────────────────────────
echo "[MySQL] Starting server..."
mysqld --no-defaults \
       --user=mysql \
       --datadir="${MYSQL_DATA_DIR}" \
       --socket=/run/mysqld/mysqld.sock \
       --bind-address=0.0.0.0 \
       --port=3306 \
       --character-set-server=utf8mb4 \
       --collation-server=utf8mb4_unicode_ci \
       --skip-name-resolve &
MYSQL_PID=$!

# ── 3. Wait for MySQL to accept connections (via socket — always ready first) ──
echo "[MySQL] Waiting for server..."
i=0
until mysqladmin ping --socket=/run/mysqld/mysqld.sock --silent 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -gt 40 ]; then
    echo "[MySQL] ERROR: Server failed to start!" >&2
    exit 1
  fi
  sleep 1
done
echo "[MySQL] Server ready."

# ── 4. Bootstrap database & user (idempotent) ─────────────────────────
mysql -uroot --socket=/run/mysqld/mysqld.sock <<EOSQL
CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'%'
  IDENTIFIED BY '${MYSQL_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${MYSQL_DATABASE}\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
EOSQL
echo "[MySQL] Database '${MYSQL_DATABASE}' ready for user '${MYSQL_USER}'."

# ── 5. Start Node.js bot ──────────────────────────────────────────────
echo "[Bot] Starting Node.js process..."
node /app/index.js &
NODE_PID=$!

# ── 6. Wait — exit when Node exits ───────────────────────────────────
wait $NODE_PID
echo "[Bot] Process exited, shutting down MySQL..."
kill "$MYSQL_PID" 2>/dev/null || true
