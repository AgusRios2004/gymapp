#!/bin/sh
set -e

HOST=${DB_HOST:-db}
PORT=${DB_PORT:-3306}
USER=${DB_USER:-user_gym}
PASS=${DB_PASSWORD:-user_gym}

echo "Waiting for database at $HOST:$PORT..."

# Try connecting with netcat until successful
while ! nc -z "$HOST" "$PORT"; do
  echo "Database not ready yet - sleeping"
  sleep 1
done

echo "Database reachable, starting application"
exec java -jar app.jar
