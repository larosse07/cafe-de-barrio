#!/bin/sh
set -e

API_URL="${API_BASE_URL:-http://localhost:8080/api}"
cat <<EOF > /usr/share/nginx/html/assets/runtime-config.json
{
  "apiBaseUrl": "${API_URL}"
}
EOF

exec "$@"
