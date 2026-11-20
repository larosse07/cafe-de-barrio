# ==============================================================================
# CAFÉ DE BARRIO - Frontend Multi-stage Dockerfile (Angular + Nginx)
# Inyecta API_BASE_URL en runtime-config.json al iniciar sin recompilar.
# ==============================================================================
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/cafe-de-barrio-frontend/browser /usr/share/nginx/html
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
