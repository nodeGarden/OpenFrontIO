# ============================================
# Stage 1: Base with all system dependencies
# ============================================
FROM node:24-slim AS base-with-deps

RUN apt-get update && apt-get install -y \
    nginx \
    supervisor \
    git \
    curl \
    jq \
    wget \
    apache2-utils \
    && rm -rf /var/lib/apt/lists/*

RUN curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb > cloudflared.deb \
    && dpkg -i cloudflared.deb \
    && rm cloudflared.deb

RUN sed -i 's/worker_connections [0-9]*/worker_connections 8192/' /etc/nginx/nginx.conf \
    && rm -f /etc/nginx/sites-enabled/default

RUN mkdir -p /var/log/supervisor /etc/cloudflared && \
    chown -R node:node /etc/cloudflared && \
    chmod -R 755 /etc/cloudflared

WORKDIR /usr/src/app

# ============================================
# Stage 2: Build stage (build + prod deps)
# ============================================
FROM base-with-deps AS builder
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT="$GIT_COMMIT"
ENV HUSKY=0

# Install all dependencies for building
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .
RUN npm run build-prod && \
    echo "$GIT_COMMIT" > static/commit.txt && \
    rm -rf resources/maps

# Install production dependencies in a separate location
RUN mkdir /prod-deps && \
    cp package*.json /prod-deps/ && \
    cd /prod-deps && \
    NPM_CONFIG_IGNORE_SCRIPTS=1 npm ci --omit=dev

# ============================================
# Stage 3: Final production image
# ============================================
FROM base-with-deps
ARG GIT_COMMIT=unknown
ENV GIT_COMMIT="$GIT_COMMIT"
ENV HUSKY=0
ENV NPM_CONFIG_IGNORE_SCRIPTS=1

# Copy configs
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY startup.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/startup.sh

# Copy production dependencies
COPY --from=builder /prod-deps/node_modules ./node_modules
COPY package.json ./

# Copy application source (excluding maps which were removed in builder)
COPY --from=builder /usr/src/app/ ./

ENV CF_CONFIG_PATH=/etc/cloudflared/config.yml
ENV CF_CREDS_PATH=/etc/cloudflared/creds.json

ENTRYPOINT ["/usr/local/bin/startup.sh"]